import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { requireFeature } from "../../shared/planGuard.ts";

// Clocking in and out of a job. The shop, the caller and the job are resolved
// from the signed-in user and the job record, never trusted from the request,
// and the "one job at a time" rule is applied here on the server so a
// technician cannot bypass it from the browser.

function rowsOf(page: any) {
  if (Array.isArray(page)) return page;
  return page?.items || [];
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }
    if (!user) {
      return Response.json(
        { error: "Please sign in to track job time." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");
    const jobId = String(body?.job_id || "");
    const entryId = String(body?.entry_id || "");
    if (
      !["clock_in", "clock_out", "status", "update_entry", "delete_entry"].includes(
        action
      )
    ) {
      return Response.json(
        { error: "That time action is not supported." },
        { status: 400 }
      );
    }
    const isEntryAction =
      action === "update_entry" || action === "delete_entry";
    if (isEntryAction ? !entryId : !jobId) {
      return Response.json(
        { error: "That time action is missing its record." },
        { status: 400 }
      );
    }

    const sr = base44.asServiceRole;

    // The gate resolves the shop from the caller's account — never from the
    // request — and refuses the write outright when job time tracking is not
    // part of the shop's plan, so a hand-made request cannot bypass the tier.
    const guard = await requireFeature(base44, user, "job_time_clock");
    if (!guard.ok) return guard.response;
    const shopId = guard.shop.id;

    // A technician asks only about their own clock: whether they are still
    // running on this job, or on another one. Everyone else's times stay out
    // of reach, because the records themselves are administrator-only.
    if (action === "status") {
      const minePage = await sr.entities.JobTimeEntry.filter(
        { shop_id: shopId, staff_email: user.email },
        { sort: "-clock_in", limit: 100 }
      );
      const open = rowsOf(minePage).filter((e: any) => !e.clock_out);
      return Response.json({
        open_entry: open.find((e: any) => e.job_id === jobId) || null,
        open_elsewhere: open.find((e: any) => e.job_id !== jobId) || null,
      });
    }

    // Correcting or removing recorded time is an administrator's job: it is
    // refused for everyone else here, not just hidden in the browser. The
    // duration is recomputed from the corrected timestamps, and the change is
    // written to the audit trail because it moves a person's hours.
    if (isEntryAction) {
      if (user.role !== "admin") {
        return Response.json(
          { error: "Only an administrator can change recorded time." },
          { status: 403 }
        );
      }

      const entry: any = await sr.entities.JobTimeEntry.get(entryId).catch(
        () => null
      );
      if (!entry || entry.shop_id !== shopId) {
        return Response.json(
          { error: "That time entry is not part of your shop." },
          { status: 403 }
        );
      }

      const showTime = (iso: string) =>
        iso ? new Date(iso).toLocaleString("en-US") : "still running";
      const jobLabel = entry.job_label || "a job";
      const actorName = user.full_name || user.email || "Administrator";
      const audit = {
        shop_id: shopId,
        actor_name: actorName,
        actor_email: user.email || "",
        category: "Time Clock",
        target: jobLabel,
        occurred_at: new Date().toISOString(),
      };

      if (action === "delete_entry") {
        await sr.entities.JobTimeEntry.delete(entryId);
        await sr.entities.AuditLog.create({
          ...audit,
          action: "delete",
          summary: `Deleted ${entry.staff_name || "a technician"}'s time on ${jobLabel}`,
          details: `${showTime(entry.clock_in)} – ${showTime(entry.clock_out)}`,
        });
        return Response.json({ deleted: true });
      }

      const clockIn = String(body?.clock_in || "");
      const clockOut = String(body?.clock_out || "");
      if (!clockIn) {
        return Response.json(
          { error: "A clock-in time is required." },
          { status: 400 }
        );
      }
      const inAt = new Date(clockIn);
      if (isNaN(inAt.getTime())) {
        return Response.json(
          { error: "That clock-in time is not valid." },
          { status: 400 }
        );
      }
      let outAt: Date | null = null;
      if (clockOut) {
        outAt = new Date(clockOut);
        if (isNaN(outAt.getTime())) {
          return Response.json(
            { error: "That clock-out time is not valid." },
            { status: 400 }
          );
        }
        if (outAt.getTime() < inAt.getTime()) {
          return Response.json(
            { error: "The clock-out time must come after the clock-in time." },
            { status: 400 }
          );
        }
      }

      const updated = await sr.entities.JobTimeEntry.update(entryId, {
        clock_in: inAt.toISOString(),
        clock_out: outAt ? outAt.toISOString() : null,
        minutes: outAt
          ? Math.max(0, Math.round((outAt.getTime() - inAt.getTime()) / 60000))
          : 0,
        staff_name: String(body?.staff_name || entry.staff_name || ""),
        correction_note: String(body?.correction_note || ""),
      });

      const note = String(body?.correction_note || "").trim();
      await sr.entities.AuditLog.create({
        ...audit,
        action: "update",
        summary: `Edited ${entry.staff_name || "a technician"}'s time on ${jobLabel}`,
        details: `${showTime(entry.clock_in)} – ${showTime(
          entry.clock_out
        )} changed to ${showTime(inAt.toISOString())} – ${showTime(
          outAt ? outAt.toISOString() : ""
        )}${note ? ` · ${note}` : ""}`,
      });

      return Response.json({ entry: updated });
    }

    const job = await sr.entities.Job.get(jobId).catch(() => null);
    if (!job || job.shop_id !== shopId) {
      return Response.json(
        { error: "That job is not part of your shop." },
        { status: 403 }
      );
    }

    // Who is working: matched to a staff record by email when there is one, so
    // reports group by the same name the shop uses everywhere else.
    const email = (user.email || "").toLowerCase();
    let staff: any = null;
    if (email) {
      const staffPage = await sr.entities.Staff.filter(
        { shop_id: shopId },
        { limit: 200 }
      );
      staff =
        rowsOf(staffPage).find(
          (s: any) => (s.email || "").toLowerCase() === email
        ) || null;
    }
    const identity = {
      staff_id: staff?.id || "",
      staff_name: staff?.name || user.full_name || user.email || "Technician",
      staff_email: user.email || "",
    };

    // This person's unfinished timers. Entries are written with the service
    // role, so the record's own created_by_id belongs to the service account —
    // the technician is identified by the email stored on the entry.
    const minePage = await sr.entities.JobTimeEntry.filter(
      { shop_id: shopId, staff_email: user.email },
      { sort: "-clock_in", limit: 100 }
    );
    const open = rowsOf(minePage).filter((e: any) => !e.clock_out);

    if (action === "clock_in") {
      if (open.some((e: any) => e.job_id === jobId)) {
        return Response.json(
          { error: "You are already clocked in on this job." },
          { status: 409 }
        );
      }
      const settingsPage = await sr.entities.ShopSettings.filter(
        { shop_id: shopId },
        { limit: 1 }
      );
      const settings = rowsOf(settingsPage)[0] || null;
      const allowOverlap = settings?.allow_overlapping_job_timers === true;
      if (!allowOverlap && open.length) {
        return Response.json(
          {
            error:
              "You are already clocked in on another job. Clock out of it first.",
          },
          { status: 409 }
        );
      }
      const entry = await sr.entities.JobTimeEntry.create({
        shop_id: shopId,
        job_id: jobId,
        job_label: `${job.customer_name || ""}${
          job.ticket_number ? ` · #${job.ticket_number}` : ""
        }`.trim(),
        ...identity,
        clock_in: new Date().toISOString(),
      });
      return Response.json({ entry });
    }

    const openForJob =
      open.find((e: any) => e.job_id === jobId) || open[0] || null;
    if (!openForJob) {
      return Response.json(
        { error: "You are not clocked in on a job." },
        { status: 409 }
      );
    }
    const outAt = new Date();
    const minutes = Math.max(
      0,
      Math.round(
        (outAt.getTime() - new Date(openForJob.clock_in).getTime()) / 60000
      )
    );
    const entry = await sr.entities.JobTimeEntry.update(openForJob.id, {
      clock_out: outAt.toISOString(),
      minutes,
    });
    return Response.json({ entry });
  } catch (error: any) {
    console.error("jobTimeClock failed", error?.message);
    return Response.json(
      { error: error?.message || "That action could not be completed." },
      { status: 500 }
    );
  }
}
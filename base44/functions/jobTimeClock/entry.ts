import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

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
    if (!["clock_in", "clock_out"].includes(action) || !jobId) {
      return Response.json(
        { error: "That time action is not supported." },
        { status: 400 }
      );
    }

    const sr = base44.asServiceRole;

    // The shop comes from the caller's account, so a hand-made request cannot
    // clock time against another shop.
    const linkedShopId = user?.shop_id || user?.data?.shop_id || null;
    let shop: any = linkedShopId
      ? await sr.entities.Shop.get(linkedShopId).catch(() => null)
      : null;
    if (!shop) {
      const owned = await sr.entities.Shop.filter(
        { owner_id: user.id },
        "-created_date",
        1
      );
      shop = rowsOf(owned)[0] || null;
    }
    if (!shop) {
      return Response.json(
        { error: "We could not find your shop yet. Reload the app and try again." },
        { status: 403 }
      );
    }
    const shopId = shop.id;

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

    // This person's unfinished timers.
    const minePage = await sr.entities.JobTimeEntry.filter(
      { shop_id: shopId, created_by_id: user.id },
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
import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { requireFeature } from "../../shared/planGuard.ts";
import {
  rows,
  qbQuery,
  qbFetch,
  syncMaps,
  rememberMap,
  writeLog,
  PAYROLL_UNAVAILABLE,
} from "../../shared/quickbooks.ts";

// One accounting sync pass for a shop.
//
// Customers are the first records covered, in both directions. ShopClutter is
// the source of truth for a customer that exists on both sides: its details are
// pushed up, and a difference found in QuickBooks is written into the run log
// rather than silently overwriting either side.

// Requests are cut at 5 minutes and a Worker holds 6 connections at once, so
// outbound QuickBooks calls go in small settled batches rather than one at a
// time.
async function inBatches(items: any[], size: number, worker: any) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.allSettled(items.slice(i, i + size).map(worker));
  }
}

async function pushCustomers(base44: any, shopId: string, local: any[], maps: any, result: any) {
  await inBatches(local, 6, async (customer: any) => {
    const link = maps.byLocal.get(customer.id);
    const body: any = {
      DisplayName: customer.name || "Customer",
      ...(customer.phone
        ? { PrimaryPhone: { FreeFormNumber: customer.phone } }
        : {}),
      ...(customer.email
        ? { PrimaryEmailAddr: { Address: customer.email } }
        : {}),
      ...(customer.address ? { BillAddr: { Line1: customer.address } } : {}),
    };
    try {
      if (!link) {
        const created = await qbFetch(base44, shopId, "/customer", {
          method: "POST",
          body: JSON.stringify(body),
        });
        const saved = created?.Customer;
        if (saved?.Id) {
          await rememberMap(
            base44,
            shopId,
            "Customer",
            customer.id,
            saved.Id,
            saved.SyncToken || ""
          );
          result.created += 1;
        } else {
          result.failed += 1;
        }
        return;
      }

      const current = await qbFetch(base44, shopId, `/customer/${link.qb_id}`);
      const existing = current?.Customer;
      if (!existing) {
        result.skipped += 1;
        return;
      }
      const unchanged =
        existing.DisplayName === body.DisplayName &&
        (existing.PrimaryPhone?.FreeFormNumber || "") === (customer.phone || "") &&
        (existing.PrimaryEmailAddr?.Address || "") === (customer.email || "");
      if (unchanged) {
        result.skipped += 1;
        return;
      }
      const updated = await qbFetch(base44, shopId, "/customer", {
        method: "POST",
        body: JSON.stringify({
          ...body,
          Id: existing.Id,
          SyncToken: existing.SyncToken,
          sparse: true,
        }),
      });
      const saved = updated?.Customer;
      if (saved?.Id) {
        await rememberMap(
          base44,
          shopId,
          "Customer",
          customer.id,
          saved.Id,
          saved.SyncToken || "",
          link.id
        );
        result.updated += 1;
      } else {
        result.failed += 1;
      }
    } catch (e: any) {
      result.failed += 1;
      result.notes.push(
        `${customer.name || "Customer"}: ${e?.message || "could not be sent to QuickBooks"}`
      );
    }
  });
}

async function pullCustomers(base44: any, shopId: string, local: any[], maps: any, result: any) {
  const sr = base44.asServiceRole;
  const found = await qbQuery(
    base44,
    shopId,
    "select * from Customer where Active = true maxresults 1000"
  );
  const remote = Array.isArray(found?.Customer) ? found.Customer : [];
  const byId = new Map<string, any>(local.map((c: any) => [c.id, c]));
  // A QuickBooks customer whose name already matches one of the shop's own is
  // linked instead of copied, so pulling never doubles the customer list.
  const byName = new Map<string, any>();
  local.forEach((c: any) => {
    const key = (c.name || "").trim().toLowerCase();
    if (key && !byName.has(key)) byName.set(key, c);
  });

  await inBatches(remote, 6, async (qb: any) => {
    try {
      const link = maps.byQb.get(String(qb.Id));
      if (link) {
        const mine = byId.get(link.local_id);
        if (
          mine &&
          qb.DisplayName &&
          mine.name &&
          qb.DisplayName.trim().toLowerCase() !== mine.name.trim().toLowerCase()
        ) {
          result.notes.push(
            `${mine.name}: QuickBooks calls this customer "${qb.DisplayName}". ShopClutter kept its own name.`
          );
        }
        result.skipped += 1;
        return;
      }

      const twin = byName.get((qb.DisplayName || "").trim().toLowerCase());
      if (twin) {
        await rememberMap(
          base44,
          shopId,
          "Customer",
          twin.id,
          qb.Id,
          qb.SyncToken || ""
        );
        result.skipped += 1;
        return;
      }

      const created = await sr.entities.Customer.create({
        shop_id: shopId,
        name: qb.DisplayName || "Customer",
        phone: qb.PrimaryPhone?.FreeFormNumber || "",
        email: qb.PrimaryEmailAddr?.Address || "",
        address: qb.BillAddr?.Line1 || "",
      });
      await rememberMap(
        base44,
        shopId,
        "Customer",
        created.id,
        qb.Id,
        qb.SyncToken || ""
      );
      result.created += 1;
    } catch (e: any) {
      result.failed += 1;
      result.notes.push(
        `${qb.DisplayName || "Customer"}: ${e?.message || "could not be added"}`
      );
    }
  });
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: "Please sign in." }, { status: 401 });
    }
    const guard = await requireFeature(base44, user, "quickbooks");
    if (!guard.ok) return guard.response;
    if (user.role !== "admin") {
      return Response.json(
        { error: "Only a shop administrator can sync QuickBooks." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const shopId = guard.shop.id;
    const sr = base44.asServiceRole;

    if (body?.action === "history") {
      const page = await sr.entities.QuickBooksSyncLog.filter(
        { shop_id: shopId },
        { sort: "-created_date", limit: 20 }
      );
      return Response.json({ logs: rows(page) });
    }

    const connections = await sr.entities.QuickBooksConnection.filter(
      { shop_id: shopId },
      { limit: 1 }
    );
    const connection = rows(connections)[0] || null;
    if (!connection || connection.status !== "connected") {
      return Response.json(
        { error: "Connect your QuickBooks company first." },
        { status: 400 }
      );
    }
    if (body?.area === "payroll") {
      return Response.json({ error: PAYROLL_UNAVAILABLE }, { status: 400 });
    }

    const startedAt = new Date().toISOString();
    const direction = connection.accounting_direction || "two_way";
    const result = { created: 0, updated: 0, skipped: 0, failed: 0, notes: [] as string[] };

    try {
      const local = rows(
        await sr.entities.Customer.filter({ shop_id: shopId }, { limit: 3000 })
      );
      const maps = await syncMaps(base44, shopId, "Customer");
      if (direction === "push" || direction === "two_way") {
        await pushCustomers(base44, shopId, local, maps, result);
      }
      if (direction === "pull" || direction === "two_way") {
        await pullCustomers(base44, shopId, local, maps, result);
      }
    } catch (e: any) {
      result.failed += 1;
      result.notes.push(e?.message || "The customer sync could not finish.");
    }

    const status =
      result.failed && (result.created || result.updated)
        ? "partial"
        : result.failed
        ? "failed"
        : "success";

    await writeLog(base44, {
      shop_id: shopId,
      area: "accounting",
      direction,
      status,
      created_count: result.created,
      updated_count: result.updated,
      skipped_count: result.skipped,
      failed_count: result.failed,
      summary: `Customers: ${result.created} added, ${result.updated} updated, ${result.skipped} unchanged${
        result.failed ? `, ${result.failed} failed` : ""
      }.`,
      details: result.notes.slice(0, 20).join("\n"),
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    });

    await sr.entities.QuickBooksConnection.update(connection.id, {
      last_sync_at: new Date().toISOString(),
      last_error: status === "failed" ? result.notes[0] || "" : "",
    });

    return Response.json({ ok: status !== "failed", status, ...result });
  } catch (error: any) {
    console.error("quickbooksSync failed", error?.message);
    return Response.json(
      { error: error?.message || "The sync could not be completed." },
      { status: 500 }
    );
  }
}
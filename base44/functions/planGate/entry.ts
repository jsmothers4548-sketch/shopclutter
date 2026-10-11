import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { requireFeature } from "../../shared/planGuard.ts";
import { FEATURE_ENTITIES, BRAND_FIELDS } from "../../shared/gatedEntities.ts";
import {
  READ_ADMIN_ONLY,
  requiresAdmin,
  isClosedJobGuarded,
  closedJobField,
  isAdmin,
} from "../../shared/entityPermissions.ts";

// Every paid tool's data changes and report reads come through here. The shop
// and its plan are resolved from the signed-in user inside requireFeature,
// never from the request body, so a hand-made request cannot claim a plan the
// shop does not have. Records are only ever read or written inside that shop.

const WRITE_OPS = [
  "create",
  "update",
  "delete",
  "bulkCreate",
  "bulkUpdate",
  "deleteMany",
];
const MAX_BATCH = 500;
const MAX_READS = 12;
const MAX_LIMIT = 3000;

// The service role skips the entities' own data rules, so the role rules are
// applied here instead: a non-admin is refused admin-only operations, and may
// not change a record whose job is already Closed.
const adminOnly = () =>
  Response.json(
    { error: "Only a shop administrator can do that." },
    { status: 403 }
  );
const closedForbidden = () =>
  Response.json(
    {
      error:
        "That record belongs to a closed job and can only be changed by an administrator.",
    },
    { status: 403 }
  );

function bodyFor(entity: string, data: any) {
  if (entity === "ShopSettings") {
    const out: any = {};
    BRAND_FIELDS.forEach((field) => {
      if (data && data[field] !== undefined) out[field] = data[field];
    });
    return out;
  }
  return { ...(data || {}) };
}

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
        { error: "Please sign in to use this tool." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const feature = typeof body?.feature === "string" ? body.feature : "";
    const allowed = FEATURE_ENTITIES[feature];
    if (!allowed) {
      return Response.json(
        { error: "That tool is not available." },
        { status: 400 }
      );
    }

    const guard = await requireFeature(base44, user, feature);
    if (!guard.ok) return guard.response;
    const shopId = guard.shop.id;
    const sr = base44.asServiceRole;

    if (body.action === "read") {
      const reads = Array.isArray(body.reads)
        ? body.reads.slice(0, MAX_READS)
        : [];
      const results: any[] = [];
      for (const spec of reads) {
        const entity = String(spec?.entity || "");
        if (!allowed.includes(entity)) {
          return Response.json(
            { error: "That data is not part of this tool." },
            { status: 400 }
          );
        }
        if (READ_ADMIN_ONLY.includes(entity) && !isAdmin(user)) {
          return adminOnly();
        }
        const query = { ...(spec?.query || {}), shop_id: shopId };
        const limit = Math.min(
          Math.max(Number(spec?.limit) || 500, 1),
          MAX_LIMIT
        );
        const sort =
          typeof spec?.sort === "string" ? spec.sort : "-created_date";
        const page = await sr.entities[entity].filter(query, { sort, limit });
        results.push(rowsOf(page));
      }
      return Response.json({ results });
    }

    const entity = String(body?.entity || "");
    if (!allowed.includes(entity)) {
      return Response.json(
        { error: "That tool cannot change this record." },
        { status: 400 }
      );
    }
    const op = String(body?.op || "");
    if (!WRITE_OPS.includes(op)) {
      return Response.json(
        { error: "That change is not supported." },
        { status: 400 }
      );
    }
    if (requiresAdmin(entity, op) && !isAdmin(user)) {
      return adminOnly();
    }

    const payload = body?.payload;
    const records = sr.entities[entity];

    // The service role skips the data rules, so ownership is confirmed here
    // before anything is changed.
    const findMine = async (id: string) => {
      const found = await records.filter(
        { id, shop_id: shopId },
        { limit: 1 }
      );
      const rows = rowsOf(found);
      return rows.length ? rows[0] : null;
    };
    const notYours = () =>
      Response.json(
        { error: "That record is not part of your shop." },
        { status: 403 }
      );
    // A record whose job is Closed is frozen for everyone but an administrator.
    const blockedByClosedJob = (record: any) =>
      isClosedJobGuarded(entity) &&
      !isAdmin(user) &&
      record?.[closedJobField(entity)] === "Closed";

    if (op === "create") {
      const record = await records.create({
        ...bodyFor(entity, payload),
        shop_id: shopId,
      });
      return Response.json({ record });
    }

    if (op === "update") {
      const id = payload?.id;
      const mine = id ? await findMine(id) : null;
      if (!mine) return notYours();
      if (blockedByClosedJob(mine)) return closedForbidden();
      const record = await records.update(id, bodyFor(entity, payload?.data));
      return Response.json({ record });
    }

    if (op === "delete") {
      const id = payload?.id;
      const mine = id ? await findMine(id) : null;
      if (!mine) return notYours();
      if (blockedByClosedJob(mine)) return closedForbidden();
      await records.delete(id);
      return Response.json({ ok: true });
    }

    if (op === "bulkCreate") {
      const rows = (Array.isArray(payload) ? payload : []).slice(0, MAX_BATCH);
      if (!rows.length) {
        return Response.json({ error: "Nothing to save." }, { status: 400 });
      }
      const created = await records.bulkCreate(
        rows.map((row: any) => ({ ...bodyFor(entity, row), shop_id: shopId }))
      );
      return Response.json({ records: created });
    }

    if (op === "bulkUpdate") {
      const rows = (Array.isArray(payload) ? payload : []).slice(0, MAX_BATCH);
      const ids = rows.map((row: any) => row?.id).filter(Boolean);
      if (!ids.length) {
        return Response.json({ error: "Nothing to save." }, { status: 400 });
      }
      const found = await records.filter(
        { id: { $in: ids }, shop_id: shopId },
        { limit: MAX_BATCH }
      );
      const mineRows = rowsOf(found);
      const mine = new Set(mineRows.map((row: any) => row.id));
      if (ids.some((id: string) => !mine.has(id))) return notYours();
      if (mineRows.some((row: any) => blockedByClosedJob(row))) {
        return closedForbidden();
      }
      const updated = await records.bulkUpdate(
        rows.map((row: any) => ({ ...bodyFor(entity, row), shop_id: shopId }))
      );
      return Response.json({ records: updated });
    }

    // deleteMany: the query is always pinned to the caller's own shop, and for
    // a non-admin it also skips records whose job is already Closed.
    const deleteQuery: any = { ...(payload?.query || {}) };
    if (isClosedJobGuarded(entity) && !isAdmin(user)) {
      deleteQuery.$and = [
        ...(Array.isArray(deleteQuery.$and) ? deleteQuery.$and : []),
        { [closedJobField(entity)]: { $ne: "Closed" } },
      ];
    }
    await records.deleteMany({ ...deleteQuery, shop_id: shopId });
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error("planGate failed", error?.message);
    return Response.json(
      { error: error?.message || "That action could not be completed." },
      { status: 500 }
    );
  }
}
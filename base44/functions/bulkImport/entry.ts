import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { requireFeature } from "../../shared/planGuard.ts";

// Administrator-only CSV migration. Every record is stamped with the caller's
// own shop, and a customer is linked only from that same shop's customer list,
// so a spreadsheet can never reach across shops. The file itself is parsed in
// the browser and is never uploaded or stored here.

const CATEGORIES: Record<string, any> = {
  customers: {
    entity: "Customer",
    required: ["name", "phone"],
    fields: {
      name: "string",
      phone: "string",
      email: "string",
      address: "string",
      notes: "string",
    },
  },
  equipment: {
    entity: "Equipment",
    required: ["label_number"],
    fields: {
      label_number: "string",
      customer_name: "string",
      equipment_type: "string",
      make: "string",
      model: "string",
      serial_number: "string",
      notes: "string",
    },
    linksCustomer: true,
  },
  jobs: {
    entity: "Job",
    required: ["customer_name", "equipment_type", "problem_description"],
    fields: {
      ticket_number: "string",
      customer_name: "string",
      equipment_type: "string",
      make: "string",
      model: "string",
      serial_number: "string",
      problem_description: "string",
      status: "string",
      job_location: "string",
      service_call_fee: "number",
      default_labor_rate: "number",
      tax_rate: "number",
    },
    linksCustomer: true,
  },
  inventory: {
    entity: "ShopItem",
    required: ["name"],
    fields: {
      name: "string",
      part_number: "string",
      category: "string",
      supplier: "string",
      stock_quantity: "number",
      unit_cost: "number",
      reorder_threshold: "number",
      for_sale: "boolean",
      sale_price: "number",
    },
  },
  sales: {
    entity: "Sale",
    required: ["item_description", "total_price"],
    fields: {
      item_description: "string",
      customer_name: "string",
      part_number: "string",
      unit_cost: "number",
      subtotal: "number",
      tax_rate: "number",
      total_price: "number",
      amount_paid: "number",
      sale_date: "date",
      status: "string",
      notes: "string",
    },
    linksCustomer: true,
  },
};

// The fields the duplicate check reads back for each category.
const INDEX_FIELDS: Record<string, string[]> = {
  customers: ["id", "name", "phone", "email"],
  equipment: ["id", "label_number", "customer_name", "make", "model"],
  jobs: ["id", "ticket_number", "customer_name", "equipment_type"],
  inventory: ["id", "name", "part_number", "supplier", "stock_quantity"],
  sales: ["id", "item_description", "customer_name", "total_price", "sale_date"],
};

const JOB_STATUSES = [
  "Intake",
  "Diagnosed",
  "Estimate Sent",
  "Approved",
  "In Progress",
  "Waiting on Parts",
  "Ready for Pickup",
  "Closed",
];
const SALE_STATUSES = ["Open", "Paid"];
const JOB_LOCATIONS = ["On-site", "Off-site"];

const MAX_COMMIT_ROWS = 250;
const MAX_MATCH_ROWS = 1000;
const INDEX_LIMIT = 3000;

const rowsOf = (page: any) => (Array.isArray(page) ? page : page?.items || []);
const norm = (v: any) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function pickEnum(value: any, list: string[]) {
  if (!value) return undefined;
  const v = String(value).trim().toLowerCase();
  return list.find((x) => x.toLowerCase() === v);
}

function toIsoDate(value: any) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function coerce(type: string, raw: any) {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  if (s === "") return undefined;
  if (type === "number") {
    const n = Number(s.replace(/[$,]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  if (type === "boolean") {
    const t = s.toLowerCase();
    if (["true", "yes", "y", "1"].includes(t)) return true;
    if (["false", "no", "n", "0"].includes(t)) return false;
    return undefined;
  }
  if (type === "date") return toIsoDate(s);
  return s;
}

function buildRow(category: string, raw: any) {
  const spec = CATEGORIES[category];
  const out: any = {};
  const issues: string[] = [];
  for (const field of Object.keys(spec.fields)) {
    const value = coerce(spec.fields[field], raw?.[field]);
    if (value === undefined) continue;
    if (typeof value === "number" && Number.isNaN(value)) {
      issues.push(`${field} is not a number`);
      continue;
    }
    out[field] = value;
  }
  for (const field of spec.required) {
    if (out[field] === undefined || out[field] === "") {
      issues.push(`${field} is required`);
    }
  }
  if (category === "jobs") {
    out.status = pickEnum(out.status, JOB_STATUSES) || "Intake";
    out.job_location = pickEnum(out.job_location, JOB_LOCATIONS) || "On-site";
  }
  if (category === "sales") {
    out.status = pickEnum(out.status, SALE_STATUSES) || "Open";
  }
  return { out, issues };
}

function matchKey(category: string, record: any) {
  if (category === "customers") {
    const name = norm(record.name);
    return name ? `${name}|${norm(record.phone)}` : "";
  }
  if (category === "equipment") return norm(record.label_number);
  if (category === "jobs") return norm(record.ticket_number);
  if (category === "inventory") return norm(record.part_number) || norm(record.name);
  if (category === "sales") {
    const item = norm(record.item_description);
    if (!item) return "";
    return `${item}|${record.total_price ?? ""}|${norm(record.sale_date)}`;
  }
  return "";
}

function labelFor(category: string, r: any) {
  if (category === "customers") return [r.name, r.phone].filter(Boolean).join(" · ");
  if (category === "equipment")
    return [r.label_number && `#${r.label_number}`, r.customer_name, r.make, r.model]
      .filter(Boolean)
      .join(" · ");
  if (category === "jobs")
    return [r.ticket_number && `#${r.ticket_number}`, r.customer_name, r.equipment_type]
      .filter(Boolean)
      .join(" · ");
  if (category === "inventory")
    return [r.name, r.part_number && `#${r.part_number}`, r.supplier]
      .filter(Boolean)
      .join(" · ");
  if (category === "sales")
    return [r.item_description, r.customer_name, r.total_price != null && `$${r.total_price}`]
      .filter(Boolean)
      .join(" · ");
  return r.id;
}

async function loadIndex(sr: any, category: string, shopId: string) {
  const spec = CATEGORIES[category];
  const page = await sr.entities[spec.entity].filter(
    { shop_id: shopId },
    { limit: INDEX_LIMIT, fields: INDEX_FIELDS[category] }
  );
  const index = new Map<string, any>();
  rowsOf(page).forEach((record: any) => {
    const key = matchKey(category, record);
    if (key && !index.has(key)) index.set(key, record);
  });
  return index;
}

async function loadCustomerIndex(sr: any, shopId: string) {
  const page = await sr.entities.Customer.filter(
    { shop_id: shopId },
    { limit: INDEX_LIMIT, fields: ["id", "name", "phone"] }
  );
  const index = new Map<string, any>();
  rowsOf(page).forEach((record: any) => {
    const key = norm(record.name);
    if (key && !index.has(key)) index.set(key, record);
  });
  return index;
}

// Save in bulk for speed; if the batch is refused, retry one row at a time so
// the failure can be attributed to the exact row that caused it.
async function saveBulk(
  entityApi: any,
  items: { index: number; record: any }[],
  method: string,
  errors: any[]
) {
  if (!items.length) return 0;
  try {
    if (method === "bulkCreate") {
      await entityApi.bulkCreate(items.map((i) => i.record));
    } else {
      await entityApi.bulkUpdate(items.map((i) => i.record));
    }
    return items.length;
  } catch (e) {
    let saved = 0;
    for (let i = 0; i < items.length; i += 6) {
      const slice = items.slice(i, i + 6);
      const settled = await Promise.allSettled(
        slice.map((item) =>
          method === "bulkCreate"
            ? entityApi.create(item.record)
            : entityApi.update(item.record.id, item.record)
        )
      );
      settled.forEach((result: any, offset: number) => {
        if (result.status === "fulfilled") {
          saved += 1;
        } else {
          errors.push({
            index: slice[offset].index,
            message: result.reason?.message || "This row could not be saved.",
          });
        }
      });
    }
    return saved;
  }
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
      return Response.json({ error: "Please sign in to continue." }, { status: 401 });
    }
    if (user.role !== "admin") {
      return Response.json(
        { error: "Only a shop administrator can import data." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const category = String(body?.category || "");
    const spec = CATEGORIES[category];
    if (!spec) {
      return Response.json({ error: "That import type is not supported." }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    // Importing is a Team-and-up tool, so the shop's plan is checked — from the
    // signed-in user, never the request body — before any row is touched.
    const guard = await requireFeature(base44, user, "migration");
    if (!guard.ok) return guard.response;
    const shopId = guard.shop.id;

    if (body.action === "match") {
      const rows = Array.isArray(body.rows) ? body.rows.slice(0, MAX_MATCH_ROWS) : [];
      const index = await loadIndex(sr, category, shopId);
      const matches = rows.map((raw: any, position: number) => {
        const { out, issues } = buildRow(category, raw);
        if (issues.length) return null;
        const key = matchKey(category, out);
        if (!key) return null;
        const hit = index.get(key);
        if (!hit) return null;
        return { row: position, id: hit.id, label: labelFor(category, hit) };
      });
      return Response.json({ matches });
    }

    if (body.action !== "commit") {
      return Response.json({ error: "That action is not supported." }, { status: 400 });
    }

    const rows = Array.isArray(body.rows) ? body.rows.slice(0, MAX_COMMIT_ROWS) : [];
    if (!rows.length) {
      return Response.json({ imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] });
    }

    const customerIndex = spec.linksCustomer ? await loadCustomerIndex(sr, shopId) : null;
    const errors: any[] = [];
    const createItems: { index: number; record: any }[] = [];
    const updateItems: { index: number; record: any }[] = [];
    let skipped = 0;

    rows.forEach((row: any, position: number) => {
      const index = typeof row?.index === "number" ? row.index : position;
      const decision = row?.decision === "update" ? "update" : row?.decision === "skip" ? "skip" : "create";
      if (decision === "skip") {
        skipped += 1;
        return;
      }

      const { out, issues } = buildRow(category, row?.data);
      if (issues.length) {
        errors.push({ index, message: issues.join("; ") });
        return;
      }

      if (spec.linksCustomer) {
        const key = norm(out.customer_name);
        const hit = key ? customerIndex.get(key) : null;
        if (hit) {
          out.customer_id = hit.id;
          out.customer_name = hit.name;
        } else if (category === "jobs") {
          errors.push({
            index,
            message: `No customer in your shop matches "${out.customer_name}". Import customers first.`,
          });
          return;
        }
      }

      if (decision === "update") {
        const id = row?.update_id;
        if (!id) {
          errors.push({ index, message: "The record to update was not provided." });
          return;
        }
        updateItems.push({ index, record: { ...out, id, shop_id: shopId } });
      } else {
        createItems.push({ index, record: { ...out, shop_id: shopId } });
      }
    });

    // Confirm every record we are about to change really belongs to this shop.
    let updateAllowed = updateItems;
    if (updateItems.length) {
      const ids = updateItems.map((i) => i.record.id);
      const owned = await sr.entities[spec.entity].filter(
        { id: { $in: ids }, shop_id: shopId },
        { limit: ids.length }
      );
      const allowed = new Set(rowsOf(owned).map((r: any) => r.id));
      updateAllowed = updateItems.filter((item) => {
        if (allowed.has(item.record.id)) return true;
        errors.push({ index: item.index, message: "That record is not part of your shop." });
        return false;
      });
    }

    const imported = await saveBulk(
      sr.entities[spec.entity],
      createItems,
      "bulkCreate",
      errors
    );
    const updated = await saveBulk(
      sr.entities[spec.entity],
      updateAllowed,
      "bulkUpdate",
      errors
    );

    return Response.json({
      imported,
      updated,
      skipped,
      failed: errors.length,
      errors: errors.slice(0, 300),
    });
  } catch (error: any) {
    console.error("bulkImport failed", error?.message);
    return Response.json(
      { error: error?.message || "That import could not be completed." },
      { status: 500 }
    );
  }
}
// Server-side authorization for the paid tools. The gate runs with the service
// role, which skips the entities' row-level rules, so the rules that would have
// applied to the caller are mirrored here: which reads and operations are
// admin-only, and which records a non-admin may not change once their job is
// Closed. Keeping the mirror in one place keeps the gate and the entity
// schemas in step.

// Reads that entity rules reserve for an administrator (Staff, PartPurchase,
// JobTimeEntry — time-clock details are payroll-sensitive).
export const READ_ADMIN_ONLY = ["Staff", "PartPurchase", "JobTimeEntry"];

// Operations that entity rules reserve for an administrator, per entity.
export const ADMIN_ONLY_OPS: Record<string, string[]> = {
  Staff: [
    "create",
    "update",
    "delete",
    "bulkCreate",
    "bulkUpdate",
    "deleteMany",
  ],
  PartPurchase: [
    "create",
    "update",
    "delete",
    "bulkCreate",
    "bulkUpdate",
    "deleteMany",
  ],
  TimeClock: ["update", "delete", "bulkUpdate", "deleteMany"],
  InventoryCategory: [
    "create",
    "update",
    "delete",
    "bulkCreate",
    "bulkUpdate",
    "deleteMany",
  ],
  ShopSettings: ["update", "delete", "bulkUpdate", "deleteMany"],
  JobTimeEntry: [
    "create",
    "update",
    "delete",
    "bulkCreate",
    "bulkUpdate",
    "deleteMany",
  ],
};

// A non-admin may not change one of these once the record's job is Closed.
export const CLOSED_JOB_GUARDED = [
  "Job",
  "Part",
  "LaborEntry",
  "Payment",
  "JobExpense",
];

export function isAdmin(user: any): boolean {
  return user?.role === "admin";
}

export function requiresAdmin(entity: string, op: string): boolean {
  return (ADMIN_ONLY_OPS[entity] || []).includes(op);
}

export function isClosedJobGuarded(entity: string): boolean {
  return CLOSED_JOB_GUARDED.includes(entity);
}

// The field carrying the job's status differs by entity: a Job holds its own
// `status`, while the records hanging off it mirror that status in `job_status`.
export function closedJobField(entity: string): string {
  return entity === "Job" ? "status" : "job_status";
}
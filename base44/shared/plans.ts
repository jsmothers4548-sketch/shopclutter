// Server-side mirror of src/lib/plans.js. These are the amounts actually
// charged through Stripe, so keep the two files in step when prices change.

export const PLANS = [
  { id: "free", name: "Solo", monthly: 0, annual: 0 },
  { id: "pro", name: "Pro", monthly: 39, annual: 390 },
  { id: "team", name: "Team", monthly: 79, annual: 790 },
  { id: "enterprise", name: "Multi-Location", monthly: 149, annual: 1490 },
];

export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function amountFor(plan: any, billingPeriod: string) {
  return billingPeriod === "annual" ? plan.annual : plan.monthly;
}

// Which tier unlocks what — mirrors src/lib/plans.js. `rank` is the minimum
// plan rank that gets the tool, so a server-side check matches what the app
// shows the user.
export const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  team: 2,
  enterprise: 3,
};

export const FEATURE_RANK: Record<string, number> = {
  templates: 1,
  inventory: 1,
  sales: 1,
  reports: 1,
  branding: 1,
  voice_intake: 1,
  qr_scan: 1,
  time_clock: 2,
  staff_tasks: 2,
  reimbursements: 2,
  employee_earnings: 2,
  supplier_orders: 2,
  quickbooks: 2,
  multi_location: 3,
};

// Shown to the user when a tool is refused. Mirrors the wording the app uses.
export const FEATURE_LABELS: Record<string, string> = {
  templates: "Job templates",
  inventory: "Parts & inventory tracking",
  sales: "Storefront sales",
  reports: "Profit reports",
  branding: "Your logo & business name",
  voice_intake: "Voice intake",
  qr_scan: "QR unit labels",
  time_clock: "Time clock & timecards",
  staff_tasks: "Staff tasks",
  reimbursements: "Reimbursements",
  employee_earnings: "Employee earnings",
  supplier_orders: "Supplier orders & restocking",
  quickbooks: "QuickBooks sync",
  multi_location: "Multiple locations",
};

export function refusalMessage(feature: string) {
  const label = FEATURE_LABELS[feature] || "That tool";
  return `${label} is included on our paid plans — upgrade to use it.`;
}

export function hasFeature(planId: string, feature: string) {
  const required = FEATURE_RANK[feature];
  if (required === undefined) return true;
  return (PLAN_RANK[planId] ?? 0) >= required;
}
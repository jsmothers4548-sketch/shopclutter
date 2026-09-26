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
// The single editable plan catalog for the app. Prices are whole US dollars.
// The server charges Stripe from base44/shared/plans.ts — change both together.

export const PERIODS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual', note: '2 months free' },
];

// Which tier unlocks what. `rank` is the minimum plan rank that gets the tool.
export const PLAN_RANK = { free: 0, pro: 1, team: 2, enterprise: 3 };

export const FEATURES = {
  templates: {
    rank: 1,
    label: 'Job templates',
    blurb:
      'Save the parts and labor for a common repair once, then load it onto a new job in a tap.',
  },
  inventory: {
    rank: 1,
    label: 'Parts & inventory tracking',
    blurb:
      'Track stock levels, reorder points and what the parts on your shelves are worth.',
  },
  sales: {
    rank: 1,
    label: 'Storefront sales',
    blurb: 'Ring up counter sales and keep a running balance on each one.',
  },
  reports: {
    rank: 1,
    label: 'Profit reports',
    blurb: 'See revenue, costs, profit and tax collected across any period.',
  },
  branding: {
    rank: 1,
    label: 'Your logo & business name',
    blurb:
      'Put your own logo and business name on the app, your estimates and your invoices.',
  },
  voice_intake: {
    rank: 1,
    label: 'Voice intake',
    blurb: 'Describe the job out loud and let it fill in the form for you.',
  },
  qr_scan: {
    rank: 1,
    label: 'QR unit labels',
    blurb: 'Scan a unit label to jump straight to that unit or ticket.',
  },
  time_clock: {
    rank: 2,
    label: 'Time clock & timecards',
    blurb:
      'Let the crew clock in and out, and turn those hours into weekly timecards.',
  },
  staff_tasks: {
    rank: 2,
    label: 'Staff tasks',
    blurb: 'Hand out shop tasks and track them through to done.',
  },
  reimbursements: {
    rank: 2,
    label: 'Reimbursements',
    blurb: 'See what you owe each person for out-of-pocket job expenses.',
  },
  employee_earnings: {
    rank: 2,
    label: 'Employee earnings',
    blurb: 'Hours worked, pay earned and what each person brought in.',
  },
  supplier_orders: {
    rank: 2,
    label: 'Supplier orders & restocking',
    blurb: 'Restock in a tap and build a supplier order to text or email.',
  },
  quickbooks: {
    rank: 2,
    label: 'QuickBooks sync',
    blurb: 'Push customers, invoices and payments into QuickBooks.',
  },
  multi_location: {
    rank: 3,
    label: 'Multiple locations',
    blurb:
      'Run several shops from one account, each with its own jobs, customers and inventory.',
  },
};

export const PLANS = [
  {
    id: 'free',
    name: 'Solo',
    tagline: 'One person, one shop, up and running.',
    monthly: 0,
    annual: 0,
    limits: { jobs_per_month: 10, staff: 1, locations: 1 },
    features: [
      'Up to 10 jobs a month',
      '1 user',
      '1 location',
      'Jobs, customers & estimates',
      'Invoices, payments & reminders',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For the busy one- or two-person shop.',
    monthly: 39,
    annual: 390,
    recommended: true,
    limits: { jobs_per_month: 100, staff: 3, locations: 1 },
    features: [
      'Up to 100 jobs a month',
      'Up to 3 users',
      '1 location',
      'Everything in Solo',
      'Job templates',
      'Parts & inventory tracking',
      'Storefront sales',
      'Profit reports',
      'Voice intake & QR unit labels',
      'Your logo & business name',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'A full crew sharing one shop.',
    monthly: 79,
    annual: 790,
    limits: { jobs_per_month: 400, staff: 10, locations: 1 },
    features: [
      'Up to 400 jobs a month',
      'Up to 10 users',
      '1 location',
      'Everything in Pro',
      'Time clock & timecards',
      'Staff tasks',
      'Reimbursements & employee earnings',
      'Supplier orders & restocking',
      'QuickBooks sync',
    ],
  },
  {
    id: 'enterprise',
    name: 'Multi-Location',
    tagline: 'Several shops under one account.',
    monthly: 149,
    annual: 1490,
    limits: { jobs_per_month: null, staff: null, locations: 5 },
    features: [
      'Unlimited jobs',
      'Unlimited users',
      'Up to 5 locations',
      'Everything in Team',
      'Priority support',
      'Multiple locations — coming soon',
    ],
  },
];

export function getPlan(id) {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function isPaidPlan(plan) {
  return !!plan && plan.monthly > 0;
}

export function planRank(plan) {
  return PLAN_RANK[plan?.id] ?? 0;
}

// The name of the cheapest plan that includes a feature, e.g. "Team".
export function planNameForFeature(key) {
  const meta = FEATURES[key];
  if (!meta) return 'Pro';
  const plan = PLANS.find((p) => PLAN_RANK[p.id] === meta.rank);
  return plan?.name || 'Pro';
}

// True when the shop's plan includes the named feature.
export function hasFeature(plan, key) {
  const meta = FEATURES[key];
  if (!meta) return true;
  return planRank(plan) >= meta.rank;
}

// White-label branding is a benefit of every paid plan.
export function canWhiteLabel(plan) {
  return hasFeature(plan, 'branding');
}

export function priceLabel(plan, period) {
  if (!isPaidPlan(plan)) return 'Free';
  return period === 'annual' ? `$${plan.annual}/yr` : `$${plan.monthly}/mo`;
}

export function monthlyEquivalent(plan, period) {
  if (!isPaidPlan(plan) || period !== 'annual') return null;
  return `$${Math.round(plan.annual / 12)}/mo billed yearly`;
}

export function limitLabel(value) {
  return value === null || value === undefined ? 'Unlimited' : String(value);
}
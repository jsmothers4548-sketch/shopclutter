// The single editable plan catalog for the app. Prices are whole US dollars.
// The server charges Stripe from base44/shared/plans.ts — change both together.

export const PERIODS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual', note: '2 months free' },
];

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
      'Profit reports & staff tasks',
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
      'Time clock & reimbursements',
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
    ],
  },
];

export function getPlan(id) {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function isPaidPlan(plan) {
  return !!plan && plan.monthly > 0;
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
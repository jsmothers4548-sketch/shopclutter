// The side-by-side plan comparison used on the public pricing page.
// Prices and limits mirror src/lib/plans.js — keep them in step.
// A row value is true (included), false (not included) or a short string.

export const COMPARISON_PLANS = [
  { id: 'free', name: 'Solo' },
  { id: 'pro', name: 'Pro' },
  { id: 'team', name: 'Team' },
  { id: 'enterprise', name: 'Multi-Location' },
];

export const COMPARISON_GROUPS = [
  {
    group: 'Jobs & customers',
    rows: [
      {
        label: 'Jobs per month',
        values: { free: '10', pro: '100', team: '400', enterprise: 'Unlimited' },
      },
      {
        label: 'Users',
        values: { free: '1', pro: '3', team: '10', enterprise: 'Unlimited' },
      },
      {
        label: 'Locations',
        values: { free: '1', pro: '1', team: '1', enterprise: '5' },
      },
      {
        label: 'Job tracking & status board',
        values: { free: true, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Customers & equipment history',
        values: { free: true, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Estimates, invoices & payments',
        values: { free: true, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Appointments & reminders',
        values: { free: true, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Job templates',
        values: { free: false, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Voice intake & QR unit labels',
        values: { free: false, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Job directions & on-site routing',
        tag: 'New',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
    ],
  },
  {
    group: 'Money & inventory',
    rows: [
      {
        label: 'Storefront sales',
        values: { free: false, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Parts & inventory tracking',
        values: { free: false, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Profit reports',
        values: { free: false, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Supplier orders & restocking',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
      {
        label: 'Employee earnings',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
      {
        label: 'Reimbursements',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
      {
        label: 'QuickBooks sync',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
    ],
  },
  {
    group: 'Crew & time',
    rows: [
      {
        label: 'Time clock & timecards',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
      {
        label: 'Clock in and out of a job',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
      {
        label: 'Staff tasks',
        values: { free: false, pro: false, team: true, enterprise: true },
      },
      {
        label: 'Change history (audit log)',
        values: { free: true, pro: true, team: true, enterprise: true },
      },
    ],
  },
  {
    group: 'Branding & data',
    rows: [
      {
        label: 'Your logo & business name',
        values: { free: false, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Bulk data migration',
        values: { free: true, pro: true, team: true, enterprise: true },
      },
      {
        label: 'Multiple locations',
        tag: 'Coming soon',
        values: { free: false, pro: false, team: false, enterprise: true },
      },
    ],
  },
];
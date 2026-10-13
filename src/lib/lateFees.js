import { base44 } from '@/api/base44Client';
import { computeBilling } from '@/lib/billing';

// Shop-level defaults for charging customers who leave a finished unit sitting
// in the shop. A one-time fee lands once the unit has been ready past the day
// limit; an optional daily fee keeps adding up for every day after that.
export const LATE_FEE_DEFAULTS = {
  late_fee_enabled: false,
  late_fee_days: 30,
  late_fee_type: 'flat',
  late_fee_value: 0,
  daily_fee_enabled: false,
  daily_fee_type: 'flat',
  daily_fee_value: 0,
};

const DAY = 24 * 60 * 60 * 1000;

const asArray = (res) => (Array.isArray(res) ? res : res?.items || []);

// Whole days a unit has been sitting ready.
export function daysSince(iso, now = Date.now()) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (!t) return 0;
  return Math.max(0, Math.floor((now - t) / DAY));
}

// Work the fee out from scratch every time. Nothing is accumulated, so opening
// the list again can never charge a customer twice.
export function computeLateFee({
  readyAt,
  basisAmount = 0,
  settings,
  now = Date.now(),
}) {
  const triggerDays = Number(settings?.late_fee_days) || 30;
  const daysLate = daysSince(readyAt, now);
  const overdue = daysLate >= triggerDays;

  const oneTimeValue = Number(settings?.late_fee_value) || 0;
  const baseFee = !overdue
    ? 0
    : settings?.late_fee_type === 'percentage'
    ? (basisAmount * oneTimeValue) / 100
    : oneTimeValue;

  const perDayValue = Number(settings?.daily_fee_value) || 0;
  const dailyDays =
    overdue && settings?.daily_fee_enabled
      ? Math.max(0, daysLate - triggerDays)
      : 0;
  const dailyFee =
    dailyDays *
    (settings?.daily_fee_type === 'percentage'
      ? (basisAmount * perDayValue) / 100
      : perDayValue);

  return {
    daysLate,
    overdue,
    baseFee,
    dailyDays,
    dailyFee,
    total: baseFee + dailyFee,
  };
}

// The unit's pre-tax total — the amount a percentage fee is taken from.
export function feeBasis({ job, parts = [], labor = [], expenses = [] }) {
  return computeBilling({ parts, labor, job, expenses }).subtotal;
}

// Every unit past the shop's pickup window, with its fee already worked out.
export async function loadOverdueUnits(settings, now = Date.now()) {
  if (!settings?.late_fee_enabled) return [];
  const triggerDays = Number(settings.late_fee_days) || 30;

  const ready = asArray(
    await base44.entities.Job.filter(
      { status: 'Ready for Pickup' },
      { sort: 'pickup_ready_at', limit: 200 }
    )
  ).filter((j) => j.pickup_ready_at);

  const overdueJobs = ready.filter(
    (j) => daysSince(j.pickup_ready_at, now) >= triggerDays
  );
  if (!overdueJobs.length) return [];

  const ids = overdueJobs.map((j) => j.id);
  const [parts, labor, expenses, records] = await Promise.all([
    base44.entities.Part.filter({ job_id: { $in: ids } }),
    base44.entities.LaborEntry.filter({ job_id: { $in: ids } }),
    base44.entities.JobExpense.filter({ job_id: { $in: ids } }),
    base44.entities.LateFee.filter({ job_id: { $in: ids } }),
  ]);

  const partRows = asArray(parts);
  const laborRows = asArray(labor);
  const expenseRows = asArray(expenses);
  const appliedByJob = new Map(
    asArray(records)
      .filter((r) => r.status === 'applied')
      .map((r) => [r.job_id, r])
  );

  return overdueJobs
    .map((job) => {
      const basis = feeBasis({
        job,
        parts: partRows.filter((p) => p.job_id === job.id),
        labor: laborRows.filter((l) => l.job_id === job.id),
        expenses: expenseRows.filter((e) => e.job_id === job.id),
      });
      return {
        job,
        basis,
        ...computeLateFee({
          readyAt: job.pickup_ready_at,
          basisAmount: basis,
          settings,
          now,
        }),
        applied: appliedByJob.get(job.id) || null,
      };
    })
    .sort((a, b) => b.daysLate - a.daysLate);
}
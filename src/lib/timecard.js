// Time card helpers: weekly grouping, shift pairing, and overtime calculation.

export function getWeekStart(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Pairs clock_in/clock_out entries (sorted chronologically) into shifts.
// An open clock_in without a matching clock_out is ignored.
export function pairShifts(entries) {
  const sorted = [...(entries || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const shifts = [];
  let open = null;
  for (const e of sorted) {
    if (e.action === 'clock_in') {
      open = e;
    } else if (e.action === 'clock_out' && open) {
      const inMs = new Date(open.timestamp).getTime();
      const outMs = new Date(e.timestamp).getTime();
      shifts.push({
        in: open.timestamp,
        out: e.timestamp,
        hours: Math.max(0, (outMs - inMs) / 3600000),
        date: open.shift_date || open.timestamp.slice(0, 10),
      });
      open = null;
    }
  }
  return shifts;
}

// Splits a week's hours into regular, overtime, and double time.
// days: [{ date, hours }]
export function computeOvertime(days, rule) {
  const total = days.reduce((s, d) => s + d.hours, 0);
  if (rule === 'daily') {
    // California style: over 8 hrs/day = OT, over 12 hrs/day = double,
    // plus weekly OT for regular hours beyond 40.
    let regular = 0;
    let overtime = 0;
    let double = 0;
    for (const d of days) {
      regular += Math.min(d.hours, 8);
      overtime += Math.max(0, Math.min(d.hours, 12) - 8);
      double += Math.max(0, d.hours - 12);
    }
    const weeklyOt = Math.max(0, regular - 40);
    return {
      regular: regular - weeklyOt,
      overtime: overtime + weeklyOt,
      double,
      total,
    };
  }
  // Federal: over 40 hrs/week = OT.
  return {
    regular: Math.min(40, total),
    overtime: Math.max(0, total - 40),
    double: 0,
    total,
  };
}

// Estimated pay: regular at 1x, overtime at 1.5x, double time at 2x.
export function weekPay({ regular, overtime, double }, payRate) {
  const r = payRate || 0;
  return regular * r + overtime * r * 1.5 + double * r * 2;
}

export function weekLabel(weekStartMs) {
  const start = new Date(weekStartMs);
  const end = new Date(weekStartMs);
  end.setDate(end.getDate() + 6);
  const fmt = (d) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export const OVERTIME_RULE_LABELS = {
  federal: 'OT after 40 hrs/week',
  daily: 'OT over 8 hrs/day + 40/week',
};
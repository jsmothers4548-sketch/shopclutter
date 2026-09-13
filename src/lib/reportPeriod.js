// Builds the reporting period (full year, quarter, or custom date range)
// used across the Reports page and its printable sections.

const endOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const QUARTERS = {
  q1: [0, 2],
  q2: [3, 5],
  q3: [6, 8],
  q4: [9, 11],
};

export function buildPeriod({ year, periodKey = 'full', customStart = '', customEnd = '' }) {
  if (periodKey === 'custom') {
    const start = customStart ? new Date(`${customStart}T00:00:00`) : null;
    const end = customEnd ? endOfDay(new Date(`${customEnd}T00:00:00`)) : null;
    const fmt = (s) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString() : '—');
    const label =
      customStart || customEnd
        ? `${fmt(customStart)} – ${fmt(customEnd)}`
        : `Custom Range ${year}`;
    return { key: 'custom', start, end, label };
  }
  if (QUARTERS[periodKey]) {
    const [m0, m1] = QUARTERS[periodKey];
    return {
      key: periodKey,
      start: new Date(year, m0, 1),
      end: endOfDay(new Date(year, m1 + 1, 0)),
      label: `${periodKey.toUpperCase()} ${year}`,
    };
  }
  return {
    key: 'full',
    start: new Date(year, 0, 1),
    end: endOfDay(new Date(year, 11, 31)),
    label: `Full Year ${year}`,
  };
}

export function inPeriod(dateStr, period) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  if (period.start && d < period.start) return false;
  if (period.end && d > period.end) return false;
  return true;
}
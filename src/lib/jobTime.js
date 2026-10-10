// Job time helpers: turning a technician's clock in/out records into the hours
// shown on the job, the board and the time reports.

// Minutes recorded for one entry. A finished entry stores `minutes`; an open
// one is measured against now so a running timer still counts.
export function entryMinutes(entry, now = Date.now()) {
  if (!entry?.clock_in) return 0;
  if (entry.clock_out) {
    if (Number(entry.minutes) > 0) return Number(entry.minutes);
    return Math.max(
      0,
      Math.round((new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()) / 60000)
    );
  }
  return Math.max(
    0,
    Math.round((now - new Date(entry.clock_in).getTime()) / 60000)
  );
}

// Hours as a compact number, e.g. 2.5
export function formatHours(minutes) {
  const h = (Number(minutes) || 0) / 60;
  return h >= 10 ? h.toFixed(0) : h.toFixed(1);
}

// A running timer as a clock face, e.g. 1:07:32
export function formatTimer(entry, now = Date.now()) {
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(entry.clock_in).getTime()) / 1000)
  );
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function jobLabel(job) {
  if (!job) return '';
  return `${job.customer_name || ''}${
    job.ticket_number ? ` · #${job.ticket_number}` : ''
  }`.trim();
}
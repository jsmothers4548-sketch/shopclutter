import { base44 } from '@/api/base44Client';
import { withShop } from '@/lib/shopScope';

export function buildTicketNumber(yy, n) {
  return `${String(yy).padStart(2, '0')}-${String(n).padStart(3, '0')}`;
}

// Compute the next ticket number for the current year from the highest existing one.
export async function nextTicketNumber() {
  const jobs = await base44.entities.Job.list('-created_date', 500);
  const yy = String(new Date().getFullYear()).slice(-2);
  let max = 0;
  (Array.isArray(jobs) ? jobs : []).forEach((j) => {
    const m = /^(\d{2})-(\d+)$/.exec(j.ticket_number || '');
    if (m && m[1] === yy) max = Math.max(max, parseInt(m[2], 10));
  });
  return buildTicketNumber(yy, max + 1);
}

// Create a job with an auto-assigned ticket number, retrying on collision.
export async function createJobWithTicket(payload) {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ticket_number = await nextTicketNumber();
    try {
      return await base44.entities.Job.create(
        withShop({ ...payload, ticket_number })
      );
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// Normalize typed ticket input ("26001", "26-1", "26-001") to canonical "26-001".
// Rejects plain 3-4 digit entries so unit labels like 1001 never collide.
export function normalizeTicketInput(raw) {
  const value = (raw || '').trim();
  const m = /^(\d{2})-?(\d{1,4})$/.exec(value);
  if (!m) return null;
  const hasDash = value.includes('-');
  const digits = m[1] + m[2];
  if (!hasDash && digits.length < 5) return null;
  return `${m[1]}-${m[2].padStart(3, '0')}`;
}
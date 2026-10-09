import { base44 } from '@/api/base44Client';
import { getShopId } from '@/lib/shopScope';

// Changes that touch an employee's time or money are recorded here so the shop
// always has a record of who changed what. Routine ticket edits are not logged.
export const AUDIT_CATEGORIES = {
  TIME_CLOCK: 'Time Clock',
  DEFAULT_RATES: 'Default Rates',
  EMPLOYEE_PAY: 'Employee Pay',
  REIMBURSEMENTS: 'Reimbursements',
};

export const AUDIT_CATEGORY_LIST = Object.values(AUDIT_CATEGORIES);

export const AUDIT_ACTION_LABELS = {
  create: 'Created',
  update: 'Edited',
  delete: 'Deleted',
};

let cachedActor = null;

async function currentActor() {
  if (cachedActor) return cachedActor;
  try {
    const me = await base44.auth.me();
    cachedActor = {
      name: me?.full_name || me?.email || 'Unknown',
      email: me?.email || '',
    };
  } catch (err) {
    cachedActor = { name: 'Unknown', email: '' };
  }
  return cachedActor;
}

// Write one audit entry. The change itself has already been saved by the time
// this runs, so a logging failure must never break the user's save.
export async function recordAudit({
  category,
  action,
  target,
  summary,
  details,
}) {
  try {
    const actor = await currentActor();
    await base44.entities.AuditLog.create({
      shop_id: getShopId(),
      actor_name: actor.name,
      actor_email: actor.email,
      category,
      action,
      target: target || '',
      summary,
      details: details || '',
      occurred_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Audit log write failed', err);
  }
}

export function formatAuditValue(value, kind) {
  if (kind === 'money') return `$${(Number(value) || 0).toFixed(2)}`;
  if (kind === 'percent') return `${Number(value) || 0}%`;
  if (kind === 'clock') return value === 'clock_in' ? 'Clock In' : 'Clock Out';
  if (kind === 'overtime') return value === 'daily' ? 'Daily' : 'Federal';
  return String(value ?? '');
}
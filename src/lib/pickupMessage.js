import { computeBilling, sumPayments } from '@/lib/billing';

export function buildPickupMessage({
  job,
  customer,
  parts = [],
  labor = [],
  payments = [],
}) {
  const { grandTotal } = computeBilling({ parts, labor, job });
  const balanceDue = Math.max(grandTotal - sumPayments(payments), 0);

  const firstName =
    (customer?.name || job.customer_name || '')
      .trim()
      .split(/\s+/)[0] || 'there';

  const equipment = [job.equipment_type, job.make, job.model]
    .filter(Boolean)
    .join(' ');

  let message = `Hi ${firstName}! Good news — your ${equipment} is repaired and ready for pickup.`;
  if (balanceDue > 0) {
    message += ` The balance due at pickup is $${balanceDue.toFixed(2)}.`;
  }
  message += ' Let us know if you have any questions. Thanks!';
  return message;
}

export function buildSmsLink(phone, message) {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  const sep = isIOS ? '&' : '?';
  return `sms:${digits}${sep}body=${encodeURIComponent(message)}`;
}
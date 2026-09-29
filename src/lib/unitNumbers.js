import { base44 } from '@/api/base44Client';

// Next unit label number for this shop: the highest numeric label plus one,
// never below 1001. Reading Equipment is shop-scoped by row-level security,
// so one shop's units never affect another's numbering.
export async function nextUnitLabel() {
  const units = await base44.entities.Equipment.list('label_number', 500);
  let max = 1000;
  (Array.isArray(units) ? units : []).forEach((u) => {
    const n = parseInt(u.label_number, 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  });
  return String(max + 1);
}
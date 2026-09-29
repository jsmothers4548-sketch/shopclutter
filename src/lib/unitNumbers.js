import { base44 } from '@/api/base44Client';
import { getShopSettings } from '@/lib/shopSettings';
import { withShop } from '@/lib/shopScope';

// Next unit label number for this shop: one past the highest number ever
// printed or used, never below 1001. Following the highest number *printed*
// (not just the highest in use) keeps a drawer of pre-printed stickers from
// ever being handed out twice. Reading Equipment is shop-scoped by row-level
// security, so one shop's units never affect another's numbering.
export async function nextUnitLabel() {
  const [settings, units] = await Promise.all([
    getShopSettings().catch(() => ({})),
    base44.entities.Equipment.list('label_number', 500),
  ]);
  let max = Math.max(1000, Number(settings.highest_printed_label) || 0);
  (Array.isArray(units) ? units : []).forEach((u) => {
    const n = parseInt(u.label_number, 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  });
  return String(max + 1);
}

// Remember the highest label number on a printed sheet, so numbering carries
// on past it even if some of those stickers never get used.
export async function recordPrintedLabels(highest) {
  const n = parseInt(highest, 10);
  if (!Number.isFinite(n)) return;
  const settings = await getShopSettings();
  if (n <= (Number(settings.highest_printed_label) || 0)) return;
  if (settings.id) {
    await base44.entities.ShopSettings.update(settings.id, {
      highest_printed_label: n,
    });
  } else {
    await base44.entities.ShopSettings.create(
      withShop({ highest_printed_label: n })
    );
  }
}
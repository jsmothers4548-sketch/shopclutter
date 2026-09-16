import { base44 } from '@/api/base44Client';

export const DEFAULT_SETTINGS = {
  on_site_rate: 40,
  off_site_rate: 40,
  service_call_fee: 80,
  job_tax_rate: 9,
  sales_tax_rate: 9,
  overtime_rule: 'federal',
};

export async function getShopSettings() {
  const list = await base44.entities.ShopSettings.list('-created_date', 1);
  if (Array.isArray(list) && list.length) {
    return { ...DEFAULT_SETTINGS, ...list[0] };
  }
  return { ...DEFAULT_SETTINGS };
}
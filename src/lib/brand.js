import { getShopSettings } from '@/lib/shopSettings';

export const DEFAULT_BRAND = {
  name: 'Shop Clutter',
  logo_url: '',
  address: '',
  phone: '',
  email: '',
};

export async function getBrand() {
  try {
    const s = await getShopSettings();
    return {
      name: s.brand_name || DEFAULT_BRAND.name,
      logo_url: s.brand_logo_url || '',
      address: s.brand_address || '',
      phone: s.brand_phone || '',
      email: s.brand_email || '',
    };
  } catch (e) {
    return { ...DEFAULT_BRAND };
  }
}
import { getPlan, canWhiteLabel } from '@/lib/plans';

// What a shop sees as "the brand" depends on its plan:
//   - a free shop sees ShopClutter itself,
//   - a paid shop sees its own business identity (white-labelled).
// The public marketing site keeps the ShopClutter brand separately (lib/brand.js).
const PUBLIC_BRAND = {
  whiteLabel: false,
  name: 'ShopClutter',
  subtitle: 'Small Engine Repair',
  logo: '',
  address: '',
  phone: '',
  email: '',
};

const isUnset = (value) =>
  !value ||
  !String(value).trim() ||
  String(value).trim().toLowerCase() === 'shopclutter';

export function resolveVisibleBrand(settings, shop) {
  if (!canWhiteLabel(getPlan(shop?.plan_id))) {
    return { ...PUBLIC_BRAND };
  }

  const stored = settings?.brand_name;
  return {
    whiteLabel: true,
    name: isUnset(stored) ? shop?.name || 'ShopClutter' : String(stored).trim(),
    subtitle: String(settings?.brand_tagline || '').trim(),
    logo: settings?.brand_logo_url || '',
    address: settings?.brand_address || '',
    phone: settings?.brand_phone || '',
    email: settings?.brand_email || '',
  };
}
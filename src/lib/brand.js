// Branding shown on public pages (landing, legal, sign-in) is a fixed generic
// brand. Shop-specific name, logo, contact details and rates stay private to
// logged-in staff, so nothing here reads the shop settings record.
export const DEFAULT_BRAND = {
  name: 'ShopClutter',
  logo_url: '',
  address: '',
  phone: '',
  email: '',
};

export function getBrand() {
  return { ...DEFAULT_BRAND };
}
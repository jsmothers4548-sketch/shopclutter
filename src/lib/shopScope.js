import { base44 } from '@/api/base44Client';

// Every record in the app belongs to a shop. The shop id is stamped onto each
// new record here so the data-access rules can keep one shop's records away
// from another's.
const KEY = 'shop_clutter_shop_id';

let cachedShopId = null;

export function setShopId(id) {
  cachedShopId = id || null;
  try {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
  } catch (e) {
    // storage unavailable — the in-memory value still works
  }
}

export function getShopId() {
  if (cachedShopId) return cachedShopId;
  try {
    cachedShopId = localStorage.getItem(KEY) || null;
  } catch (e) {
    cachedShopId = null;
  }
  return cachedShopId;
}

// Resolve the shop id from the signed-in user, for the rare case where a
// record is created before the shop has been loaded.
async function resolveShopId() {
  const known = getShopId();
  if (known) return known;
  const me = await base44.auth.me();
  const id = me?.shop_id || me?.data?.shop_id || null;
  if (id) setShopId(id);
  return id;
}

// Stamp a record with the current shop.
export function withShop(data) {
  return { ...data, shop_id: getShopId() };
}

// Stamp a list of records with the current shop.
export function withShopAll(rows) {
  return (rows || []).map((row) => withShop(row));
}

// Stamp a record, making sure the shop is known first.
export async function withShopAsync(data) {
  return { ...data, shop_id: await resolveShopId() };
}

// Stamp a list of records, making sure the shop is known first.
export async function withShopAllAsync(rows) {
  const shop_id = await resolveShopId();
  return (rows || []).map((row) => ({ ...row, shop_id }));
}
// The only web addresses checkout may send people back to. Add a domain here
// (after connecting it to the app) to allow it — any address that is not on
// this list is ignored and the published app address is used instead.

export const ALLOWED_ORIGINS = [
  "https://shopclutter.com",
  "https://www.shopclutter.com",
  "https://shop-clutter.base44.app",
];

export const FALLBACK_ORIGIN = "https://shop-clutter.base44.app";

export function resolveOrigin(raw: string | null | undefined) {
  if (!raw) return FALLBACK_ORIGIN;
  let origin: string;
  try {
    origin = new URL(raw).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
  return ALLOWED_ORIGINS.includes(origin) ? origin : FALLBACK_ORIGIN;
}
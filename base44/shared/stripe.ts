import { secrets } from "base44:runtime";

const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2025-10-29.clover";

export function appId() {
  return secrets.get("BASE44_APP_ID");
}

function authHeaders() {
  return {
    Authorization: `Bearer ${secrets.get("STRIPE_SECRET_KEY")}`,
    "Stripe-Version": STRIPE_VERSION,
  };
}

// POST with form encoding. Stripe's {CHECKOUT_SESSION_ID} placeholder must
// reach Stripe unencoded, so undo the percent-encoding URLSearchParams adds.
export async function stripePost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params)
    .toString()
    .replace(/%7BCHECKOUT_SESSION_ID%7D/g, "{CHECKOUT_SESSION_ID}");
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Stripe POST failed", path, data?.error?.message);
    throw new Error(data?.error?.message || "Stripe request failed");
  }
  return data;
}

export async function stripeGet(path: string) {
  const res = await fetch(`${STRIPE_API}${path}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) {
    console.error("Stripe GET failed", path, data?.error?.message);
    throw new Error(data?.error?.message || "Stripe request failed");
  }
  return data;
}

export function mapStatus(status: string) {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return "canceled";
  }
  return "pending";
}

export function periodEndIso(subscription: any) {
  const seconds = subscription?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : undefined;
}

// Writes only the fields that carry a real value, so a partial update never
// blanks out data we already hold.
export async function updateShop(base44: any, shopId: string, patch: Record<string, any>) {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined && value !== null && value !== "") clean[key] = value;
  }
  if (!Object.keys(clean).length) return null;
  return await base44.entities.Shop.update(shopId, clean);
}
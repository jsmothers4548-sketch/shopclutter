// The plan a visitor picked on the pricing page, carried through sign-up
// (including the Google round-trip) until their shop record exists.

const KEY = 'shopclutter.pendingPlan';

export function setPendingPlan(planId, billingPeriod) {
  if (!planId) return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        plan_id: planId,
        billing_period: billingPeriod === 'annual' ? 'annual' : 'monthly',
      })
    );
  } catch {
    // storage unavailable — the shop simply starts on the free plan
  }
}

export function getPendingPlan() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingPlan() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to do
  }
}
import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getPendingPlan, clearPendingPlan } from '@/lib/pendingPlan';
import { getPlan, isPaidPlan } from '@/lib/plans';

// Guards against two mounts creating a shop at the same time.
let inFlight = null;

async function loadOrCreateShop(user) {
  const existing = await base44.entities.Shop.filter(
    { created_by_id: user.id },
    '-created_date',
    1
  );
  if (Array.isArray(existing) && existing.length) return existing[0];
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const pending = getPendingPlan();
    const plan = getPlan(pending?.plan_id || 'free');
    const paid = isPaidPlan(plan);
    const firstName = (user.full_name || '').split(' ')[0];
    const created = await base44.entities.Shop.create({
      name: firstName ? `${firstName}'s Shop` : 'My Shop',
      owner_email: user.email,
      plan_id: plan.id,
      plan_status: paid ? 'pending' : 'active',
      billing_period: pending?.billing_period === 'annual' ? 'annual' : 'monthly',
    });
    if (paid) clearPendingPlan();
    return created;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export default function useShop() {
  const { user, isLoadingAuth } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setShop(null);
      setLoading(false);
      return null;
    }
    const next = await loadOrCreateShop(user);
    setShop(next);
    setLoading(false);
    return next;
  }, [user]);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      setShop(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().catch(() => setLoading(false));
  }, [user, isLoadingAuth, refresh]);

  return { shop, loading, refresh, setShop };
}
import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// Guards against two mounts creating a shop at the same time.
let inFlight = null;

async function loadOrCreateShop(user) {
  const existing = await base44.entities.Shop.filter(
    { owner_id: user.id },
    '-created_date',
    1
  );
  if (Array.isArray(existing) && existing.length) return existing[0];
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const firstName = (user.full_name || '').split(' ')[0];
    const res = await base44.functions.invoke('provisionShop', {
      first_name: firstName,
    });
    return res.data?.shop || null;
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
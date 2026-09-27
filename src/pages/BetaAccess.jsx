import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Switch } from '@/components/ui/switch';
import { getPlan } from '@/lib/plans';
import { toast } from '@/components/ui/use-toast';
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react';

export default function BetaAccess() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('betaAccess', { action: 'list' });
      setShops(res.data?.shops || []);
    } catch (err) {
      if (err?.response?.status === 403) setDenied(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (shop, enabled) => {
    setBusyId(shop.id);
    try {
      const res = await base44.functions.invoke('betaAccess', {
        action: 'set',
        shop_id: shop.id,
        enabled,
      });
      const updated = res.data?.shop || {};
      setShops((list) =>
        list.map((s) =>
          s.id === shop.id
            ? {
                ...s,
                plan_id: updated.plan_id || s.plan_id,
                plan_status: updated.plan_status || s.plan_status,
                beta_access: enabled,
              }
            : s
        )
      );
      toast({
        title: enabled ? 'Full access turned on' : 'Full access turned off',
        description: enabled
          ? `${shop.name} now has every tool, free.`
          : `${shop.name} is back on the ${getPlan(updated.plan_id).name} plan.`,
      });
    } catch (err) {
      toast({
        title: 'Could not change access',
        description: err?.response?.data?.error || 'Please try again.',
      });
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="p-4">
        <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm text-slate-600">
            This screen is only available to the app owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500">
            <KeyRound className="h-5 w-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Beta access</h1>
            <p className="mt-1 text-sm text-slate-600">
              Turn full access on for a shop while they test. It stays on until you
              switch it off, and it costs them nothing.
            </p>
          </div>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          No shops yet.
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((shop) => {
            const plan = getPlan(shop.plan_id);
            return (
              <div
                key={shop.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-900">
                      {shop.name}
                    </p>
                    {shop.beta_access ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        Beta · full access
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {plan.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {shop.owner_name ? `${shop.owner_name} · ` : ''}
                    {shop.owner_email}
                  </p>
                </div>
                {busyId === shop.id ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-slate-400" />
                ) : (
                  <Switch
                    checked={!!shop.beta_access}
                    onCheckedChange={(next) => toggle(shop, next)}
                    aria-label={`Full access for ${shop.name}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
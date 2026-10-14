import React, { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import useShop from '@/hooks/useShop';
import { useAuth } from '@/lib/AuthContext';
import { PLANS, getPlan, isPaidPlan, isComingSoon } from '@/lib/plans';
import { getPendingPlan, clearPendingPlan } from '@/lib/pendingPlan';
import BillingToggle from '@/components/pricing/BillingToggle';
import CurrentPlanCard from '@/components/billing/CurrentPlanCard';
import PlanOption from '@/components/billing/PlanOption';

export default function Billing() {
  const { shop, loading, refresh } = useShop();
  const { user } = useAuth();
  const canManagePlan = !!shop && !!user && shop.owner_id === user.id;
  const [period, setPeriod] = useState('monthly');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [usage, setUsage] = useState({ jobs: 0, staff: 0 });
  const startedRef = useRef(false);
  const confirmedRef = useRef(false);

  const params = new URLSearchParams(window.location.search);
  const checkout = params.get('checkout');
  const sessionId = params.get('session_id');

  useEffect(() => {
    if (shop?.billing_period) setPeriod(shop.billing_period);
  }, [shop?.billing_period]);

  useEffect(() => {
    if (!shop) return undefined;
    let active = true;
    (async () => {
      const [jobs, staff] = await Promise.all([
        base44.entities.Job.list('-created_date', 500),
        base44.entities.Staff.list(),
      ]);
      if (!active) return;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const jobsThisMonth = (Array.isArray(jobs) ? jobs : []).filter(
        (j) => j.created_date && new Date(j.created_date) >= monthStart
      ).length;
      setUsage({ jobs: jobsThisMonth, staff: Array.isArray(staff) ? staff.length : 0 });
    })();
    return () => {
      active = false;
    };
  }, [shop]);

  const startCheckout = useCallback(
    async (planId, billingPeriod) => {
      if (!shop) return;
      if (window.self !== window.top) {
        window.alert(
          'Checkout works only from the published app. Open the app in its own tab to complete payment.'
        );
        return;
      }
      setNotice('');
      setBusy('checkout');
      try {
        const res = await base44.functions.invoke('createCheckout', {
          shop_id: shop.id,
          plan_id: planId,
          billing_period: billingPeriod,
        });
        if (res.data?.url) {
          window.location.href = res.data.url;
          return;
        }
        setNotice(res.data?.error || 'Could not start checkout.');
      } catch (err) {
        setNotice(err?.response?.data?.error || 'Could not start checkout.');
      } finally {
        setBusy('');
      }
    },
    [shop]
  );

  // Returning from Stripe — confirm the payment and activate the plan.
  useEffect(() => {
    if (!shop || confirmedRef.current) return;
    if (checkout !== 'success' || !sessionId) return;
    confirmedRef.current = true;
    setBusy('confirm');
    base44.functions
      .invoke('managePlan', { action: 'confirm', shop_id: shop.id, session_id: sessionId })
      .then(() => {
        clearPendingPlan();
        setNotice('Payment received — your plan is now active.');
        return refresh();
      })
      .catch((err) => {
        setNotice(
          err?.response?.data?.error ||
            'We could not confirm your payment yet. It will activate as soon as Stripe reports it.'
        );
      })
      .finally(() => {
        setBusy('');
        window.history.replaceState({}, '', '/billing');
      });
  }, [shop, checkout, sessionId, refresh]);

  useEffect(() => {
    if (checkout !== 'cancelled') return;
    setNotice('Checkout cancelled — no charge was made.');
    window.history.replaceState({}, '', '/billing');
  }, [checkout]);

  // Straight after sign-up on a paid plan — send them to checkout once.
  useEffect(() => {
    if (!shop || startedRef.current) return;
    if (checkout !== '1') return;
    const pending = getPendingPlan();
    const pendingPlan = pending ? getPlan(pending.plan_id) : null;
    if (!pendingPlan || !isPaidPlan(pendingPlan) || isComingSoon(pendingPlan)) {
      clearPendingPlan();
      return;
    }
    startedRef.current = true;
    startCheckout(pending.plan_id, pending.billing_period);
  }, [shop, checkout, startCheckout]);

  const handleChoose = async (planId) => {
    if (!shop) return;
    if (isComingSoon(getPlan(planId))) {
      setNotice('Multi-Location is coming soon and cannot be purchased yet.');
      return;
    }
    if (planId === 'free') {
      setNotice('');
      setBusy('plan');
      try {
        const res = await base44.functions.invoke('managePlan', {
          action: 'cancel',
          shop_id: shop.id,
        });
        setNotice(res.data?.message || 'Your plan has been changed.');
        await refresh();
      } catch (err) {
        setNotice(err?.response?.data?.error || 'Could not change your plan.');
      } finally {
        setBusy('');
      }
      return;
    }
    await startCheckout(planId, period);
  };

  const handleResume = async () => {
    if (!shop) return;
    setBusy('plan');
    try {
      const res = await base44.functions.invoke('managePlan', {
        action: 'resume',
        shop_id: shop.id,
      });
      setNotice(res.data?.message || 'Your plan will continue.');
      await refresh();
    } catch (err) {
      setNotice(err?.response?.data?.error || 'Could not update your subscription.');
    } finally {
      setBusy('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-4">
        <p className="py-20 text-center text-sm text-slate-600">
          We couldn't load your shop yet. Try reloading the page.
        </p>
      </div>
    );
  }

  const plan = getPlan(shop.plan_id);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-slate-900">Plan &amp; Billing</h1>

      {notice && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm">
          {notice}
        </div>
      )}

      {busy === 'confirm' && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm">
          Confirming your payment…
        </div>
      )}

      <CurrentPlanCard
        shop={shop}
        plan={plan}
        usage={usage}
        busy={!!busy}
        canManage={canManagePlan}
        onCompletePayment={() => startCheckout(shop.plan_id, shop.billing_period)}
        onResume={handleResume}
      />

      {canManagePlan ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Change plan</h2>
            <BillingToggle value={period} onChange={setPeriod} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PLANS.map((p) => (
              <PlanOption
                key={p.id}
                plan={p}
                period={period}
                current={shop.plan_id === p.id && shop.billing_period === period}
                busy={busy === 'checkout' || busy === 'plan'}
                onChoose={() => handleChoose(p.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Only the shop owner can change the plan.
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';
import UsageBar from '@/components/billing/UsageBar';
import { priceLabel, isPaidPlan } from '@/lib/plans';
import { Clock } from 'lucide-react';

const STATUS_LABEL = {
  active: 'Active',
  pending: 'Payment pending',
  past_due: 'Past due',
  canceled: 'Canceled',
};

function statusClass(status) {
  if (status === 'active') return 'bg-green-100 text-green-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export default function CurrentPlanCard({ shop, plan, usage, busy, onCompletePayment, onResume }) {
  if (!shop || !plan) return null;

  const status = shop.plan_status || 'active';
  const periodEnd = shop.current_period_end
    ? new Date(shop.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current plan
          </p>
          <p className="text-xl font-bold text-slate-900">{plan.name}</p>
          <p className="text-sm text-slate-600">
            {priceLabel(plan, shop.billing_period)}
            {isPaidPlan(plan) && shop.billing_period === 'annual' ? ' · billed yearly' : ''}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}
        >
          {STATUS_LABEL[status] || status}
        </span>
      </div>

      {status === 'pending' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>This plan isn't active until the payment goes through.</p>
            <Button size="sm" className="mt-2" onClick={onCompletePayment} disabled={busy}>
              Complete payment
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <UsageBar label="Jobs this month" used={usage.jobs} limit={plan.limits.jobs_per_month} />
        <UsageBar label="Team members" used={usage.staff} limit={plan.limits.staff} />
      </div>

      {periodEnd && (
        <p className="text-xs text-slate-500">
          {shop.cancel_at_period_end ? `Plan ends ${periodEnd}` : `Renews ${periodEnd}`}
        </p>
      )}

      {shop.cancel_at_period_end && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <span>Your plan is set to end at the end of this billing period.</span>
          <Button size="sm" variant="outline" onClick={onResume} disabled={busy}>
            Keep my plan
          </Button>
        </div>
      )}
    </div>
  );
}
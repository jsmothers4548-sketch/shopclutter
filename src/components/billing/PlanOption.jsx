import React from 'react';
import { Button } from '@/components/ui/button';
import { priceLabel, limitLabel, isPaidPlan } from '@/lib/plans';

export default function PlanOption({ plan, period, current, busy, onChoose }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        current ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900">{plan.name}</p>
          <p className="text-sm text-slate-600">{priceLabel(plan, period)}</p>
        </div>
        {current && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Current
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-1 text-xs text-slate-500">
        <li>{limitLabel(plan.limits.jobs_per_month)} jobs a month</li>
        <li>{limitLabel(plan.limits.staff)} team members</li>
        <li>
          {limitLabel(plan.limits.locations)}{' '}
          {plan.limits.locations === 1 ? 'location' : 'locations'}
        </li>
      </ul>
      <Button
        size="sm"
        className="mt-4 w-full"
        variant={current ? 'outline' : 'default'}
        disabled={current || busy}
        onClick={onChoose}
      >
        {current
          ? 'Your plan'
          : isPaidPlan(plan)
            ? `Switch to ${plan.name}`
            : 'Switch to Solo'}
      </Button>
    </div>
  );
}
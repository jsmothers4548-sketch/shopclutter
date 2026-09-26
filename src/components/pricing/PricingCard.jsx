import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { priceLabel, monthlyEquivalent, isPaidPlan } from '@/lib/plans';

export default function PricingCard({ plan, period }) {
  const paid = isPaidPlan(plan);
  const equivalent = monthlyEquivalent(plan, period);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
        plan.recommended
          ? 'border-primary shadow-lg ring-1 ring-primary/20'
          : 'border-slate-200 shadow-sm'
      }`}
    >
      {plan.recommended && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
      <p className="mt-1 min-h-[40px] text-sm text-slate-500">{plan.tagline}</p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {priceLabel(plan, period)}
      </p>
      <p className="mt-1 min-h-[18px] text-xs text-slate-500">{equivalent || ''}</p>
      <ul className="mt-6 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        className="mt-6 h-11 w-full"
        variant={plan.recommended ? 'default' : 'outline'}
      >
        <Link to={`/register?plan=${plan.id}&period=${period}`}>
          {paid ? `Choose ${plan.name}` : 'Start free'}
        </Link>
      </Button>
    </div>
  );
}
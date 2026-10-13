import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PLANS } from '@/lib/plans';
import MarketingShell from '@/components/marketing/MarketingShell';
import BillingToggle from '@/components/pricing/BillingToggle';
import PricingCard from '@/components/pricing/PricingCard';
import ComparisonTable from '@/components/marketing/ComparisonTable';
import CtaBand from '@/components/landing/CtaBand';

export default function Pricing() {
  const [period, setPeriod] = useState('monthly');

  return (
    <MarketingShell>
      <section className="px-6 pb-10 pt-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Plans
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Simple pricing that grows with your shop.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Start free with one person and a handful of tickets. Move up when the work does —
            change or cancel any time.
          </p>

          <div className="mt-8">
            <BillingToggle value={period} onChange={setPeriod} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} period={period} />
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Sign In
          </Link>
        </p>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Compare every plan.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            What each tier includes, side by side. Scroll the table sideways on a phone.
          </p>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <ComparisonTable />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-slate-500">
            Job directions &amp; on-site routing is a new addition we have placed on Team and
            above — tell us if you would rather see it on a different plan. Multi-location
            support is on the way.
          </p>
        </div>
      </section>

      <CtaBand
        title="Start free, decide later."
        body="No card to begin. Take in real jobs on the free plan and upgrade the day you need more."
      />
    </MarketingShell>
  );
}
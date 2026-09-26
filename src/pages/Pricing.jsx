import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useBrand from '@/hooks/useBrand';
import { PLANS } from '@/lib/plans';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import BillingToggle from '@/components/pricing/BillingToggle';
import PricingCard from '@/components/pricing/PricingCard';

export default function Pricing() {
  const brand = useBrand();
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader brand={brand} />
      <main className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Plans
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Simple pricing that grows with your shop.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Start free with one person and a handful of tickets. Move up when the work does —
            change or cancel any time.
          </p>

          <div className="mt-8">
            <BillingToggle value={period} onChange={setPeriod} />
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <PricingCard key={plan.id} plan={plan} period={period} />
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
      <LandingFooter brand={brand} />
    </div>
  );
}
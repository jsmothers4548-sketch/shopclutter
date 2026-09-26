import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingHero({ brand }) {
  return (
    <section className="px-6 pt-14 pb-16 sm:pt-24 sm:pb-24">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          Built by a small engine tech
        </p>
        <h1 className="mt-5 text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
          The all-in-one shop manager that grows with your business.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
          Whether you&rsquo;re a one-man shop or managing a large team, {brand.name}{' '}
          organizes your jobs, customers, parts and invoices without the mess.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="h-12 sm:w-auto">
            <Link to="/pricing">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 sm:w-auto">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Phone <span className="mx-1.5 text-slate-300">·</span> Tablet{' '}
          <span className="mx-1.5 text-slate-300">·</span> Desktop
        </p>
        <p className="mt-3 text-sm text-slate-500">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline hover:text-slate-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="underline hover:text-slate-700">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
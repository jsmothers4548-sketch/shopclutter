import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MARKETING_IMAGES } from '@/lib/marketingImages';

export default function LandingHero({ brand }) {
  return (
    <section className="px-6 pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Built by a small engine tech
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
            Stop running your repair shop out of a notebook.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
            Tickets go missing. Estimates never get sent. Invoices wait until Sunday night.{' '}
            {brand.name} keeps the jobs, estimates, invoices, parts, inventory and reminders in
            one place, so the paperwork stops eating your evenings.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Shop management software for small engine and equipment repair — from a one-man
            bench to a full crew.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 sm:w-auto">
              <Link to="/register">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 sm:w-auto">
              <Link to="/features">See what it does</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Free to start, no card needed
            <span className="mx-1.5 text-slate-300">·</span>Phone
            <span className="mx-1.5 text-slate-300">·</span>Tablet
            <span className="mx-1.5 text-slate-300">·</span>Desktop
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10">
            <img
              src={MARKETING_IMAGES.bench}
              alt="A mechanic repairing a riding mower engine on a workbench in a small engine shop"
              className="h-[280px] w-full object-cover sm:h-[420px] lg:h-[520px]"
            />
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              On the board today
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">Intake 6 · In Progress 4</p>
            <p className="text-xs text-slate-500">Ready for Pickup 3</p>
          </div>
        </div>
      </div>
    </section>
  );
}
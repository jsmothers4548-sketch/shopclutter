import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FounderStory({ brand }) {
  return (
    <section className="bg-slate-900 px-6 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
          Why it exists
        </p>
        <blockquote className="mt-6 text-2xl sm:text-3xl font-medium leading-snug text-white">
          “I’ve spent years with my hands inside mowers, generators and chainsaws. What ate
          my evenings was never the wrench — it was the paperwork. So I built the tool I
          wanted on my own bench.”
        </blockquote>
        <p className="mt-6 text-slate-400">
          Every screen in {brand.name} exists because a real shop needed it: the ticket that
          follows a unit from intake to closed, the estimate a customer approves from their
          phone, the parts and hours that tell you whether a job actually made money, and the
          reminder that keeps a callback from slipping.
        </p>
        <p className="mt-4 text-sm font-semibold text-slate-300">
          — {brand.name}, small engine repair
        </p>
        <div className="mt-8">
          <Button asChild size="lg" variant="secondary" className="h-12">
            <Link to="/pricing">Start Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
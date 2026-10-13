import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MARKETING_IMAGES } from '@/lib/marketingImages';

export default function FounderStory({ brand }) {
  return (
    <section className="bg-slate-900 px-6 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
            Why it exists
          </p>
          <blockquote className="mt-6 text-2xl font-medium leading-snug text-white sm:text-3xl">
            “I’ve spent years with my hands inside mowers, generators and chainsaws. What ate my
            evenings was never the wrench — it was the paperwork. So I built the tool I wanted on
            my own bench.”
          </blockquote>
          <p className="mt-6 leading-relaxed text-slate-400">
            Every screen in {brand.name} exists because a real shop needed it: the ticket that
            follows a unit from intake to closed, the estimate a customer approves from their
            phone, the parts and hours that tell you whether a job actually made money, and the
            reminder that keeps a callback from slipping.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="secondary" className="h-12">
              <Link to="/about">Read the story</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              <Link to="/pricing">Start Now</Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10">
          <img
            src={MARKETING_IMAGES.hands}
            alt="Close-up of a mechanic's hands with a wrench on a small engine"
            className="h-[260px] w-full object-cover sm:h-[400px] lg:h-[460px]"
          />
        </div>
      </div>
    </section>
  );
}
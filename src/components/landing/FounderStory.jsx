import React from 'react';

export default function FounderStory({ brand }) {
  return (
    <section className="bg-slate-900 px-6 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
          Why it exists
        </p>
        <blockquote className="mt-6 text-2xl sm:text-3xl font-medium leading-snug text-white">
          “I’ve spent years with my hands inside mowers, generators and chainsaws. The
          paperwork was always the part that ate my evenings — so I built the tool I
          wanted on my own bench.”
        </blockquote>
        <p className="mt-6 text-slate-400">
          Every screen in {brand.name} exists because a real shop needed it: the ticket
          that follows a unit from intake to closed, the estimate a customer can approve
          from their phone, the parts and hours that actually made you money.
        </p>
        <p className="mt-4 text-sm font-semibold text-slate-300">
          — {brand.name}, small engine repair
        </p>
      </div>
    </section>
  );
}
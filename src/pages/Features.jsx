import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import CtaBand from '@/components/landing/CtaBand';
import { FEATURES } from '@/lib/features';

export default function Features() {
  return (
    <MarketingShell>
      <section className="px-6 pb-10 pt-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Features
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Everything the shop needs, nothing it doesn’t.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            One app for the whole job — from the moment a unit comes through the door to the day
            you get paid. Built for a one-man bench and a full crew alike.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.slug}
                to={`/features/${feature.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
              >
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  className="h-[170px] w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-base font-bold tracking-tight text-slate-900">
                    {feature.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {feature.tagline}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <CtaBand
        title="See it on your own jobs."
        body="Start free and take in your first ticket today — no card needed, and no setup call."
      />
    </MarketingShell>
  );
}
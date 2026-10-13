import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import CtaBand from '@/components/landing/CtaBand';
import PageNotFound from '@/lib/PageNotFound';
import { FEATURES, getFeature } from '@/lib/features';

export default function FeatureDetail() {
  const { slug } = useParams();
  const feature = getFeature(slug);

  if (!feature) return <PageNotFound />;

  const Icon = feature.icon;
  const related = FEATURES.filter((f) => f.slug !== feature.slug).slice(0, 3);

  return (
    <MarketingShell>
      <section className="px-6 pt-10 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All features
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {feature.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">{feature.intro}</p>
              <ul className="mt-7 space-y-2.5">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
              <img
                src={feature.image}
                alt={feature.imageAlt}
                className="h-[260px] w-full object-cover sm:h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-10">
            {feature.sections.map((section) => (
              <div key={section.heading} className="border-l-2 border-amber-200 pl-5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {section.heading}
                </h2>
                <p className="mt-3 leading-relaxed text-slate-600">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Keep exploring</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {related.map((item) => {
              const RelatedIcon = item.icon;
              return (
                <Link
                  key={item.slug}
                  to={`/features/${item.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <RelatedIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Learn more
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to put it to work?"
        body="Start free, take in a job today, and see how much of the evening you get back."
      />
    </MarketingShell>
  );
}
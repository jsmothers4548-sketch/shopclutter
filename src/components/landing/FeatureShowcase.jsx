import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getFeature, HOMEPAGE_FEATURE_SLUGS } from '@/lib/features';

export default function FeatureShowcase() {
  const features = HOMEPAGE_FEATURE_SLUGS.map(getFeature).filter(Boolean);

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          A closer look
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          The parts of the day that used to get away from you.
        </h2>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const flipped = index % 2 === 1;
            return (
              <div
                key={feature.slug}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <div className={flipped ? 'lg:order-2' : ''}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-slate-600">{feature.intro}</p>
                  <ul className="mt-6 space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/features/${feature.slug}`}
                    className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    More on {feature.title.split(',')[0]}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className={flipped ? 'lg:order-1' : ''}>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5">
                    <img
                      src={feature.image}
                      alt={feature.imageAlt}
                      className="h-[240px] w-full object-cover sm:h-[340px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Browse every feature
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Users } from 'lucide-react';
import { MARKETING_IMAGES } from '@/lib/marketingImages';

const PATHS = [
  {
    icon: Wrench,
    title: 'The one-man bench',
    body: 'You are the front desk, the tech and the bookkeeper. Take in a job in a minute, send the estimate from your phone, and let the reminders hold the callbacks you cannot.',
    points: ['Take in a job by voice while your hands are full', 'Text the estimate and the invoice', 'Free to start, upgrade only if the work outgrows it'],
    image: MARKETING_IMAGES.phone,
    imageAlt: 'A mechanic holding a phone showing a repair job ticket',
  },
  {
    icon: Users,
    title: 'The growing crew',
    body: 'Two bays, three techs, a front counter. Everyone sees the same board, hours land in timecards on their own, and you can finally see what each job and each person actually makes.',
    points: ['Assign work and let each tech filter to their own list', 'Shift clock, job timers and weekly timecards', 'Profit and employee earnings reports for the owner'],
    image: MARKETING_IMAGES.crew,
    imageAlt: 'Two mechanics reviewing work together at a bench in a small engine shop',
  },
];

export default function ShopFit() {
  return (
    <section className="bg-slate-50 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          Who it is for
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Built for the bench you have now, and the one you are growing into.
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.title}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={path.image}
                  alt={path.imageAlt}
                  className="h-[200px] w-full object-cover sm:h-[240px]"
                />
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
                    {path.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{path.body}</p>
                  <ul className="mt-5 flex-1 space-y-2">
                    {path.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/pricing"
                    className="mt-6 text-sm font-semibold text-primary hover:underline"
                  >
                    See plans
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
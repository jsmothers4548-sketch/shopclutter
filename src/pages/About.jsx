import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ClipboardList, Users, MapPin } from 'lucide-react';
import MarketingShell from '@/components/marketing/MarketingShell';
import CtaBand from '@/components/landing/CtaBand';
import { MARKETING_IMAGES } from '@/lib/marketingImages';

const PRINCIPLES = [
  {
    icon: Wrench,
    title: 'Built on a real bench',
    body: 'Every screen exists because a shop needed it — the ticket that follows a unit from intake to closed, the parts and hours that tell you whether a job made money.',
  },
  {
    icon: ClipboardList,
    title: 'Fast enough for dirty hands',
    body: 'Taking in a job happens between two other jobs. It should take a minute, on a phone, standing at the bench — not a training session at a desk.',
  },
  {
    icon: Users,
    title: 'One person or a full crew',
    body: 'A solo mechanic should never pay for a scheduling committee, and a shop with three bays should never outgrow the tool in a year.',
  },
  {
    icon: MapPin,
    title: 'The road matters too',
    body: 'Plenty of this work happens at the customer’s place. The address, the route and the callback all belong on the same ticket as the repair.',
  },
];

export default function About() {
  return (
    <MarketingShell>
      <section className="px-6 pb-12 pt-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            About
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            We build this from inside a repair shop.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Not from a conference room, and not from a list of features somebody guessed at. From
            the bench, the bay and the counter.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5">
          <img
            src={MARKETING_IMAGES.storefront}
            alt="A small engine repair shop storefront lit up at dusk with mowers by the door"
            className="h-[260px] w-full object-cover sm:h-[440px]"
          />
        </div>
      </section>

      <section className="px-6 pb-16 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <blockquote className="text-2xl font-medium leading-snug text-slate-900 sm:text-3xl">
              “I’ve spent years with my hands inside mowers, generators and chainsaws. What ate my
              evenings was never the wrench — it was the paperwork.”
            </blockquote>
            <div className="mt-8 space-y-5 leading-relaxed text-slate-600">
              <p>
                In a small engine shop, the work itself is the easy part. You diagnose it, you fix
                it, you hand it back. The part that wears you down is everything wrapped around
                it: the ticket you wrote on a scrap of paper, the estimate you meant to send
                Tuesday, the invoice stack that waited for a quiet Sunday night, the callback that
                slipped because a mower came in with a seized deck.
              </p>
              <p>
                Most shop software is built for a dealer with a service writer and a front desk.
                Small engine work does not look like that. It is one person at a bench, or three
                people sharing a bay, taking in push mowers, trimmers, generators, snowblowers and
                the occasional machine nobody makes parts for anymore.
              </p>
              <p>
                So ShopClutter is built the way the shop actually runs. Fast intake. A board
                that matches the floor. Estimates and invoices that go out from the same phone in
                your pocket. Parts, hours, and pay that add up without you doing the math at
                midnight. And the small things that keep a shop honest — the reminder, the time
                clock, the record of who changed what.
              </p>
              <p>
                We are still a shop tool first. Every release starts with a question from the
                bench: does this make the day easier, or just busier?
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5">
              <img
                src={MARKETING_IMAGES.hands}
                alt="Close-up of a mechanic's hands with a wrench on a small engine"
                className="h-[220px] w-full object-cover sm:h-[280px]"
              />
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg shadow-slate-900/5">
              <img
                src={MARKETING_IMAGES.crew}
                alt="Two mechanics reviewing work together at a bench in a small engine shop"
                className="h-[220px] w-full object-cover sm:h-[280px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What that means for the app.
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-white">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12">
            <Link
              to="/features"
              className="text-sm font-semibold text-primary hover:underline"
            >
              See how it works, feature by feature
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Built for your bench."
        body="Start free, take in a job today, and tell us what would make the day easier."
      />
    </MarketingShell>
  );
}
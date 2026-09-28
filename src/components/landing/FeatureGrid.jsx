import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Receipt,
  Wrench,
  Users,
  Mic,
  Layers,
  Package,
  ShoppingCart,
  Bell,
  Clock,
  ListChecks,
  BarChart3,
  Palette,
  MapPin,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Job tracking, intake to closed',
    body: 'Every unit on one board — intake, diagnosed, waiting on parts, ready for pickup. No more walking the shop to figure out where a mower stands.',
  },
  {
    icon: Receipt,
    title: 'Estimates, invoices & payments',
    body: 'Itemize parts, labor, pickup and delivery, send an estimate the customer can approve from their phone, then take deposits and final payment on the spot.',
  },
  {
    icon: Wrench,
    title: 'Parts & labor on every ticket',
    body: 'Log each part and each hour against the job, with discounts, tax and profit worked out for you — including the parts you already had on the shelf.',
  },
  {
    icon: Users,
    title: 'Customers & equipment history',
    body: 'Every customer keeps their units, past repairs and contact details. Tap to call or text without digging through a card file.',
  },
  {
    icon: Mic,
    title: 'Voice intake & QR unit labels',
    body: 'Describe the job out loud and let the form fill itself in. Stick a QR label on the unit and scan it to jump straight to that ticket.',
  },
  {
    icon: Layers,
    title: 'Job templates',
    body: 'Save the parts and hours for a repair you do all the time, then load the whole thing onto the next job in a tap.',
  },
  {
    icon: Package,
    title: 'Inventory & supplier orders',
    body: 'Know what is on the shelf, what it is worth and what needs reordering — then build a supplier order to text or email.',
  },
  {
    icon: ShoppingCart,
    title: 'Storefront sales',
    body: 'Ring up counter sales — blades, oil, filters — and keep a running balance on each one, separate from repair tickets.',
  },
  {
    icon: Bell,
    title: 'Scheduling, appointments & reminders',
    body: 'On-site and off-site appointments, callbacks and follow-ups in one list, so nothing slips while you are under a hood.',
  },
  {
    icon: Clock,
    title: 'Time clock, timecards & crew pay',
    body: 'The crew clocks in and out from their phone. Hours turn into weekly timecards and pay, with overtime figured out for you.',
  },
  {
    icon: ListChecks,
    title: 'Staff tasks & reimbursements',
    body: 'Hand out shop tasks and track them through to done. See what you owe each person for out-of-pocket parts and expenses.',
  },
  {
    icon: BarChart3,
    title: 'Profit reports & tax',
    body: 'Revenue, costs, profit and tax collected across any period — by job, by person, by part, so you know what actually pays.',
  },
  {
    icon: Palette,
    title: 'Your logo & business name',
    body: 'Put your own logo and shop name on the app, your estimates and your invoices, instead of somebody else’s branding.',
  },
  {
    icon: MapPin,
    title: 'Multiple locations',
    body: 'More than one shop under a single login, each with its own jobs, customers, inventory and crew.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Everything the shop needs, nothing it doesn’t.
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          One app for the whole job — from the moment a unit comes through the door to the
          day you get paid. Built for a one-man bench and a full crew alike.
        </p>
        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title}>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-14 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12">
            <Link to="/pricing">Start Now</Link>
          </Button>
          <p className="text-sm text-slate-500">
            Free to start, no card needed. Upgrade when the shop outgrows it.
          </p>
        </div>
      </div>
    </section>
  );
}
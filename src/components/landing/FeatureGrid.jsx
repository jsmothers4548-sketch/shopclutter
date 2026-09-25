import React from 'react';
import {
  ClipboardList,
  Receipt,
  Wrench,
  Users,
  Package,
  Bell,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'A job board that matches the work',
    body: 'Intake, diagnosed, waiting on parts, ready for pickup — see every unit and where it stands at a glance.',
  },
  {
    icon: Receipt,
    title: 'Estimates and invoices',
    body: 'Itemize parts, labor, pickup and delivery, then text or print a clean document for the customer.',
  },
  {
    icon: Wrench,
    title: 'Parts and labor tracking',
    body: 'Log every part and every hour against the job, with discounts, tax and profit worked out for you.',
  },
  {
    icon: Users,
    title: 'Customers and equipment history',
    body: 'Each customer keeps their units, repair history and contact details — tap to call or text in one move.',
  },
  {
    icon: Package,
    title: 'Shop inventory',
    body: 'Track stock levels, suppliers and reorder points so the shelf is right when the next job walks in.',
  },
  {
    icon: Bell,
    title: 'Scheduling and reminders',
    body: 'Appointments, follow-ups and staff tasks in one list, so nothing slips while you are under a hood.',
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
          Built for one-truck shops and growing service teams alike.
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
      </div>
    </section>
  );
}
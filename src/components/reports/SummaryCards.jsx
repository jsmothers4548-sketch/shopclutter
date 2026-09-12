import React from 'react';
import { formatCurrency } from '@/lib/format';

export default function SummaryCards({ revenue, cost, profit, tax }) {
  const items = [
    { label: 'Gross Revenue', value: revenue, tone: 'text-green-600' },
    { label: 'Total Costs', value: cost, tone: 'text-red-600' },
    {
      label: 'Net Profit',
      value: profit,
      tone: profit >= 0 ? 'text-blue-600' : 'text-red-600',
    },
    { label: 'Tax Collected', value: tax, tone: 'text-slate-900' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {items.map((it) => (
        <div
          key={it.label}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {it.label}
          </p>
          <p className={`text-lg md:text-xl font-bold mt-1 tabular-nums ${it.tone}`}>
            {formatCurrency(it.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
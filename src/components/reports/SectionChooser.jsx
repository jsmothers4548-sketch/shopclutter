import React from 'react';
import {
  FileText,
  Users,
  Wrench,
  ShoppingCart,
  Package,
  Receipt,
  TrendingUp,
} from 'lucide-react';

// Landing-view tiles for the Reports page: one card per statement section.
const SECTIONS = [
  {
    key: 'pl',
    label: 'Profit & Loss',
    hint: 'Income, expenses & net profit',
    icon: FileText,
  },
  {
    key: 'earnings',
    label: 'Employee Earnings',
    hint: 'Hours, charged & earned pay',
    icon: Users,
  },
  {
    key: 'jobs',
    label: 'Jobs',
    hint: 'Per-job revenue & profit',
    icon: Wrench,
  },
  {
    key: 'sales',
    label: 'Sales',
    hint: 'Counter sales breakdown',
    icon: ShoppingCart,
  },
  {
    key: 'parts',
    label: 'Parts',
    hint: 'Part usage & costs',
    icon: Package,
  },
  {
    key: 'expenditures',
    label: 'Expenditures',
    hint: 'All spending, itemized',
    icon: Receipt,
  },
  {
    key: 'spending',
    label: 'Parts Spending',
    hint: 'Searchable usage log',
    icon: TrendingUp,
  },
];

export default function SectionChooser({ onSelect }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {SECTIONS.map(({ key, label, hint, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="flex flex-col items-start gap-1 bg-white rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-amber-400 hover:bg-amber-50/60 active:bg-amber-100"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Icon className="w-4 h-4 text-amber-600" /> {label}
          </span>
          <span className="text-xs text-slate-400">{hint}</span>
        </button>
      ))}
    </div>
  );
}
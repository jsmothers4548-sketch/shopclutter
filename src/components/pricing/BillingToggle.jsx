import React from 'react';
import { PERIODS } from '@/lib/plans';

export default function BillingToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
      {PERIODS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active ? 'bg-primary text-primary-foreground' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {p.label}
            {p.note && (
              <span
                className={`ml-1.5 text-[11px] font-medium ${
                  active ? 'text-primary-foreground/80' : 'text-slate-400'
                }`}
              >
                {p.note}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
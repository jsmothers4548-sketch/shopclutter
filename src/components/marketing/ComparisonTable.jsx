import React from 'react';
import { Check } from 'lucide-react';
import { COMPARISON_GROUPS, COMPARISON_PLANS } from '@/lib/planComparison';

function Cell({ value }) {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-primary" aria-label="Included" />;
  }
  if (value === false) {
    return (
      <span className="text-slate-300" aria-label="Not included">
        —
      </span>
    );
  }
  return <span className="font-semibold text-slate-900">{value}</span>;
}

export default function ComparisonTable() {
  const columnCount = COMPARISON_PLANS.length + 1;

  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white pb-4 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Compare
            </th>
            {COMPARISON_PLANS.map((plan) => (
              <th
                key={plan.id}
                className="w-24 pb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-900 sm:w-28"
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>

        {COMPARISON_GROUPS.map((group) => (
          <tbody key={group.group}>
            <tr>
              <td
                colSpan={columnCount}
                className="border-t border-slate-200 pb-2 pt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
              >
                {group.group}
              </td>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100">
                <td className="sticky left-0 z-10 bg-white py-3 pr-4 text-left text-slate-700">
                  <span className="flex flex-wrap items-center gap-2">
                    {row.label}
                    {row.tag && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        {row.tag}
                      </span>
                    )}
                  </span>
                </td>
                {COMPARISON_PLANS.map((plan) => (
                  <td key={plan.id} className="py-3 text-center">
                    <Cell value={row.values[plan.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
import React from 'react';
import { formatCurrency } from '@/lib/format';

export default function BreakdownList({
  title,
  rows,
  visible,
  onShowMore,
  onShowAll,
  onSelect,
  emptyLabel,
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
      <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm mb-3">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-1">
          {rows.slice(0, visible).map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {r.title}
                </p>
                <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(r.revenue)}
                </p>
                <p
                  className={`text-xs font-medium tabular-nums ${
                    r.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {r.profit >= 0 ? '+' : ''}
                  {formatCurrency(r.profit)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {rows.length > visible && (
        <div className="flex justify-center gap-3 pt-3 print:hidden">
          <button
            onClick={onShowMore}
            className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            Show 10 more
          </button>
          <button
            onClick={onShowAll}
            className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
          >
            Show all ({rows.length})
          </button>
        </div>
      )}
    </section>
  );
}
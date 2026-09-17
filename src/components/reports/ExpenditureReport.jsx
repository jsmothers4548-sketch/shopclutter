import React from 'react';
import { formatCurrency } from '@/lib/format';

const TYPE_LABELS = ['Purchase', 'Job Part', 'Counter Sale', 'Expense'];

export default function ExpenditureReport({
  periodLabel,
  rows,
  totals,
  visible,
  onShowMore,
  onShowAll,
  onOpen,
  actions,
}) {
  const byType = totals?.byType || {};

  const rowContent = (r) => (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 truncate">
          {r.description}
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {' '}
            · {r.type}
          </span>
        </p>
        <p className="text-xs text-slate-400 truncate">
          {new Date(r.date).toLocaleDateString()}
          {r.source ? ` · ${r.source}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-slate-900 tabular-nums">
          {formatCurrency(r.amount)}
        </p>
        {r.qty != null && r.qty > 0 && (
          <p className="text-xs text-slate-400 tabular-nums">
            {r.qty} × {formatCurrency(r.unitCost)}
          </p>
        )}
      </div>
    </>
  );

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm">
          Itemized Expenditures — {periodLabel}
        </h2>
        {actions}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No expenditures in this period
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
            {TYPE_LABELS.map((t) => (
              <div key={t} className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t}
                </p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatCurrency(byType[t] || 0)}
                </p>
              </div>
            ))}
            <div className="bg-slate-900 rounded-lg p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Total
              </p>
              <p className="text-sm font-bold text-white tabular-nums">
                {formatCurrency(totals?.total || 0)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {rows.slice(0, visible).map((r) =>
              r.link && onOpen ? (
                <button
                  key={r.id}
                  onClick={() => onOpen(r)}
                  className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 text-left"
                >
                  {rowContent(r)}
                </button>
              ) : (
                <div
                  key={r.id}
                  className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0"
                >
                  {rowContent(r)}
                </div>
              )
            )}
          </div>
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
        </>
      )}
    </section>
  );
}
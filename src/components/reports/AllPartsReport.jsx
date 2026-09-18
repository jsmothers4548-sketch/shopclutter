import React, { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/format';
import PartNameSearch from '@/components/reports/PartNameSearch';

export default function AllPartsReport({
  periodLabel,
  rows,
  visible,
  onShowMore,
  onShowAll,
  onSelect,
  actions,
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.partNumber].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [rows, q]);

  const totalCost = filtered.reduce((a, r) => a + r.totalCost, 0);
  const totalQty = filtered.reduce((a, r) => a + r.qty, 0);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm">
          All Parts — {periodLabel}
          {q && (
            <span className="normal-case font-medium text-slate-500">
              {' '}
              · matching “{query.trim()}” ({filtered.length})
            </span>
          )}
        </h2>
        {actions}
      </div>
      <PartNameSearch value={query} onChange={setQuery} />
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          {q
            ? `No parts match “${query.trim()}” in this period`
            : 'No parts used in this period'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {q ? 'Matches' : 'Distinct Parts'}
              </p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                {filtered.length}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Qty
              </p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                {totalQty}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Cost
              </p>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {filtered.slice(0, visible).map((r) => (
              <div
                key={r.key}
                onClick={onSelect ? () => onSelect(r) : undefined}
                className={`flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0 ${
                  onSelect ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {r.partNumber ? `${r.partNumber} · ` : ''}
                    {r.lines} line{r.lines === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(r.totalCost)}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {r.qty} used
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filtered.length > visible && (
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
                Show all ({filtered.length})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
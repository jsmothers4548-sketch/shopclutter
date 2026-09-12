import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

const UsageRow = ({ row, onSelect }) => (
  <button
    onClick={() => onSelect(row.link, row.kind)}
    className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 text-left"
  >
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-900 truncate">{row.name}</p>
      <p className="text-xs text-slate-400 truncate">
        {row.where} · {row.date}
      </p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-semibold text-slate-900 tabular-nums">
        {formatCurrency(row.total)}
      </p>
      <p className="text-xs text-slate-400 tabular-nums">
        {row.qty} × {formatCurrency(row.unit)}
      </p>
    </div>
  </button>
);

export default function PartsSpendingReport({
  year,
  parts,
  saleItems,
  jobs,
  sales,
  onOpenJob,
  onOpenSale,
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const jobById = useMemo(
    () => Object.fromEntries(jobs.map((j) => [j.id, j])),
    [jobs]
  );
  const saleById = useMemo(
    () => Object.fromEntries(sales.map((s) => [s.id, s])),
    [sales]
  );

  const usages = useMemo(() => {
    const rows = [];
    for (const p of parts) {
      if (new Date(p.created_date).getFullYear() !== year) continue;
      const hay = `${p.name || ''} ${p.part_number || ''}`.toLowerCase();
      if (q && !hay.includes(q)) continue;
      const job = jobById[p.job_id];
      rows.push({
        kind: 'job',
        id: p.id,
        link: p.job_id,
        name: p.name || 'Part',
        where: job
          ? `Ticket #${job.ticket_number || '—'} · ${job.customer_name || ''}`.trim()
          : 'Job',
        date: new Date(p.created_date).toLocaleDateString(),
        qty: Number(p.quantity) || 0,
        unit: Number(p.unit_cost) || 0,
        total: (Number(p.quantity) || 0) * (Number(p.unit_cost) || 0),
      });
    }
    for (const it of saleItems) {
      if (new Date(it.created_date).getFullYear() !== year) continue;
      const hay = `${it.description || ''} ${it.part_number || ''}`.toLowerCase();
      if (q && !hay.includes(q)) continue;
      const sale = saleById[it.sale_id];
      rows.push({
        kind: 'sale',
        id: it.id,
        link: it.sale_id,
        name: it.description || 'Item',
        where: sale ? `Sale · ${sale.customer_name || 'Walk-in'}` : 'Sale',
        date: new Date(it.created_date).toLocaleDateString(),
        qty: Number(it.quantity) || 0,
        unit: Number(it.unit_price) || 0,
        total: (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
      });
    }
    return rows.sort((a, b) => b.total - a.total);
  }, [parts, saleItems, year, q, jobById, saleById]);

  const totals = useMemo(() => {
    const spent = usages.reduce((a, r) => a + r.total, 0);
    const qty = usages.reduce((a, r) => a + r.qty, 0);
    return { spent, qty, avg: usages.length ? spent / usages.length : 0 };
  }, [usages]);

  const handleSelect = (link, kind) =>
    kind === 'job' ? onOpenJob(link) : onOpenSale(link);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm">
          Parts Spending — {year}
        </h2>
        <div className="relative md:ml-auto print:hidden w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts (e.g. spark plug)"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {q ? (
        usages.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Qty Used
                </p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">
                  {totals.qty}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Spent
                </p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatCurrency(totals.spent)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Avg per Line
                </p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatCurrency(totals.avg)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {usages.slice(0, 50).map((r) => (
                <UsageRow key={r.kind + r.id} row={r} onSelect={handleSelect} />
              ))}
            </div>
            {usages.length > 50 && (
              <p className="text-xs text-slate-400 text-center pt-2">
                Showing top 50 of {usages.length} matches
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            No parts match "{query}" in {year}
          </p>
        )
      ) : (
        <p className="text-sm text-slate-400 text-center py-4">
          Type a part name or number above to see everywhere it's been used
          across jobs and sales this year.
        </p>
      )}
    </section>
  );
}
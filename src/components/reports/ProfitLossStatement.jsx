import React from 'react';
import { formatCurrency } from '@/lib/format';

const Row = ({ label, value, className = '', labelClass = '' }) => (
  <div className={`flex justify-between gap-2 text-sm ${className}`}>
    <span className={labelClass || 'text-slate-600'}>{label}</span>
    <span className="font-medium tabular-nums">{value}</span>
  </div>
);

export default function ProfitLossStatement({
  periodLabel,
  totals,
  salesTotals,
  combined,
  payments = { jobs: 0, sales: 0, total: 0 },
  actions,
}) {
  const totalExpenses =
    totals.partsCost +
    totals.laborCost +
    (totals.expenseCost || 0) +
    salesTotals.cost;

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm">
          Statement of Profit &amp; Loss — {periodLabel}
        </h2>
        {actions}
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Income
        </p>
        <Row label="Job Income" value={formatCurrency(totals.revenue)} />
        <Row label="Sales Income" value={formatCurrency(salesTotals.revenue)} />
        <Row
          label="Gross Revenue"
          value={formatCurrency(combined.revenue)}
          className="font-bold border-t border-slate-200 pt-2"
          labelClass="text-slate-900 font-semibold"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Expenses
        </p>
        <Row
          label="Parts Cost (jobs)"
          value={`(${formatCurrency(totals.partsCost)})`}
        />
        <Row
          label="Item Cost (sales)"
          value={`(${formatCurrency(salesTotals.cost)})`}
        />
        <Row
          label="Employee Wages"
          value={`(${formatCurrency(totals.laborCost)})`}
        />
        {(totals.expenseCost || 0) > 0 && (
          <Row
            label="Out-of-Pocket Expenses"
            value={`(${formatCurrency(totals.expenseCost)})`}
          />
        )}
        <Row
          label="Total Expenses"
          value={`(${formatCurrency(totalExpenses)})`}
          className="font-bold border-t border-slate-200 pt-2"
          labelClass="text-slate-900 font-semibold"
        />
      </div>

      <div className="flex justify-between border-t-2 border-slate-900 pt-3">
        <span className="text-base font-bold uppercase tracking-wide text-slate-900">
          Net Profit
        </span>
        <span
          className={`text-base font-bold tabular-nums ${
            combined.profit >= 0 ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {formatCurrency(combined.profit)}
        </span>
      </div>

      <div className="space-y-1 border-t border-slate-100 pt-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Memo
        </p>
        <Row label="Job Tax Collected" value={formatCurrency(totals.taxCollected)} />
        <Row label="Sales Tax Collected" value={formatCurrency(salesTotals.tax)} />
        <Row
          label="Payments Received (Jobs)"
          value={formatCurrency(payments.jobs)}
        />
        <Row
          label="Payments Received (Sales)"
          value={formatCurrency(payments.sales)}
        />
        <Row
          label="Total Cash Collected"
          value={formatCurrency(payments.total)}
          className="font-semibold"
          labelClass="text-slate-900 font-semibold"
        />
        <Row
          label="Total Billed to Customers"
          value={formatCurrency(
            totals.revenue +
              totals.taxCollected +
              salesTotals.revenue +
              salesTotals.tax
          )}
        />
      </div>
    </section>
  );
}
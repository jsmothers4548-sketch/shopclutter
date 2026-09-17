import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, PackagePlus, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { buildPeriod, inPeriod } from '@/lib/reportPeriod';
import { getShopSettings } from '@/lib/shopSettings';
import EarningsPeriodControls from '@/components/reports/EarningsPeriodControls';
import PartPurchaseForm from '@/components/PartPurchaseForm';

const keyOf = (n, p) =>
  `${(n || '').trim().toLowerCase()}|${(p || '').trim().toLowerCase()}`;

export default function PartHistory() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = params.get('name') || '';
  const number = params.get('number') || '';
  const year = Number(params.get('year')) || new Date().getFullYear();

  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [periodKey, setPeriodKey] = useState('full');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [query, setQuery] = useState('');
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const period = useMemo(
    () => buildPeriod({ year, periodKey, customStart, customEnd }),
    [year, periodKey, customStart, customEnd]
  );

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      const [partsData, saleItemsData, jobsData, salesData, purchasesData, shopSettings] =
        await Promise.all([
          base44.entities.Part.list(),
          base44.entities.SaleItem.list('-created_date', 2000),
          base44.entities.Job.list('-created_date', 500),
          base44.entities.Sale.list('-sale_date', 500),
          base44.entities.PartPurchase.list('-purchase_date', 2000),
          getShopSettings(),
        ]);
      setData({
        parts: Array.isArray(partsData) ? partsData : [],
        saleItems: Array.isArray(saleItemsData) ? saleItemsData : [],
        purchases: Array.isArray(purchasesData) ? purchasesData : [],
        jobById: Object.fromEntries(
          (Array.isArray(jobsData) ? jobsData : []).map((j) => [j.id, j])
        ),
        saleById: Object.fromEntries(
          (Array.isArray(salesData) ? salesData : []).map((s) => [s.id, s])
        ),
      });
      setSettings(shopSettings);
    })();
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const target = keyOf(name, number);
    const q = query.trim().toLowerCase();
    const rows = [];
    for (const p of data.purchases) {
      if (keyOf(p.part_name, p.part_number) !== target) continue;
      if (!inPeriod(p.purchase_date || p.created_date, period)) continue;
      const qty = Number(p.quantity) || 0;
      const unitCost = Number(p.unit_cost) || 0;
      rows.push({
        id: `purchase-${p.id}`,
        date: p.purchase_date || p.created_date,
        type: 'Purchase',
        description: p.part_name || 'Part',
        source: p.supplier || '',
        qty,
        unitCost,
        amount: qty * unitCost,
        revenue: 0,
        link: null,
      });
    }
    for (const p of data.parts) {
      if (keyOf(p.name, p.part_number) !== target) continue;
      if (!inPeriod(p.created_date, period)) continue;
      const job = data.jobById[p.job_id];
      const qty = Number(p.quantity) || 0;
      const unitCost = Number(p.unit_cost) || 0;
      rows.push({
        id: `part-${p.id}`,
        date: p.created_date,
        type: 'Job Part',
        description: p.name || 'Part',
        source: job
          ? `${job.customer_name || '—'}${
              job.ticket_number ? ` · #${job.ticket_number}` : ''
            }`
          : '',
        qty,
        unitCost,
        amount: qty * unitCost,
        revenue: 0,
        link: `/jobs/${p.job_id}`,
      });
    }
    for (const it of data.saleItems) {
      if (keyOf(it.description, it.part_number) !== target) continue;
      if (!inPeriod(it.created_date, period)) continue;
      const qty = Number(it.quantity) || 0;
      const unitCost = Number(it.unit_cost) || 0;
      rows.push({
        id: `sale-${it.id}`,
        date: it.created_date,
        type: 'Counter Sale',
        description: it.description || 'Item',
        source: data.saleById[it.sale_id]?.customer_name || 'Walk-in',
        qty,
        unitCost,
        amount: qty * unitCost,
        revenue: qty * (Number(it.unit_price) || 0),
        link: `/sales/${it.sale_id}`,
      });
    }
    return rows
      .filter(
        (r) =>
          !q ||
          [r.description, r.source, r.type].some((v) =>
            (v || '').toLowerCase().includes(q)
          )
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data, name, number, period, query]);

  const totals = useMemo(() => {
    const t = {
      purchased: 0,
      purchasedQty: 0,
      used: 0,
      usedQty: 0,
      sold: 0,
      soldQty: 0,
      revenue: 0,
      totalCost: 0,
    };
    for (const r of rows) {
      t.totalCost += r.amount;
      t.revenue += r.revenue;
      if (r.type === 'Purchase') {
        t.purchased += r.amount;
        t.purchasedQty += r.qty;
      } else if (r.type === 'Job Part') {
        t.used += r.amount;
        t.usedQty += r.qty;
      } else if (r.type === 'Counter Sale') {
        t.sold += r.amount;
        t.soldQty += r.qty;
      }
    }
    return t;
  }, [rows]);

  if (!name) {
    return (
      <div className="p-4 space-y-3">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </button>
        <p className="text-sm text-slate-400">No part selected.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  const summary = [
    {
      label: 'Purchased',
      value: formatCurrency(totals.purchased),
      sub: `${totals.purchasedQty} units`,
    },
    {
      label: 'Used on Jobs',
      value: formatCurrency(totals.used),
      sub: `${totals.usedQty} units`,
    },
    {
      label: 'Counter Sold',
      value: formatCurrency(totals.sold),
      sub: `${totals.soldQty} units · ${formatCurrency(totals.revenue)} revenue`,
    },
    {
      label: 'Total Cost',
      value: formatCurrency(totals.totalCost),
      sub: `${rows.length} line${rows.length === 1 ? '' : 's'}`,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Screen header */}
      <div className="flex items-center gap-2 flex-wrap print:hidden">
        <button onClick={() => navigate('/reports')} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">
            {name}
          </h1>
          <p className="text-xs text-slate-400 truncate">
            {number ? `${number} · ` : ''}Part History — {period.label}
          </p>
        </div>
        <button
          onClick={() => setPurchaseOpen(true)}
          className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold active:bg-slate-50"
        >
          <PackagePlus className="w-4 h-4" /> Log Purchase
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold active:bg-slate-800"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <EarningsPeriodControls
        periodKey={periodKey}
        onPeriodChange={setPeriodKey}
        customStart={customStart}
        customEnd={customEnd}
        onCustomChange={(field, val) =>
          field === 'start' ? setCustomStart(val) : setCustomEnd(val)
        }
        query={query}
        onQueryChange={setQuery}
      />

      {/* Print cover header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3">
        <p className="text-xs uppercase tracking-widest text-slate-600">
          {settings?.brand_name || 'ShopFlow Small Engine Repair'}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Part History — {name}
          {number ? ` (${number})` : ''}
        </h1>
        <p className="text-sm text-slate-600">{period.label}</p>
        {query.trim() && (
          <p className="text-xs text-slate-500">
            Search: “{query.trim()}” · {rows.length} matching{' '}
            {rows.length === 1 ? 'line' : 'lines'}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          Prepared {new Date().toLocaleDateString()} · Confidential — For Owner
          Use Only
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {summary.map((it) => (
          <div
            key={it.label}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {it.label}
            </p>
            <p className="text-lg md:text-xl font-bold mt-1 tabular-nums text-slate-900">
              {it.value}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{it.sub}</p>
          </div>
        ))}
      </div>

      {/* History lines */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm mb-3">
          History — {period.label}
          {query.trim() && ` · matching “${query.trim()}”`}
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No matching history for {name} in {period.label}
          </p>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => {
              const content = (
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
                    <p className="text-xs text-slate-400 tabular-nums">
                      {r.qty} × {formatCurrency(r.unitCost)}
                      {r.revenue > 0 && ` · sold ${formatCurrency(r.revenue)}`}
                    </p>
                  </div>
                </>
              );
              return r.link ? (
                <button
                  key={r.id}
                  onClick={() => navigate(r.link)}
                  className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 text-left"
                >
                  {content}
                </button>
              ) : (
                <div
                  key={r.id}
                  className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <PartPurchaseForm
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        partName={name}
        partNumber={number}
        onSaved={(rec) =>
          setData((d) =>
            d ? { ...d, purchases: [rec, ...d.purchases] } : d
          )
        }
      />
    </div>
  );
}
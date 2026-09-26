import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Edit, Trash2, ShoppingBag } from 'lucide-react';
import SaleForm from '@/components/SaleForm';
import UpgradePrompt from '@/components/UpgradePrompt';
import usePlanFeature from '@/hooks/usePlanFeature';

export default function Sales() {
  const { locked, loading: planLoading } = usePlanFeature('sales');
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeSale, setActiveSale] = useState(null);

  const loadData = async () => {
    try {
      const data = await base44.entities.Sale.list('-sale_date', 200);
      setSales(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = sales.filter((s) => {
    const matchesFilter = filter === 'All' || s.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.item_description?.toLowerCase().includes(q) ||
      s.customer_name?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totals = sales.reduce(
    (acc, s) => {
      acc.total += s.total_price || 0;
      acc.paid += s.amount_paid || 0;
      return acc;
    },
    { total: 0, paid: 0 }
  );

  const deleteSale = async (id) => {
    await base44.entities.Sale.delete(id);
    setSales(sales.filter((s) => s.id !== id));
  };

  if (planLoading) return null;
  if (locked) return <UpgradePrompt feature="sales" />;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
        <button
          onClick={() => {
            setActiveSale(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> New Sale
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Total Sold</p>
          <p className="text-lg font-bold text-slate-900">
            ${totals.total.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-xs text-slate-500">Outstanding Balance</p>
          <p className="text-lg font-bold text-red-600">
            ${Math.max(totals.total - totals.paid, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search item or customer..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex gap-2">
        {['All', 'Open', 'Paid'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((s) => {
          const balance = Math.max(
            (s.total_price || 0) - (s.amount_paid || 0),
            0
          );
          return (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="font-bold text-slate-900 truncate">
                      {s.item_description}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {s.customer_name || 'Walk-in'}
                  </p>
                  {s.sale_date && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(s.sale_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    s.status === 'Paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-sm">
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-400 text-xs">Total</span>
                    <p className="font-semibold text-slate-900">
                      ${(s.total_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Paid</span>
                    <p className="font-semibold text-green-600">
                      ${(s.amount_paid || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs">Balance</span>
                    <p
                      className={`font-semibold ${
                        balance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      ${balance.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setActiveSale(s);
                      setShowForm(true);
                    }}
                    className="text-slate-400 hover:text-amber-600 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSale(s.id)}
                    className="text-slate-300 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No sales yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <SaleForm
          sale={activeSale}
          onClose={() => {
            setShowForm(false);
            setActiveSale(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setActiveSale(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
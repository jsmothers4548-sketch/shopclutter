import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Tag, Package } from 'lucide-react';
import ShopUnitForm from '@/components/ShopUnitForm';

export default function ShopUnitsPanel() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ShopUnit.list('-created_date', 500)
      .then((list) => setUnits(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return units;
    return units.filter((u) =>
      [u.name, u.make, u.model, u.serial_number].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [units, search]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Machines your shop owns — separate from customer tickets.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-semibold active:bg-amber-600 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>

      {units.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment, make or serial..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {units.length === 0
              ? 'No shop units yet — add the equipment your shop owns'
              : 'No units found'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => navigate(`/shop-units/${u.id}`)}
              className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">
                    {u.name}
                    {u.make ? ` · ${u.make}` : ''}
                    {u.model ? ` ${u.model}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {[u.condition, u.serial_number].filter(Boolean).join(' · ') ||
                      'Shop owned'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-700 shrink-0">
                  ${(Number(u.price) || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {u.sold ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    Sold
                  </span>
                ) : u.for_sale ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    <Tag className="w-3 h-3" /> For sale
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    Not for sale
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <ShopUnitForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}
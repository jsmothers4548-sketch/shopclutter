import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Search, Wrench } from 'lucide-react';

export default function Units() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    base44.entities.Equipment.list('label_number', 500)
      .then((list) => setUnits(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return units;
    return units.filter(
      (u) =>
        u.label_number?.toLowerCase().includes(q) ||
        u.customer_name?.toLowerCase().includes(q) ||
        u.equipment_type?.toLowerCase().includes(q) ||
        u.make?.toLowerCase().includes(q) ||
        u.model?.toLowerCase().includes(q)
    );
  }, [units, search]);

  if (!isAdmin) {
    return (
      <p className="text-center py-20 text-slate-400 text-sm">
        Admin access only
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Units</h1>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search unit #, customer, or equipment..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          No units found — they're created when you enter a label number at
          job intake
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => navigate(`/units/${u.id}`)}
              className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 shadow-sm active:bg-slate-50 flex items-center gap-3"
            >
              <span className="bg-amber-100 text-amber-700 font-bold text-sm px-2.5 py-1 rounded-lg shrink-0">
                #{u.label_number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 truncate">
                  {u.equipment_type || 'Equipment'}
                  {u.make ? ` · ${u.make}` : ''}
                  {u.model ? ` ${u.model}` : ''}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {u.customer_name || 'No customer linked'}
                </p>
              </div>
              <Wrench className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
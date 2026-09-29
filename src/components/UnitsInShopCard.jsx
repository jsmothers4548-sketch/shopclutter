import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Package } from 'lucide-react';

const CHIPS = [
  { key: 'On-site', label: 'On-site' },
  { key: 'Off-site', label: 'Off-site' },
];

export default function UnitsInShopCard({ locationFilter, setLocationFilter }) {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.Job.aggregate({
      query: { status: { $ne: 'Closed' } },
      groupBy: 'job_location',
    }).then((res) => {
      if (!active) return;
      const byLocation = {};
      let total = 0;
      (res?.rows || []).forEach((row) => {
        byLocation[row.job_location] = row.count || 0;
        total += row.count || 0;
      });
      setCounts({ total, ...byLocation });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => setLocationFilter('All')}
        className="flex items-center gap-2 text-left"
      >
        <span className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-amber-600" />
        </span>
        <span>
          <span className="block text-2xl font-bold text-slate-900 leading-none">
            {counts ? counts.total : '—'}
          </span>
          <span className="block text-xs text-slate-500 mt-0.5">
            Units in the shop
          </span>
        </span>
      </button>
      <div className="flex gap-2">
        {CHIPS.map(({ key, label }) => {
          const active = locationFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setLocationFilter(active ? 'All' : key)}
              className={`px-3 py-1.5 rounded-lg border text-center transition-colors ${
                active
                  ? 'bg-amber-500 border-amber-600 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span className="block text-base font-bold leading-none">
                {counts ? counts[key] || 0 : '—'}
              </span>
              <span className="block text-[11px] mt-0.5">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
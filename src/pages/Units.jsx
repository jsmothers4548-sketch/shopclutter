import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import CustomerUnitsPanel from '@/components/units/CustomerUnitsPanel';
import ShopUnitsPanel from '@/components/units/ShopUnitsPanel';
import ForSalePanel from '@/components/units/ForSalePanel';

const TABS = [
  { id: 'customer', label: 'Customer Units' },
  { id: 'shop', label: 'Shop Units' },
  { id: 'sale', label: 'For Sale' },
];

export default function Units() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState('customer');

  if (!isAdmin) {
    return (
      <p className="text-center py-20 text-slate-400 text-sm">
        Admin access only
      </p>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Units</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'customer' && <CustomerUnitsPanel />}
      {tab === 'shop' && <ShopUnitsPanel />}
      {tab === 'sale' && <ForSalePanel />}
    </div>
  );
}
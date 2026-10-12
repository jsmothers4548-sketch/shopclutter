import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Wrench, Clock, Boxes, Lock, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import useShop from '@/hooks/useShop';
import { getPlan, hasFeature } from '@/lib/plans';
import BottomNav from '@/components/BottomNav';
import AdminMenu from '@/components/AdminMenu';
import LiveHelpButton from '@/components/support/LiveHelpButton';
import { getShopSettings } from '@/lib/shopSettings';

const headerBtnClass = ({ isActive }) =>
  `flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
    isActive ? 'bg-amber-500 text-slate-900' : 'bg-white/10 hover:bg-white/20'
  }`;

export default function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { shop } = useShop();
  const clockLocked = !hasFeature(getPlan(shop?.plan_id), 'time_clock');
  const [brand, setBrand] = useState({ name: 'Shop Clutter', logo: '' });

  useEffect(() => {
    getShopSettings()
      .then((s) =>
        setBrand({
          name: s.brand_name || 'Shop Clutter',
          logo: s.brand_logo_url || '',
        })
      )
      .catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-slate-300 flex flex-col">
      <header className="text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-30 print:hidden bg-[hsl(var(--chart-3))]">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt="Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
        ) : (
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-slate-900" />
          </div>
        )}
        <span className="font-bold text-lg tracking-tight hidden sm:inline">
          {brand.name}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <NavLink to="/help" className={headerBtnClass}>
            <LifeBuoy className="w-4 h-4" />
            <span>Help</span>
          </NavLink>
          <LiveHelpButton />
          <NavLink
            to={clockLocked ? '/billing' : '/clock'}
            className={headerBtnClass}
          >
            <Clock className="w-4 h-4" /> Clock
            {clockLocked && <Lock className="w-3 h-3 text-slate-300" />}
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/units" className={headerBtnClass}>
                <Boxes className="w-4 h-4" /> Units
              </NavLink>
              <AdminMenu />
            </>
          )}
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto pb-20 print:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
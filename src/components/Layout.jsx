import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Wrench, Clock, Boxes } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import BottomNav from '@/components/BottomNav';
import AdminMenu from '@/components/AdminMenu';

const headerBtnClass = ({ isActive }) =>
  `flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
    isActive ? 'bg-amber-500 text-slate-900' : 'bg-white/10 hover:bg-white/20'
  }`;

export default function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <div className="min-h-screen bg-slate-300 flex flex-col">
      <header className="text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-30 print:hidden bg-[hsl(var(--chart-3))]">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <Wrench className="w-5 h-5 text-slate-900" />
        </div>
        <span className="font-bold text-lg tracking-tight hidden sm:inline">
          Shop Clutter
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <NavLink to="/clock" className={headerBtnClass}>
            <Clock className="w-4 h-4" /> Clock
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
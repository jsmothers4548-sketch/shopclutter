import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Wrench, Users, LayoutTemplate, Package, ClipboardList, Bell, BarChart3, UserCog, Clock, ShoppingBag, Boxes } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
{ to: '/', label: 'Jobs', icon: Wrench, end: true },
{ to: '/customers', label: 'Customers', icon: Users },
{ to: '/inventory', label: 'Inventory', icon: Package },
{ to: '/staff-tasks', label: 'Tasks', icon: ClipboardList },
{ to: '/reminders', label: 'Reminders', icon: Bell },
{ to: '/templates', label: 'Templates', icon: LayoutTemplate },
{ to: '/sales', label: 'Sales', icon: ShoppingBag }];


export default function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <div className="min-h-screen bg-slate-300 flex flex-col">
      <header className="text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-30 print:hidden bg-[hsl(var(--chart-3))]">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <Wrench className="w-5 h-5 text-slate-900" />
        </div>
        <span className="font-bold text-lg tracking-tight">Shop Clutter</span>
        <div className="ml-auto flex items-center gap-1.5">
          <NavLink
            to="/clock"
            className={({ isActive }) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            isActive ? 'bg-amber-500 text-slate-900' : 'bg-white/10 hover:bg-white/20'}`

            }>
            
            <Clock className="w-4 h-4" /> Clock
          </NavLink>
          {isAdmin &&
          <>
              <NavLink
              to="/staff"
              className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive ? 'bg-amber-500 text-slate-900' : 'bg-white/10 hover:bg-white/20'}`

              }>
              
                <UserCog className="w-4 h-4" /> Staff
              </NavLink>
              <NavLink
              to="/reports"
              className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive ? 'bg-amber-500 text-slate-900' : 'bg-white/10 hover:bg-white/20'}`

              }>
              
                <BarChart3 className="w-4 h-4" /> Reports
              </NavLink>
              <NavLink
              to="/units"
              className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive ? 'bg-amber-500 text-slate-900' : 'bg-white/10 hover:bg-white/20'}`

              }>
                <Boxes className="w-4 h-4" /> Units
              </NavLink>
            </>
          }
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto pb-20 print:pb-0">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-30 print:hidden">
        <div className="max-w-6xl mx-auto flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-amber-400' : 'text-slate-400'}`

                }>
                
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>);

          })}
        </div>
      </nav>
    </div>);

}
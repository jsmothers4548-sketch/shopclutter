import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Wrench, Users, LayoutTemplate } from 'lucide-react';

const navItems = [
{ to: '/', label: 'Jobs', icon: Wrench, end: true },
{ to: '/customers', label: 'Customers', icon: Users },
{ to: '/templates', label: 'Templates', icon: LayoutTemplate }];


export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="text-white px-4 py-3 flex items-center gap-2 sticky top-0 z-30 print:hidden bg-[hsl(var(--chart-3))]">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <Wrench className="w-5 h-5 text-slate-900" />
        </div>
        <span className="font-bold text-lg tracking-tight">Watford Small Engine</span>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full pb-20 print:pb-0">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-30 print:hidden">
        <div className="max-w-2xl mx-auto flex">
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
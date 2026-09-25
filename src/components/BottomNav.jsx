import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Wrench,
  Users,
  Package,
  ShoppingBag,
  ClipboardList,
  Bell,
  LayoutTemplate,
  MoreHorizontal,
} from 'lucide-react';

const mainItems = [
  { to: '/board', label: 'Jobs', icon: Wrench, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/sales', label: 'Sales', icon: ShoppingBag },
];

const moreItems = [
  { to: '/staff-tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
];

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const moreActive = moreItems.some((item) =>
    location.pathname.startsWith(item.to)
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-30 print:hidden">
      {open && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-44 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-slate-200 active:bg-slate-700'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
      <div className="max-w-6xl mx-auto flex">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
            open || moreActive ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Wrench,
  Users,
  Package,
  ShoppingBag,
  ClipboardList,
  Bell,
  CalendarDays,
  LayoutTemplate,
  MoreHorizontal,
  Lock,
  LifeBuoy,
} from 'lucide-react';
import useShop from '@/hooks/useShop';
import { getPlan, hasFeature } from '@/lib/plans';

const mainItems = [
  { to: '/board', label: 'Jobs', icon: Wrench, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Package, feature: 'inventory' },
  { to: '/sales', label: 'Sales', icon: ShoppingBag, feature: 'sales' },
];

const moreItems = [
  { to: '/staff-tasks', label: 'Tasks', icon: ClipboardList, feature: 'staff_tasks' },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate, feature: 'templates' },
  { to: '/help', label: 'Help', icon: LifeBuoy },
];

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { shop } = useShop();
  const plan = getPlan(shop?.plan_id);
  const isLocked = (item) => !!item.feature && !hasFeature(plan, item.feature);

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
            const locked = isLocked(item);
            return (
              <NavLink
                key={item.to}
                to={locked ? '/billing' : item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
                    locked
                      ? 'text-slate-500'
                      : isActive
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-slate-200 active:bg-slate-700'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${locked ? 'opacity-50' : ''}`} />
                {item.label}
                {locked && (
                  <>
                    <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">
                      Locked
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
      <div className="max-w-6xl mx-auto flex">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const locked = isLocked(item);
          return (
            <NavLink
              key={item.to}
              to={locked ? '/billing' : item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  locked
                    ? 'text-slate-500'
                    : isActive
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`
              }
            >
              <Icon className={`w-5 h-5 ${locked ? 'opacity-50' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {locked && (
                <Lock className="absolute top-1.5 right-1/2 translate-x-5 w-3 h-3 text-slate-500" />
              )}
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
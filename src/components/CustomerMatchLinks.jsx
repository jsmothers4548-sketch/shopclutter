import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

// While the job board search matches a customer's name, surface the customers
// themselves as links, so a name opens that customer's full record instead of
// only their tickets.
export default function CustomerMatchLinks({ customers }) {
  if (!customers.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
        Customers
      </p>
      <div className="space-y-1">
        {customers.map((c) => (
          <Link
            key={c.id}
            to={`/customers/${c.id}`}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 active:bg-slate-100"
          >
            <User className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-bold text-amber-700 underline underline-offset-2 truncate">
              {c.name}
            </span>
            <span className="ml-auto text-xs font-semibold text-slate-400 shrink-0">
              View
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { Users } from 'lucide-react';

// Payroll is a separate Intuit API that has to be requested and approved for
// the app before it can be called, so it is shown apart from accounting and
// stays switched off until that approval exists.
export default function QuickBooksPayrollPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-500" />
        <h2 className="font-bold text-slate-900">Payroll sync</h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
          Not available yet
        </span>
      </div>
      <p className="text-sm text-slate-500">
        Payroll uses Intuit&apos;s Payroll API, which has to be requested and
        approved for this app before it can be used. Accounting sync works
        without it, so nothing else is held up. Once that approval is in place,
        employee and payroll records can sync here the same way.
      </p>
    </div>
  );
}
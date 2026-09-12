import React from 'react';
import { Printer } from 'lucide-react';

export default function ReportsHeader({
  year,
  years,
  statusFilter,
  onYearChange,
  onStatusChange,
  onPrint,
}) {
  const today = new Date().toLocaleDateString();

  return (
    <>
      {/* Screen controls */}
      <div className="flex items-center gap-2 flex-wrap print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 flex-1">
          Financial Reports
        </h1>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white font-medium"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white font-medium"
        >
          <option value="all">All Jobs</option>
          <option value="closed">Closed Only</option>
        </select>
        <button
          onClick={onPrint}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold active:bg-slate-800"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* Print cover header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3">
        <p className="text-xs uppercase tracking-widest text-slate-600">
          ShopFlow Small Engine Repair
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Annual Financial Report
        </h1>
        <p className="text-sm text-slate-600">Fiscal Year {year}</p>
        <p className="text-xs text-slate-400 mt-1">
          Prepared {today} · Confidential — For Owner Use Only
        </p>
      </div>
    </>
  );
}
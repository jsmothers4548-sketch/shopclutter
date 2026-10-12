import React from 'react';
import { Printer } from 'lucide-react';
import { MONTHS } from '@/lib/reportPeriod';
import useVisibleBrand from '@/hooks/useVisibleBrand';

const PERIOD_OPTIONS = [
  ['full', 'Year'],
  ['month', 'Month'],
  ['q1', 'Q1'],
  ['q2', 'Q2'],
  ['q3', 'Q3'],
  ['q4', 'Q4'],
  ['custom', 'Custom'],
];

export default function ReportsHeader({
  title = 'Financial Reports',
  printTitle = 'Financial Report',
  year,
  years,
  periodKey,
  periodLabel,
  month,
  onMonthChange,
  customStart,
  customEnd,
  statusFilter,
  onYearChange,
  onPeriodChange,
  onCustomStart,
  onCustomEnd,
  onStatusChange,
  onPrint,
}) {
  const brand = useVisibleBrand();
  const today = new Date().toLocaleDateString();

  return (
    <>
      {/* Screen controls */}
      <div className="flex items-center gap-2 flex-wrap print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 flex-1">
          {title}
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
        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
          {PERIOD_OPTIONS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onPeriodChange(key)}
              className={`px-2.5 py-2 text-xs font-semibold border-r border-slate-100 last:border-r-0 ${
                periodKey === key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {periodKey === 'month' && (
          <select
            value={month ?? new Date().getMonth()}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white font-medium"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
        )}
        {periodKey === 'custom' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStart(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm bg-white"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEnd(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm bg-white"
            />
          </div>
        )}
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
          {brand.name}
        </p>
        <h1 className="text-2xl font-bold text-slate-900">{printTitle}</h1>
        <p className="text-sm text-slate-600">{periodLabel}</p>
        <p className="text-xs text-slate-400 mt-1">
          Prepared {today} · Confidential — For Owner Use Only
        </p>
      </div>
    </>
  );
}
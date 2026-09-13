import React from 'react';
import { formatCurrency } from '@/lib/format';

export default function EmployeeEarningsTable({ periodLabel, employeeStats, onSelect }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
      <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm mb-3">
        Employee Earnings — {periodLabel}
      </h2>
      {employeeStats.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No labor data for this period
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200">
              <th className="pb-2">Technician</th>
              <th className="pb-2 text-center">Jobs</th>
              <th className="pb-2 text-center">Hours</th>
              <th className="pb-2 text-right">Charged</th>
              <th className="pb-2 text-right">Earned</th>
            </tr>
          </thead>
          <tbody>
            {employeeStats.map((emp) => (
              <tr
                key={emp.name}
                className="border-b border-slate-50 cursor-pointer hover:bg-slate-50"
                onClick={() => onSelect(emp)}
              >
                <td className="py-2 font-medium text-slate-900">{emp.name}</td>
                <td className="py-2 text-center tabular-nums">
                  {emp.jobCount}
                </td>
                <td className="py-2 text-center tabular-nums">
                  {emp.hours.toFixed(1)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatCurrency(emp.charged)}
                </td>
                <td className="py-2 text-right font-semibold tabular-nums">
                  {formatCurrency(emp.earned)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
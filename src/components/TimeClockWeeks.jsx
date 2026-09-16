import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { getShopSettings } from '@/lib/shopSettings';
import {
  getWeekStart,
  pairShifts,
  computeOvertime,
  weekPay,
  weekLabel,
  OVERTIME_RULE_LABELS,
} from '@/lib/timecard';
import TimeClockWeekDetail from '@/components/TimeClockWeekDetail';

export default function TimeClockWeeks({ staff, timeClocks }) {
  const [rule, setRule] = useState('federal');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getShopSettings()
      .then((s) => setRule(s.overtime_rule || 'federal'))
      .catch(() => {});
  }, []);

  const rows = useMemo(() => {
    const byEmployee = {};
    for (const tc of timeClocks || []) {
      const key = tc.employee_id || '';
      (byEmployee[key] = byEmployee[key] || []).push(tc);
    }
    const out = [];
    for (const [employeeId, entries] of Object.entries(byEmployee)) {
      const staffMatch = staff.find((s) => s.employee_id === employeeId);
      const payRate = staffMatch?.pay_rate || 0;
      const byWeek = {};
      for (const sh of pairShifts(entries)) {
        const ws = getWeekStart(new Date(sh.in)).getTime();
        (byWeek[ws] = byWeek[ws] || []).push(sh);
      }
      for (const [ws, shifts] of Object.entries(byWeek)) {
        const days = Object.entries(
          shifts.reduce((map, sh) => {
            map[sh.date] = (map[sh.date] || 0) + sh.hours;
            return map;
          }, {})
        ).map(([date, hours]) => ({ date, hours }));
        const ot = computeOvertime(days, rule);
        out.push({
          employeeId,
          name: staffMatch?.name || `ID: ${employeeId}`,
          weekStart: Number(ws),
          ...ot,
          pay: weekPay(ot, payRate),
        });
      }
    }
    return out.sort((a, b) => b.weekStart - a.weekStart);
  }, [timeClocks, staff, rule]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-amber-600" />
        <h2 className="font-bold text-slate-900">Time Clock</h2>
        <span className="text-xs text-slate-400">
          {OVERTIME_RULE_LABELS[rule]}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No clock entries yet
        </p>
      ) : (
        <div className="divide-y divide-slate-50">
          {rows.map((r) => (
            <button
              key={`${r.employeeId}-${r.weekStart}`}
              onClick={() =>
                setSelected({ employeeId: r.employeeId, weekStart: r.weekStart })
              }
              className="w-full flex items-center justify-between gap-2 py-2.5 text-left active:bg-slate-50 rounded-lg px-1"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {r.name}
                </p>
                <p className="text-xs text-slate-400">
                  {weekLabel(r.weekStart)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-900">
                  {r.total.toFixed(1)} hrs
                </span>
                {r.overtime > 0 && (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {r.overtime.toFixed(1)} OT
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  ${r.pay.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <TimeClockWeekDetail
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        selected={selected}
        staff={staff}
        timeClocks={timeClocks}
        rule={rule}
        onWeekChange={(ws) =>
          setSelected((s) => (s ? { ...s, weekStart: ws } : s))
        }
      />
    </div>
  );
}
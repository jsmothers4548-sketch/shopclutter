import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import {
  getWeekStart,
  pairShifts,
  computeOvertime,
  weekPay,
  weekLabel,
} from '@/lib/timecard';
import TimeClockEntryForm from '@/components/TimeClockEntryForm';

const DAY_MS = 7 * 24 * 3600000;

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const fmtDay = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const navBtn =
  'p-1.5 rounded-lg bg-slate-100 text-slate-600 active:bg-slate-200 disabled:opacity-30';

export default function TimeClockWeekDetail({
  open,
  onOpenChange,
  selected,
  staff,
  timeClocks,
  rule,
  onWeekChange,
  onChanged,
}) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const currentWeekStart = getWeekStart(new Date()).getTime();

  const info = useMemo(() => {
    if (!selected) return null;
    const staffMatch = staff.find((s) => s.employee_id === selected.employeeId);
    const payRate = staffMatch?.pay_rate || 0;
    const all = (timeClocks || []).filter(
      (tc) => tc.employee_id === selected.employeeId
    );

    // Individual clock records for the week (what the admin edits or deletes).
    const entries = all
      .filter(
        (tc) =>
          getWeekStart(new Date(tc.timestamp)).getTime() === selected.weekStart
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Paired shifts drive the hours and overtime totals.
    const shifts = pairShifts(all).filter(
      (s) => getWeekStart(new Date(s.in)).getTime() === selected.weekStart
    );
    const shiftHours = {};
    for (const sh of shifts) {
      shiftHours[sh.date] = (shiftHours[sh.date] || 0) + sh.hours;
    }

    const byDate = {};
    for (const e of entries) {
      const date = e.shift_date || e.timestamp.slice(0, 10);
      (byDate[date] = byDate[date] || []).push(e);
    }
    const days = Object.keys(byDate)
      .sort()
      .map((date) => ({
        date,
        entries: byDate[date],
        hours: shiftHours[date] || 0,
      }));

    const ot = computeOvertime(days, rule);
    return {
      name: staffMatch?.name || `ID: ${selected.employeeId}`,
      days,
      ...ot,
      pay: weekPay(ot, payRate),
    };
  }, [selected, staff, timeClocks, rule]);

  const handleDelete = async () => {
    await base44.entities.TimeClock.delete(deleting.id);
    setDeleting(null);
    onChanged?.();
  };

  if (!selected || !info) return null;

  const canGoNext = selected.weekStart < currentWeekStart;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogTitle className="sr-only">Weekly Time Card</DialogTitle>
        <div>
          <p className="font-bold text-slate-900">{info.name}</p>
          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => onWeekChange(selected.weekStart - DAY_MS)}
              className={navBtn}
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-slate-500">
              {weekLabel(selected.weekStart)}
            </span>
            <button
              type="button"
              onClick={() => onWeekChange(selected.weekStart + DAY_MS)}
              disabled={!canGoNext}
              className={navBtn}
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {info.days.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No hours this week
          </p>
        ) : (
          <div className="space-y-2">
            {info.days.map((d) => {
              const dayOt =
                rule === 'daily' ? Math.max(0, Math.min(d.hours, 12) - 8) : 0;
              const dayDouble =
                rule === 'daily' ? Math.max(0, d.hours - 12) : 0;
              return (
                <div key={d.date} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {fmtDay(d.date)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {d.hours.toFixed(2)} hrs
                      </span>
                      {dayOt > 0 && (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          {dayOt.toFixed(2)} OT
                        </span>
                      )}
                      {dayDouble > 0 && (
                        <span className="text-xs font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          {dayDouble.toFixed(2)} DT
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 divide-y divide-slate-200/70">
                    {d.entries.map((e) => {
                      const isIn = e.action === 'clock_in';
                      return (
                        <div
                          key={e.id}
                          className="flex items-center gap-1.5 py-1"
                        >
                          <span
                            className={`text-xs font-semibold ${
                              isIn ? 'text-green-700' : 'text-slate-500'
                            }`}
                          >
                            {isIn ? 'In' : 'Out'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {fmtTime(e.timestamp)}
                          </span>
                          <div className="ml-auto flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => setEditing(e)}
                              className="p-1.5 rounded-lg text-slate-500 active:bg-slate-200"
                              aria-label="Edit record"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(e)}
                              className="p-1.5 rounded-lg text-red-600 active:bg-red-50"
                              aria-label="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Regular hours</span>
            <span className="font-semibold text-slate-900">
              {info.regular.toFixed(2)}
            </span>
          </div>
          {info.overtime > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-amber-700">
                Overtime hours (1.5×)
              </span>
              <span className="font-semibold text-amber-700">
                {info.overtime.toFixed(2)}
              </span>
            </div>
          )}
          {info.double > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-red-600">
                Double time hours (2×)
              </span>
              <span className="font-semibold text-red-600">
                {info.double.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base pt-1">
            <span className="font-bold text-slate-900">Estimated pay</span>
            <span className="font-bold text-slate-900">
              ${info.pay.toFixed(2)}
            </span>
          </div>
        </div>

        {editing && (
          <TimeClockEntryForm
            entry={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              onChanged?.();
            }}
          />
        )}

        <AlertDialog
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this clock record?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleting
                  ? `${
                      deleting.action === 'clock_in' ? 'Clock In' : 'Clock Out'
                    } on ${fmtDay(
                      deleting.shift_date || deleting.timestamp.slice(0, 10)
                    )} at ${fmtTime(deleting.timestamp)} will be removed. This cannot be undone.`
                  : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
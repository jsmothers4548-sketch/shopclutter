import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LogIn, LogOut, Pencil, Trash2 } from 'lucide-react';
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
import TimeClockEntryForm from '@/components/TimeClockEntryForm';

const fmtDay = (ts) =>
  new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function StaffTimeClockList({ employeeId, clocks, onChanged }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const entries = useMemo(
    () =>
      (clocks || [])
        .filter((c) => c.employee_id && c.employee_id === employeeId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [clocks, employeeId]
  );

  const handleDelete = async () => {
    await base44.entities.TimeClock.delete(deleting.id);
    setDeleting(null);
    onChanged();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h2 className="font-bold text-slate-900 mb-3">Time Clock Records</h2>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No clock entries for this employee
        </p>
      ) : (
        <div className="divide-y divide-slate-50">
          {entries.map((c) => {
            const isIn = c.action === 'clock_in';
            return (
              <div
                key={c.id}
                className="flex items-center gap-2 py-2.5 print:hidden"
              >
                <span
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isIn
                      ? 'bg-green-50 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isIn ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {isIn ? 'Clock In' : 'Clock Out'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {fmtDay(c.timestamp)} · {fmtTime(c.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(c)}
                  className="p-2 rounded-lg text-slate-500 active:bg-slate-100 shrink-0"
                  aria-label="Edit entry"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleting(c)}
                  className="p-2 rounded-lg text-red-600 active:bg-red-50 shrink-0"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <TimeClockEntryForm
          entry={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
        />
      )}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this clock entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.action === 'clock_in' ? 'Clock In' : 'Clock Out'} on ${fmtDay(
                    deleting.timestamp
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
    </div>
  );
}
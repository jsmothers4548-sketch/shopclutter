import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { entryMinutes, formatHours, formatTimer } from '@/lib/jobTime';
import usePlanFeature from '@/hooks/usePlanFeature';
import UpgradePrompt from '@/components/UpgradePrompt';
import { Play, Square, Clock, Pencil, Trash2 } from 'lucide-react';
import JobTimeEntryForm from '@/components/JobTimeEntryForm';
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

// Clocking in and out of a job. Time is written by the server, which also
// enforces the shop's one-job-at-a-time rule.
export default function JobTimerCard({ jobId, jobStatus }) {
  const { user } = useAuth();
  const { locked } = usePlanFeature('job_time_clock');
  const [entries, setEntries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(Date.now());
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removingBusy, setRemovingBusy] = useState(false);

  const load = async () => {
    const page = await base44.entities.JobTimeEntry.filter(
      { job_id: jobId },
      { sort: '-clock_in', limit: 200 }
    );
    setEntries(Array.isArray(page) ? page : page?.items || []);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  // Time entries are written by the server with the service role, so the
  // record's own created_by_id belongs to the service account. The technician
  // is matched on the email stored on the entry instead.
  const isAdmin = user?.role === 'admin';
  const myEmail = (user?.email || '').toLowerCase();
  const mineOpen = entries.find(
    (e) => !e.clock_out && (e.staff_email || '').toLowerCase() === myEmail
  );

  useEffect(() => {
    if (!mineOpen) return;
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [mineOpen?.id]);

  if (locked) return <UpgradePrompt feature="job_time_clock" />;

  const clock = async (action) => {
    setBusy(true);
    setError('');
    try {
      await base44.functions.invoke('jobTimeClock', { action, job_id: jobId });
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || 'That did not work.'
      );
    } finally {
      setBusy(false);
    }
  };

  // Removing a recorded entry is an admin correction, so it is refused for
  // anyone else by the server that performs it.
  const removeEntry = async () => {
    setRemovingBusy(true);
    setError('');
    try {
      await base44.functions.invoke('jobTimeClock', {
        action: 'delete_entry',
        entry_id: removing.id,
      });
      setRemoving(null);
      await load();
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || 'That did not work.'
      );
    } finally {
      setRemovingBusy(false);
    }
  };

  const totalMinutes = entries.reduce((sum, e) => sum + entryMinutes(e), 0);
  const isClosed = jobStatus === 'Closed';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" /> Time on This Job
        </h2>
        <span className="text-sm font-bold text-slate-900">
          {formatHours(totalMinutes)} hrs
        </span>
      </div>

      {!isClosed && (
        <button
          onClick={() => clock(mineOpen ? 'clock_out' : 'clock_in')}
          disabled={busy}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 ${
            mineOpen
              ? 'bg-red-600 text-white active:bg-red-700'
              : 'bg-green-600 text-white active:bg-green-700'
          }`}
        >
          {mineOpen ? (
            <>
              <Square className="w-4 h-4" /> Clock Out ·{' '}
              {formatTimer(mineOpen, tick)}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Clock In
            </>
          )}
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {entries.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-100">
          {entries.map((e) => {
            const running = !e.clock_out;
            return (
              <div
                key={e.id}
                className="flex items-center justify-between gap-2 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {e.staff_name || 'Technician'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(e.clock_in).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {e.clock_out &&
                      ` – ${new Date(e.clock_out).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`}
                  </p>
                  {e.correction_note && (
                    <p className="text-xs text-amber-700 truncate">
                      {e.correction_note}
                    </p>
                  )}
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    running ? 'text-green-600' : 'text-slate-700'
                  }`}
                >
                  {running ? 'Running' : `${formatHours(entryMinutes(e))} hrs`}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setEditing(e)}
                      title="Edit this entry"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRemoving(e)}
                      title="Delete this entry"
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <JobTimeEntryForm
          entry={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}

      <AlertDialog
        open={!!removing}
        onOpenChange={(open) => !open && !removingBusy && setRemoving(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this time entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing
                ? `${removing.staff_name || 'This technician'}'s time on this job will be removed from the job and its reports.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removingBusy}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                removeEntry();
              }}
            >
              {removingBusy ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { entryMinutes, formatHours, formatTimer } from '@/lib/jobTime';
import usePlanFeature from '@/hooks/usePlanFeature';
import UpgradePrompt from '@/components/UpgradePrompt';
import {
  Play,
  Square,
  Clock,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
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

// Clocking in and out of a job. The clock is optional and is the shop's own
// measure of how long a job really took — never a charge. The bill still comes
// from the labor entries. Administrators see every entry and the job's total; a
// technician sees only their own clock. Time is written by the server, which
// also enforces the shop's one-job-at-a-time rule.
export default function JobTimerCard({ jobId, jobStatus }) {
  const { user } = useAuth();
  const { locked, loading: planLoading } = usePlanFeature('job_time_clock');
  const isAdmin = user?.role === 'admin';
  const [entries, setEntries] = useState([]);
  const [myOpen, setMyOpen] = useState(null);
  const [myElsewhere, setMyElsewhere] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(Date.now());
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removingBusy, setRemovingBusy] = useState(false);

  // The server is the single source of truth for the clock: it reports the
  // caller's own running timer here, on another job, and — for administrators —
  // every entry recorded against this job.
  const load = async () => {
    const res = await base44.functions.invoke('jobTimeClock', {
      action: 'status',
      job_id: jobId,
    });
    const data = res?.data || {};
    setMyOpen(data.open_entry || null);
    setMyElsewhere(data.open_elsewhere || null);
    setEntries(Array.isArray(data.entries) ? data.entries : []);
  };

  useEffect(() => {
    if (planLoading || locked) return;
    load();
  }, [jobId, planLoading, locked]);

  const running = myOpen || myElsewhere;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running?.id]);

  if (locked) return <UpgradePrompt feature="job_time_clock" />;

  const isClosed = jobStatus === 'Closed';
  // A closed job keeps no clock for a technician, so there is nothing to show.
  if (!isAdmin && isClosed && !running) return null;

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" /> Time on This Job
        </h2>
        {isAdmin && (
          <span className="text-sm font-bold text-slate-900">
            {formatHours(totalMinutes)} hrs
          </span>
        )}
      </div>

      {!isAdmin && !running && (
        <p className="text-xs text-slate-400">
          Optional. Clock in when you start and out when you stop.
        </p>
      )}

      {myElsewhere && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 min-w-0">
            You're still clocked in on{' '}
            <Link
              to={`/jobs/${myElsewhere.job_id}`}
              className="font-semibold underline"
            >
              {myElsewhere.job_label || 'another job'}
            </Link>
            . Clock out below to stop it.
          </p>
        </div>
      )}

      {!isClosed && (
        <button
          onClick={() => clock(running ? 'clock_out' : 'clock_in')}
          disabled={busy}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 ${
            running
              ? 'bg-red-600 text-white active:bg-red-700'
              : 'bg-green-600 text-white active:bg-green-700'
          }`}
        >
          {running ? (
            <>
              <Square className="w-4 h-4" /> Clock Out ·{' '}
              {formatTimer(running, tick)}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Clock In
            </>
          )}
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isAdmin && entries.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-100">
          {entries.map((e) => {
            const open = !e.clock_out;
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
                    open ? 'text-green-600' : 'text-slate-700'
                  }`}
                >
                  {open ? 'Running' : `${formatHours(entryMinutes(e))} hrs`}
                </span>
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
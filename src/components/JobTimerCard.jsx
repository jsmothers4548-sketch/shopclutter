import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { entryMinutes, formatHours, formatTimer } from '@/lib/jobTime';
import usePlanFeature from '@/hooks/usePlanFeature';
import UpgradePrompt from '@/components/UpgradePrompt';
import { Play, Square, Clock } from 'lucide-react';

// Clocking in and out of a job. Time is written by the server, which also
// enforces the shop's one-job-at-a-time rule.
export default function JobTimerCard({ jobId, jobStatus }) {
  const { user } = useAuth();
  const { locked } = usePlanFeature('job_time_clock');
  const [entries, setEntries] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(Date.now());

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

  const mineOpen = entries.find(
    (e) => !e.clock_out && e.created_by_id === user?.id
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
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    running ? 'text-green-600' : 'text-slate-700'
                  }`}
                >
                  {running ? 'Running' : `${formatHours(entryMinutes(e))} hrs`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
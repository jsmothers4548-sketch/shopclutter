import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { formatTimer } from '@/lib/jobTime';
import usePlanFeature from '@/hooks/usePlanFeature';
import { Square, Clock } from 'lucide-react';

// The running job clock, shown on the job board. A technician always has a way
// to stop the timer here, even when the job they clocked into is not on screen.
export default function ActiveJobClock() {
  const { locked, loading: planLoading } = usePlanFeature('job_time_clock');
  const [entry, setEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(Date.now());

  const load = async () => {
    const res = await base44.functions.invoke('jobTimeClock', {
      action: 'status',
    });
    setEntry(res?.data?.open_entry || null);
  };

  useEffect(() => {
    if (planLoading || locked) return;
    load();
  }, [planLoading, locked]);

  useEffect(() => {
    if (!entry) return;
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [entry?.id]);

  if (planLoading || locked || !entry) return null;

  const clockOut = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke('jobTimeClock', {
        action: 'clock_out',
        job_id: entry.job_id,
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
      <Clock className="w-4 h-4 text-green-700 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-green-800 truncate">
          Clocked in on{' '}
          <Link to={`/jobs/${entry.job_id}`} className="underline">
            {entry.job_label || 'a job'}
          </Link>
        </p>
        <p className="text-[11px] text-green-700 tabular-nums">
          {formatTimer(entry, tick)}
        </p>
      </div>
      <button
        onClick={clockOut}
        disabled={busy}
        className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold shrink-0 disabled:opacity-50 active:bg-red-700"
      >
        <Square className="w-3.5 h-3.5" /> Clock Out
      </button>
    </div>
  );
}
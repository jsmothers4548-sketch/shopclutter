import React from 'react';
import { formatHours } from '@/lib/jobTime';

// Recorded job time, shown both ways: totalled per job and per technician.
export default function JobTimeReport({ periodLabel, byJob, byTech, totalMinutes }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 space-y-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm">
          Time on Jobs — {periodLabel}
        </h2>
        <span className="text-sm font-bold text-slate-900">
          {formatHours(totalMinutes)} hrs total
        </span>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          By Job
        </h3>
        {byJob.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-3">
            No job time recorded in this period
          </p>
        ) : (
          <div className="space-y-1">
            {byJob.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {r.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {r.sessions} session{r.sessions === 1 ? '' : 's'}
                    {r.subtitle ? ` · ${r.subtitle}` : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {formatHours(r.minutes)} hrs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          By Technician
        </h3>
        {byTech.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-3">
            No job time recorded in this period
          </p>
        ) : (
          <div className="space-y-1">
            {byTech.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.jobCount} job{r.jobCount === 1 ? '' : 's'} ·{' '}
                    {r.sessions} session{r.sessions === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {formatHours(r.minutes)} hrs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
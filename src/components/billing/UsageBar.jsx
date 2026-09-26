import React from 'react';
import { limitLabel } from '@/lib/plans';

export default function UsageBar({ label, used, limit }) {
  const unlimited = limit === null || limit === undefined;
  const percent = unlimited || !limit ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const atLimit = !unlimited && used >= limit;

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {used} <span className="font-normal text-slate-500">of {limitLabel(limit)}</span>
      </p>
      {!unlimited && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${atLimit ? 'bg-red-500' : 'bg-primary'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
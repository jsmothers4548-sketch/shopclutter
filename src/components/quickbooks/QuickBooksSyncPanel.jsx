import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const DIRECTIONS = [
  { id: 'two_way', label: 'Both ways' },
  { id: 'push', label: 'To QuickBooks' },
  { id: 'pull', label: 'From QuickBooks' },
];

export default function QuickBooksSyncPanel({
  connection,
  busy,
  result,
  error,
  onDirection,
  onSync,
}) {
  const connected = connection?.status === 'connected';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div>
        <h2 className="font-bold text-slate-900">Accounting sync</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Customers sync first. ShopClutter keeps its own details for a customer
          you have on both sides, and any difference found in QuickBooks is
          recorded in the run below.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Direction
        </p>
        <div className="flex flex-wrap gap-2">
          {DIRECTIONS.map((d) => {
            const active = (connection?.accounting_direction || 'two_way') === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDirection(d.id)}
                disabled={!connected || busy}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                  active
                    ? 'bg-amber-500 border-amber-500 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {result && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
          {result.created} added, {result.updated} updated, {result.skipped}{' '}
          unchanged{result.failed ? `, ${result.failed} failed` : ''}.
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button onClick={onSync} disabled={!connected || busy} className="w-full sm:w-auto">
        <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
        {busy ? 'Syncing…' : 'Sync now'}
      </Button>
    </div>
  );
}
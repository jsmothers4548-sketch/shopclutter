import React from 'react';
import { History } from 'lucide-react';

const tone = {
  success: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

export default function QuickBooksSyncLog({ logs }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-slate-500" />
        <h2 className="font-bold text-slate-900">Recent sync runs</h2>
      </div>

      {!logs.length && (
        <p className="text-sm text-slate-500">
          Nothing has been synced yet. Run a sync to see the results here.
        </p>
      )}

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-lg border border-slate-200 px-3 py-2 space-y-1"
          >
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  tone[log.status] || 'bg-slate-100 text-slate-600'
                }`}
              >
                {log.status}
              </span>
              <span className="text-xs text-slate-400">
                {log.created_date
                  ? new Date(log.created_date).toLocaleString()
                  : ''}
              </span>
            </div>
            <p className="text-sm text-slate-700">{log.summary}</p>
            {log.details && (
              <p className="text-xs text-slate-500 whitespace-pre-line">
                {log.details}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
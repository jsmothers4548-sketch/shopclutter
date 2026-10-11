import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { rowSummary } from '@/lib/migration';

export default function ImportPreview({ category, preview, onBack, onNext, busy }) {
  const ready = preview.filter((r) => !r.issues.length);
  const problems = preview.filter((r) => r.issues.length);

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Adjust the columns
      </button>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{ready.length}</p>
          <p className="text-xs text-slate-500">rows ready</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{problems.length}</p>
          <p className="text-xs text-slate-500">need attention</p>
        </div>
      </div>

      {problems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-semibold text-amber-800">
              These rows will be left out
            </p>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {problems.slice(0, 40).map((row) => (
              <div key={row.index} className="px-3 py-2">
                <p className="text-xs font-semibold text-slate-700">
                  Row {row.index + 2}
                </p>
                <p className="text-xs text-red-600">{row.issues.join(' · ')}</p>
              </div>
            ))}
          </div>
          {problems.length > 40 && (
            <p className="px-3 py-2 text-xs text-slate-400">
              and {problems.length - 40} more
            </p>
          )}
        </div>
      )}

      {ready.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-slate-700">First rows to import</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                {ready.slice(0, 10).map((row) => (
                  <tr key={row.index}>
                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">
                      {row.index + 2}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{rowSummary(category, row.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ready.length > 10 && (
            <p className="px-3 py-2 text-xs text-slate-400">
              and {ready.length - 10} more
            </p>
          )}
        </div>
      )}

      <Button className="w-full" onClick={onNext} disabled={!ready.length || busy}>
        {busy ? 'Checking…' : 'Check for duplicates'}
      </Button>
    </div>
  );
}
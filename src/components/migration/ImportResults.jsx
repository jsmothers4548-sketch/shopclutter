import React from 'react';
import { Button } from '@/components/ui/button';
import { downloadCsv, toCsv } from '@/lib/csv';
import { CheckCircle2, AlertTriangle, Download, RotateCcw } from 'lucide-react';

export default function ImportResults({ category, preview, results, onRestart }) {
  const errors = results.errors || [];

  const downloadErrors = () => {
    const headers = ['Row', 'Issue', ...category.fields.map((f) => f.key)];
    const rows = errors.map((err) => {
      const source = preview.find((p) => p.index === err.index);
      const record = { Row: err.index + 2, Issue: err.message };
      category.fields.forEach((f) => {
        record[f.key] = source?.data?.[f.key] ?? '';
      });
      return record;
    });
    downloadCsv(`${category.key}-import-errors.csv`, toCsv(headers, rows));
  };

  return (
    <div className="space-y-3">
      {results.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">The import stopped</p>
            <p className="text-xs text-red-600 mt-0.5">{results.error}</p>
            <p className="text-xs text-red-600 mt-1">
              The counts below are what finished before it stopped.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-900">Import finished</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <p className="text-xl font-bold text-emerald-700">{results.imported}</p>
            <p className="text-xs text-emerald-700">added</p>
          </div>
          <div className="rounded-lg bg-sky-50 p-3 text-center">
            <p className="text-xl font-bold text-sky-700">{results.updated}</p>
            <p className="text-xs text-sky-700">updated</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <p className="text-xl font-bold text-slate-600">{results.skipped}</p>
            <p className="text-xs text-slate-500">skipped</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-center">
            <p className="text-xl font-bold text-amber-700">{results.failed}</p>
            <p className="text-xs text-amber-700">failed</p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-xs font-semibold text-amber-800">
              Rows that could not be imported
            </p>
          </div>
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
            {errors.slice(0, 40).map((err, i) => (
              <div key={`${err.index}-${i}`} className="px-3 py-2">
                <p className="text-xs font-semibold text-slate-700">Row {err.index + 2}</p>
                <p className="text-xs text-red-600">{err.message}</p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <Button variant="outline" size="sm" className="w-full" onClick={downloadErrors}>
              <Download className="w-4 h-4 mr-1.5" /> Download these rows
            </Button>
          </div>
        </div>
      )}

      <Button className="w-full" variant="outline" onClick={onRestart}>
        <RotateCcw className="w-4 h-4 mr-1.5" /> Import something else
      </Button>
    </div>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy } from 'lucide-react';
import { rowSummary } from '@/lib/migration';

const CHOICES = [
  { key: 'skip', label: 'Skip it' },
  { key: 'update', label: 'Update existing' },
  { key: 'create', label: 'Add as new' },
];

export default function DuplicateReview({
  category,
  preview,
  matches,
  decisions,
  onDecide,
  onBulk,
  onBack,
  onImport,
}) {
  const rows = preview.filter((r) => matches[r.index]);

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Back to the preview
      </button>

      {rows.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-1">
          <Copy className="w-7 h-7 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No likely duplicates</p>
          <p className="text-xs text-slate-500">
            Nothing in your shop looks like these rows, so they will all be added
            as new.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
            <p className="text-xs text-slate-600">
              {rows.length} row{rows.length !== 1 ? 's' : ''} look like records you
              already have. Choose what to do with each one.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onBulk('skip')}>
                Skip all
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onBulk('create')}>
                Add all as new
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {rows.slice(0, 60).map((row) => {
              const match = matches[row.index];
              return (
                <div
                  key={row.index}
                  className="bg-white border border-slate-200 rounded-xl p-3 space-y-2"
                >
                  <div>
                    <p className="text-xs text-slate-400">Row {row.index + 2}</p>
                    <p className="text-sm font-medium text-slate-900">
                      {rowSummary(category, row.data)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <p className="text-xs text-slate-500">Already in your shop</p>
                    <p className="text-sm text-slate-700">{match.label}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {CHOICES.map((choice) => (
                      <button
                        key={choice.key}
                        onClick={() => onDecide(row.index, choice.key)}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold border ${
                          (decisions[row.index] || 'skip') === choice.key
                            ? 'bg-amber-500 border-amber-500 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {rows.length > 60 && (
            <p className="text-xs text-slate-400">
              and {rows.length - 60} more, left set to skip. Use the buttons above
              to change them all at once.
            </p>
          )}
        </>
      )}

      <Button className="w-full" onClick={onImport}>
        Import {preview.filter((r) => !r.issues.length).length} rows
      </Button>
    </div>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ColumnMapper({ category, headers, mapping, onChange, onBack, onNext }) {
  const missingRequired = category.fields.filter(
    (field) => field.required && !mapping[field.key]
  );

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Choose a different file
      </button>

      <p className="text-sm text-slate-500">
        We matched your columns to the app's fields. Change anything that looks
        wrong.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {category.fields.map((field) => (
          <div key={field.key} className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {field.label}
                {field.required && <span className="text-amber-600"> *</span>}
              </p>
            </div>
            <select
              value={mapping[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={`w-40 shrink-0 rounded-lg border bg-white px-2 py-1.5 text-sm ${
                field.required && !mapping[field.key]
                  ? 'border-amber-400 text-amber-700'
                  : 'border-slate-300 text-slate-700'
              }`}
            >
              <option value="">Not imported</option>
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {missingRequired.length > 0 && (
        <p className="text-xs text-amber-700">
          Still needed: {missingRequired.map((f) => f.label).join(', ')}
        </p>
      )}

      <Button className="w-full" onClick={onNext} disabled={missingRequired.length > 0}>
        Check the rows
      </Button>
    </div>
  );
}
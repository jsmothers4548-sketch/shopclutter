import React from 'react';

const STEPS = [
  { key: 'choose', label: 'Choose' },
  { key: 'upload', label: 'File' },
  { key: 'map', label: 'Columns' },
  { key: 'preview', label: 'Preview' },
  { key: 'review', label: 'Duplicates' },
  { key: 'done', label: 'Results' },
];

const ORDER = ['choose', 'upload', 'map', 'preview', 'review', 'import', 'done'];

export default function MigrationSteps({ step }) {
  const current = ORDER.indexOf(step);
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
      {STEPS.map((s) => {
        const position = ORDER.indexOf(s.key);
        const active = position === current;
        const done = position < current;
        return (
          <span
            key={s.key}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
              active
                ? 'bg-amber-500 text-slate-900'
                : done
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-white text-slate-400 border border-slate-200'
            }`}
          >
            {s.label}
          </span>
        );
      })}
    </div>
  );
}
import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const ACTION_STYLES = {
  create: { Icon: Plus, cls: 'bg-green-50 text-green-700', label: 'Created' },
  update: { Icon: Pencil, cls: 'bg-amber-50 text-amber-700', label: 'Edited' },
  delete: { Icon: Trash2, cls: 'bg-red-50 text-red-700', label: 'Deleted' },
};

export default function AuditEntryRow({ entry }) {
  const style = ACTION_STYLES[entry.action] || ACTION_STYLES.update;
  const { Icon } = style;
  const when = new Date(entry.occurred_at || entry.created_date);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className={`p-1.5 rounded-lg shrink-0 ${style.cls}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {entry.category}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-500">
            {style.label}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">
          {entry.summary}
        </p>
        {entry.details && (
          <p className="text-sm text-slate-500 whitespace-pre-line">
            {entry.details}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          {entry.actor_name} · {when.toLocaleDateString()}{' '}
          {when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
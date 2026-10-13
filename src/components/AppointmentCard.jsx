import React from 'react';
import { Pencil, Trash2, MapPin, CheckCircle2, Circle } from 'lucide-react';
import ContactButtons from '@/components/ContactButtons';

const TYPE_STYLES = {
  'On-site': 'bg-blue-100 text-blue-700',
  'Off-site': 'bg-green-100 text-green-700',
  General: 'bg-slate-100 text-slate-600',
};

export const formatTime = (value) => {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h)) return value;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m || 0).padStart(2, '0')} ${suffix}`;
};

const formatDay = (value) => {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// One appointment in the list: when it is, what it is, and who it is with.
export default function AppointmentCard({
  appointment: a,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  const done = a.status === 'completed';
  const timeRange = [formatTime(a.start_time), formatTime(a.end_time)]
    .filter(Boolean)
    .join(' – ');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(a)}
          className="mt-0.5 shrink-0"
          aria-label={done ? 'Mark as scheduled' : 'Mark as completed'}
        >
          {done ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold text-slate-900 ${
              done ? 'line-through text-slate-400' : ''
            }`}
          >
            {a.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                TYPE_STYLES[a.appointment_type] || TYPE_STYLES.General
              }`}
            >
              {a.appointment_type || 'General'}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {formatDay(a.appointment_date)}
            </span>
            {timeRange && (
              <span className="text-xs font-medium text-slate-400">
                {timeRange}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(a)}
            className="p-1.5 rounded-lg text-slate-400 active:bg-slate-100"
            aria-label="Edit appointment"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(a)}
            className="p-1.5 rounded-lg text-red-400 active:bg-red-50"
            aria-label="Delete appointment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {a.customer_name && (
        <div className="text-sm text-slate-600 flex items-start gap-1.5">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            <span className="font-medium text-slate-800">
              {a.customer_name}
            </span>
            {a.customer_address ? ` — ${a.customer_address}` : ''}
          </span>
        </div>
      )}

      {a.notes && (
        <p className="text-sm text-slate-500 whitespace-pre-wrap">{a.notes}</p>
      )}

      {a.customer_phone && <ContactButtons phone={a.customer_phone} />}
    </div>
  );
}
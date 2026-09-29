import React, { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';

// One roadmap note: tap the row to read the full note, tick it off when done.
export default function RoadmapNoteItem({ note, onToggleDone, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3 py-2.5">
        <button
          onClick={() => onToggleDone(note)}
          aria-label={note.done ? 'Mark as not done' : 'Mark as done'}
          className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${
            note.done
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-slate-300 bg-white'
          }`}
        >
          {note.done && <Check className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setOpen(!open)}
          className="min-w-0 flex-1 text-left"
        >
          <p
            className={`text-sm font-semibold ${
              note.done
                ? 'text-slate-400 line-through'
                : 'text-slate-900'
            }`}
          >
            {note.title}
          </p>
          {!open && note.details && (
            <p className="text-xs text-slate-400 truncate">{note.details}</p>
          )}
        </button>

        <button
          onClick={() => onEdit(note)}
          className="p-1.5 text-slate-400 hover:text-amber-600 shrink-0"
          aria-label="Edit note"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(note)}
          className="p-1.5 text-slate-300 hover:text-red-500 shrink-0"
          aria-label="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && note.details && (
        <p
          className={`pb-3 pl-8 text-sm whitespace-pre-wrap ${
            note.done ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {note.details}
        </p>
      )}
    </div>
  );
}
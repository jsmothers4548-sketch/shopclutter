import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import RoadmapNoteItem from '@/components/RoadmapNoteItem';

// One collapsible topic heading with its notes and an open-item count.
export default function RoadmapTopicSection({
  topic,
  notes,
  collapsed,
  onToggleCollapse,
  onToggleDone,
  onEdit,
  onDelete,
}) {
  const openCount = notes.filter((n) => !n.done).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center gap-2 text-left"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <h2 className="font-bold text-slate-900 flex-1">{topic}</h2>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            openCount
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {openCount ? `${openCount} open` : 'All done'}
        </span>
      </button>

      {!collapsed && (
        <div className="mt-2">
          {notes.map((note) => (
            <RoadmapNoteItem
              key={note.id}
              note={note}
              onToggleDone={onToggleDone}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
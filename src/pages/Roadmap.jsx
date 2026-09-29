import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Plus } from 'lucide-react';
import RoadmapTopicSection from '@/components/RoadmapTopicSection';
import RoadmapNoteForm from '@/components/RoadmapNoteForm';

// Admin-only list of ideas and decisions for the shop, grouped by topic, so
// nothing we've discussed gets lost between sessions.
const PREFERRED_ORDER = ['Label Printing', 'Onboarding Other Shops', 'Ideas'];

export default function Roadmap() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [activeNote, setActiveNote] = useState(null);

  const load = () =>
    base44.entities.RoadmapNote.list('-created_date', 200)
      .then((list) => setNotes(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const topics = [
    ...new Set(notes.map((n) => n.topic || 'Ideas')),
  ].sort((a, b) => {
    const ia = PREFERRED_ORDER.indexOf(a);
    const ib = PREFERRED_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });

  const toggleDone = async (note) => {
    const done = !note.done;
    await base44.entities.RoadmapNote.update(note.id, { done });
    setNotes(notes.map((n) => (n.id === note.id ? { ...n, done } : n)));
  };

  const deleteNote = async (note) => {
    await base44.entities.RoadmapNote.delete(note.id);
    setNotes(notes.filter((n) => n.id !== note.id));
  };

  const handleSaved = () => {
    setShowForm(false);
    setActiveNote(null);
    load();
  };

  if (!isAdmin) {
    return (
      <p className="text-center py-20 text-slate-400 text-sm">
        Admin access only
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roadmap</h1>
          <p className="text-xs text-slate-400">
            Ideas and decisions to come back to
          </p>
        </div>
        <button
          onClick={() => {
            setActiveNote(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-semibold active:bg-amber-600 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {topics.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-10">
          No notes yet — add the first one
        </p>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <RoadmapTopicSection
              key={topic}
              topic={topic}
              notes={notes.filter((n) => (n.topic || 'Ideas') === topic)}
              collapsed={!!collapsed[topic]}
              onToggleCollapse={() =>
                setCollapsed({ ...collapsed, [topic]: !collapsed[topic] })
              }
              onToggleDone={toggleDone}
              onEdit={(note) => {
                setActiveNote(note);
                setShowForm(true);
              }}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}

      {showForm && (
        <RoadmapNoteForm
          note={activeNote}
          topics={topics.length ? topics : PREFERRED_ORDER}
          onClose={() => {
            setShowForm(false);
            setActiveNote(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
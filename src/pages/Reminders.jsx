import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import ReminderForm from '@/components/ReminderForm';
import { Plus, Bell, CheckCircle2, Circle, Trash2, Pencil, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_STYLES = {
  'On-site': 'bg-blue-100 text-blue-700',
  'Off-site': 'bg-green-100 text-green-700',
  'General': 'bg-slate-100 text-slate-600',
};

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [filter, setFilter] = useState('pending');

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.Reminder.list('-due_date', 200);
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const toggleComplete = async (reminder) => {
    const next = reminder.status === 'completed' ? 'pending' : 'completed';
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, status: next } : r)));
    try {
      await base44.entities.Reminder.update(reminder.id, { status: next });
    } catch (err) {
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, status: reminder.status } : r)));
      window.alert('Failed to update reminder');
    }
  };

  const handleDelete = async (reminder) => {
    if (!window.confirm(`Delete "${reminder.title}"?`)) return;
    setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
    try {
      await base44.entities.Reminder.delete(reminder.id);
    } catch (err) {
      window.alert('Failed to delete reminder');
      loadReminders();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const filtered =
    filter === 'pending'
      ? safeReminders.filter((r) => r.status !== 'completed')
      : filter === 'completed'
      ? safeReminders.filter((r) => r.status === 'completed')
      : safeReminders;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-slate-500">Couldn't load reminders.</p>
          <button
            onClick={() => loadReminders()}
            className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reminders</h1>
        <button
          onClick={() => { setEditReminder(null); setShowForm(true); }}
          className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm active:bg-red-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex gap-2">
        {['pending', 'completed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No reminders here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const isDone = r.status === 'completed';
            const isOverdue = !isDone && r.due_date && r.due_date < todayStr;
            const isToday = r.due_date === todayStr;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
                <button onClick={() => toggleComplete(r)} className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {r.title}
                  </p>
                  {r.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{r.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_STYLES[r.appointment_type] || TYPE_STYLES.General}`}>
                      {r.appointment_type}
                    </span>
                    {r.due_date && (
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : isToday ? 'text-amber-600' : 'text-slate-400'}`}>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {r.due_date}
                        {isOverdue && ' (overdue)'}
                        {isToday && !isDone && ' (today)'}
                      </span>
                    )}
                  </div>
                  {r.customer_name && (
                    <div className="mt-1.5">
                      <Link
                        to="/customers"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3" /> {r.customer_name}
                        {r.customer_address && ` — ${r.customer_address}`}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditReminder(r); setShowForm(true); }}
                    className="p-1.5 rounded-lg text-slate-400 active:bg-slate-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-1.5 rounded-lg text-red-400 active:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <ReminderForm
          reminder={editReminder}
          onClose={() => { setShowForm(false); setEditReminder(null); }}
          onSaved={() => { setShowForm(false); setEditReminder(null); loadReminders(); }}
        />
      )}
    </div>
  );
}
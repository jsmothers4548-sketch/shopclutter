import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import StaffTaskForm from '@/components/StaffTaskForm';
import { Plus, Circle, Clock, CheckCircle2, Trash2, Pencil, ClipboardList } from 'lucide-react';

const STATUS_CONFIG = {
  todo: { icon: Circle, color: 'text-slate-400' },
  in_progress: { icon: Clock, color: 'text-blue-500' },
  done: { icon: CheckCircle2, color: 'text-green-500' },
};

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-slate-100 text-slate-600 border-slate-300',
};

const NEXT_STATUS = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

export default function StaffTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('active');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.StaffTask.list('-created_date', 200);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const cycleStatus = async (task) => {
    const next = NEXT_STATUS[task.status] || 'todo';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    try {
      await base44.entities.StaffTask.update(task.id, { status: next });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      window.alert('Failed to update task status');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await base44.entities.StaffTask.delete(task.id);
    } catch (err) {
      window.alert('Failed to delete task');
      loadTasks();
    }
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks =
    filter === 'active'
      ? safeTasks.filter((t) => t.status !== 'done')
      : filter === 'done'
      ? safeTasks.filter((t) => t.status === 'done')
      : safeTasks;

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
          <p className="text-sm text-slate-500">Couldn't load tasks.</p>
          <button
            onClick={() => loadTasks()}
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
        <h1 className="text-2xl font-bold text-slate-900">Staff Tasks</h1>
        <button
          onClick={() => { setEditTask(null); setShowForm(true); }}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex gap-2">
        {['active', 'done', 'all'].map((f) => (
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

      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No tasks here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
            const StatusIcon = status.icon;
            const isDone = task.status === 'done';
            return (
              <div key={task.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3">
                <button onClick={() => cycleStatus(task)} className="mt-0.5 shrink-0">
                  <StatusIcon className={`w-6 h-6 ${status.color}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-slate-500 mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {task.category && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {task.category}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
                      {task.priority || 'medium'}
                    </span>
                    {task.assigned_to && (
                      <span className="text-xs text-slate-400">@{task.assigned_to}</span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-slate-400">{task.due_date}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditTask(task); setShowForm(true); }}
                    className="p-1.5 rounded-lg text-slate-400 active:bg-slate-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
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
        <StaffTaskForm
          task={editTask}
          onClose={() => { setShowForm(false); setEditTask(null); }}
          onSaved={() => { setShowForm(false); setEditTask(null); loadTasks(); }}
        />
      )}
    </div>
  );
}
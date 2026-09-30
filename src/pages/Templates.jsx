import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { gated } from '@/lib/planApi';
import JobTemplateForm from '@/components/JobTemplateForm';
import UpgradePrompt from '@/components/UpgradePrompt';
import usePlanFeature from '@/hooks/usePlanFeature';
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react';

export default function Templates() {
  const { locked, loading: planLoading } = usePlanFeature('templates');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadData = async () => {
    try {
      const data = await base44.entities.JobTemplate.list('name', 200);
      setTemplates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    await gated.templates.delete(id);
    loadData();
  };

  const countItems = (jsonStr) => {
    try {
      const arr = JSON.parse(jsonStr);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  };

  if (planLoading) return null;
  if (locked) return <UpgradePrompt feature="templates" />;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Wrench className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No templates yet</p>
          <p className="text-xs mt-1">
            Create templates for oil changes, tune-ups, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.equipment_type}
                    {t.problem_description
                      ? ` · ${t.problem_description}`
                      : ''}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span>
                      {countItems(t.parts_data)} part
                      {countItems(t.parts_data) !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {countItems(t.labor_data)} labor entr
                      {countItems(t.labor_data) !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(t);
                      setShowForm(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <JobTemplateForm
          template={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
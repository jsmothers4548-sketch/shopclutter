import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Wrench } from 'lucide-react';
import { gated } from '@/lib/planApi';
import usePlanFeature from '@/hooks/usePlanFeature';
import {
  recordAudit,
  AUDIT_CATEGORIES,
  formatAuditValue,
} from '@/lib/auditLog';

// The service templates' own prices, kept here in Default Rates so an admin can
// revise them in one place. Saving changes the template only — a job already
// built from it keeps the prices it was given.
export default function TemplateRatesSection() {
  const { locked, loading } = usePlanFeature('templates');
  const [templates, setTemplates] = useState([]);
  const [values, setValues] = useState({});
  const [initial, setInitial] = useState({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || locked) return;
    base44.entities.JobTemplate.list('name', 200)
      .then((list) => {
        const rows = Array.isArray(list) ? list : [];
        const map = {};
        rows.forEach((t) => {
          map[t.id] = t.flat_rate ?? 0;
        });
        setTemplates(rows);
        setValues(map);
        setInitial(map);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [loading, locked]);

  if (loading || locked || !ready || templates.length === 0) return null;

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const changed = templates.filter(
        (t) => String(initial[t.id] ?? '') !== String(values[t.id] ?? '')
      );
      for (const t of changed) {
        await gated.templates.update(t.id, {
          flat_rate: Number(values[t.id]) || 0,
        });
      }
      if (changed.length) {
        await recordAudit({
          category: AUDIT_CATEGORIES.DEFAULT_RATES,
          action: 'update',
          target: 'Template rates',
          summary: `Changed ${changed.length} template rate${
            changed.length === 1 ? '' : 's'
          }`,
          details: changed
            .map(
              (t) =>
                `${t.name}: ${formatAuditValue(
                  initial[t.id],
                  'money'
                )} → ${formatAuditValue(Number(values[t.id]) || 0, 'money')}`
            )
            .join('\n'),
        });
      }
      setInitial({ ...values });
      setSaved(true);
    } catch (err) {
      setError(err?.message || 'Those rates could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-1 border-t border-slate-100 space-y-3">
      <div className="flex items-center gap-1.5">
        <Wrench className="w-4 h-4 text-amber-600" />
        <h3 className="font-semibold text-slate-900 text-sm">
          Service Template Rates
        </h3>
      </div>
      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <Label
              htmlFor={`template-rate-${t.id}`}
              className="flex-1 min-w-0 truncate text-sm font-normal text-slate-700"
            >
              {t.name}
            </Label>
            <Input
              id={`template-rate-${t.id}`}
              type="number"
              step="0.01"
              min="0"
              className="w-28 shrink-0"
              value={values[t.id] ?? ''}
              onChange={(e) =>
                setValues({ ...values, [t.id]: e.target.value })
              }
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        A set price for the whole service. Picking the template on a new job adds
        it as one flat-rate labor line, and the job stays editable. Changing a
        rate here never touches jobs already made.
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Template Rates'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gift, Plus, Trash2, Check } from 'lucide-react';
import { withShopAll } from '@/lib/shopScope';
import { gated } from '@/lib/planApi';

// The shop's visit milestones, kept in the Admin menu. Each row is a number of
// visits and the reward it earns — either a percentage of the ticket or a flat
// amount off. Saving is what the shop sees; the reminder itself appears on the
// job board once a customer actually reaches the milestone.
export default function LoyaltyDiscountsForm() {
  const [rows, setRows] = useState(null);
  const [removed, setRemoved] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    base44.entities.LoyaltyMilestone.list('visit_count', 200)
      .then((list) => {
        // Keep a snapshot of each saved milestone so Save only writes the rows
        // that actually changed.
        const rows = (Array.isArray(list) ? list : []).map((m) => ({
          id: m.id,
          visit_count: m.visit_count,
          discount_type: m.discount_type || 'percentage',
          discount_value: m.discount_value,
          original: {
            visit_count: m.visit_count,
            discount_type: m.discount_type || 'percentage',
            discount_value: m.discount_value,
          },
        }));
        setRows(rows);
      })
      .catch(() => setRows([]));

  useEffect(() => {
    load();
  }, []);

  if (!rows) return null;

  const addRow = () =>
    setRows([
      ...rows,
      { visit_count: '', discount_type: 'percentage', discount_value: '' },
    ]);

  const patch = (index, changes) =>
    setRows(rows.map((r, i) => (i === index ? { ...r, ...changes } : r)));

  const removeRow = (index) => {
    const row = rows[index];
    if (row.id) setRemoved([...removed, row.id]);
    setRows(rows.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const kept = rows.filter((r) => Number(r.visit_count) > 0);

      const toCreate = kept.filter((r) => !r.id).map((r) => ({
        visit_count: Number(r.visit_count) || 0,
        discount_type: r.discount_type || 'percentage',
        discount_value: Number(r.discount_value) || 0,
      }));
      if (toCreate.length) {
        await gated.loyaltyMilestones.bulkCreate(withShopAll(toCreate));
      }

      const changed = kept.filter(
        (r) =>
          r.id &&
          (Number(r.visit_count) !== Number(r.original.visit_count) ||
            r.discount_type !== r.original.discount_type ||
            Number(r.discount_value) !== Number(r.original.discount_value))
      );
      for (const r of changed) {
        await gated.loyaltyMilestones.update(r.id, {
          visit_count: Number(r.visit_count) || 0,
          discount_type: r.discount_type || 'percentage',
          discount_value: Number(r.discount_value) || 0,
        });
      }

      for (const id of removed) {
        await gated.loyaltyMilestones.delete(id);
      }

      setRemoved([]);
      await load();
      setSaved(true);
    } catch (err) {
      setError(err?.message || 'Those milestones could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[85dvh] flex-col bg-white">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3 pr-12">
        <Gift className="w-4 h-4 shrink-0 text-amber-600" />
        <h2 className="font-bold text-slate-900">Loyalty Discounts</h2>
        <span className="min-w-0 truncate text-xs text-slate-400">
          Rewards for repeat customers
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <p className="text-xs text-slate-500">
          Set a milestone by number of visits. Every job ticket counts as a
          visit, so when a customer reaches one you'll get a reminder here in
          the admin area to give them the discount.
        </p>

        {rows.length === 0 && (
          <p className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-4 text-center text-sm text-slate-400">
            No milestones yet
          </p>
        )}

        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.id || `new-${index}`}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-24 shrink-0">
                  <Label htmlFor={`visit-${index}`} className="text-xs">
                    Visits
                  </Label>
                  <Input
                    id={`visit-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={row.visit_count}
                    onChange={(e) =>
                      patch(index, { visit_count: e.target.value })
                    }
                    placeholder="20"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label htmlFor={`value-${index}`} className="text-xs">
                    {row.discount_type === 'percentage'
                      ? 'Percent off'
                      : 'Amount off ($)'}
                  </Label>
                  <Input
                    id={`value-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.discount_value}
                    onChange={(e) =>
                      patch(index, { discount_value: e.target.value })
                    }
                    placeholder={row.discount_type === 'percentage' ? '10' : '15.00'}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  title="Remove this milestone"
                  className="mt-5 p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Select
                value={row.discount_type || 'percentage'}
                onValueChange={(v) => patch(index, { discount_type: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percent off the ticket</SelectItem>
                  <SelectItem value="fixed">Flat amount off the ticket</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={addRow}>
          <Plus className="w-4 h-4" /> Add milestone
        </Button>

        <p className="text-xs text-slate-400">
          The discount comes off the whole ticket, before tax. Nothing is applied
          until you approve it on the ticket itself.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Milestones'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
      {error && <p className="px-4 pb-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
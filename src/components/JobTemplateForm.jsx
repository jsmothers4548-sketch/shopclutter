import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';

const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Motorcycle/ATV',
  'Generator',
  'Compressor',
  'Chainsaw',
  'Weed Eater',
  'Other',
];

export default function JobTemplateForm({ template, onClose, onSaved }) {
  const [name, setName] = useState(template?.name || '');
  const [equipmentType, setEquipmentType] = useState(
    template?.equipment_type || 'Lawn Mower'
  );
  const [problemDescription, setProblemDescription] = useState(
    template?.problem_description || ''
  );
  const [taxRate, setTaxRate] = useState(template?.tax_rate ?? 7);
  const [laborRate, setLaborRate] = useState(
    template?.default_labor_rate ?? 75
  );
  const [parts, setParts] = useState(() => {
    try {
      return template?.parts_data ? JSON.parse(template.parts_data) : [];
    } catch {
      return [];
    }
  });
  const [labor, setLabor] = useState(() => {
    try {
      return template?.labor_data ? JSON.parse(template.labor_data) : [];
    } catch {
      return [];
    }
  });
  const [saving, setSaving] = useState(false);

  const addPart = () =>
    setParts([
      ...parts,
      { name: '', part_number: '', quantity: 1, unit_cost: 0 },
    ]);

  const updatePart = (i, field, val) =>
    setParts(
      parts.map((p, idx) =>
        idx === i
          ? { ...p, [field]: field === 'name' || field === 'part_number' ? val : parseFloat(val) || 0 }
          : p
      )
    );

  const removePart = (i) => setParts(parts.filter((_, idx) => idx !== i));

  const addLabor = () =>
    setLabor([
      ...labor,
      { description: '', hours: 0, hourly_rate: laborRate },
    ]);

  const updateLabor = (i, field, val) =>
    setLabor(
      labor.map((l, idx) =>
        idx === i
          ? { ...l, [field]: field === 'description' ? val : parseFloat(val) || 0 }
          : l
      )
    );

  const removeLabor = (i) => setLabor(labor.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        equipment_type: equipmentType,
        problem_description: problemDescription,
        tax_rate: taxRate,
        default_labor_rate: laborRate,
        parts_data: JSON.stringify(parts.filter((p) => p.name)),
        labor_data: JSON.stringify(labor.filter((l) => l.description)),
      };
      let saved;
      if (template) {
        saved = await base44.entities.JobTemplate.update(template.id, payload);
      } else {
        saved = await base44.entities.JobTemplate.create(payload);
      }
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'New Template'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Template Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Oil Change, Tune-Up..."
              required
            />
          </div>
          <div>
            <Label>Equipment Type</Label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Default Problem / Work Description</Label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Routine oil change..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Default Labor $/hr</Label>
              <Input
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Parts Section */}
          <div className="border-t pt-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold">Default Parts</Label>
              <button
                type="button"
                onClick={addPart}
                className="flex items-center gap-1 text-amber-600 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Add Part
              </button>
            </div>
            {parts.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-2 mb-2 bg-slate-50 p-2 rounded-lg"
              >
                <div className="flex-1 space-y-1.5">
                  <Input
                    value={p.name}
                    onChange={(e) => updatePart(i, 'name', e.target.value)}
                    placeholder="Part name"
                    className="text-sm h-8"
                  />
                  <div className="flex gap-1.5">
                    <Input
                      value={p.part_number}
                      onChange={(e) => updatePart(i, 'part_number', e.target.value)}
                      placeholder="Part #"
                      className="text-sm h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={p.quantity}
                      onChange={(e) => updatePart(i, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="text-sm h-8 w-16"
                    />
                    <Input
                      type="number"
                      value={p.unit_cost}
                      onChange={(e) => updatePart(i, 'unit_cost', e.target.value)}
                      placeholder="Cost"
                      className="text-sm h-8 w-20"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removePart(i)}
                  className="text-slate-400 hover:text-red-500 pt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {parts.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">
                No parts added
              </p>
            )}
          </div>

          {/* Labor Section */}
          <div className="border-t pt-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold">Default Labor</Label>
              <button
                type="button"
                onClick={addLabor}
                className="flex items-center gap-1 text-amber-600 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Add Labor
              </button>
            </div>
            {labor.map((l, i) => (
              <div
                key={i}
                className="flex items-start gap-2 mb-2 bg-slate-50 p-2 rounded-lg"
              >
                <div className="flex-1 space-y-1.5">
                  <Input
                    value={l.description}
                    onChange={(e) => updateLabor(i, 'description', e.target.value)}
                    placeholder="Labor description"
                    className="text-sm h-8"
                  />
                  <div className="flex gap-1.5">
                    <Input
                      type="number"
                      value={l.hours}
                      onChange={(e) => updateLabor(i, 'hours', e.target.value)}
                      placeholder="Hours"
                      className="text-sm h-8 w-20"
                    />
                    <Input
                      type="number"
                      value={l.hourly_rate}
                      onChange={(e) => updateLabor(i, 'hourly_rate', e.target.value)}
                      placeholder="Rate"
                      className="text-sm h-8 w-24"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLabor(i)}
                  className="text-slate-400 hover:text-red-500 pt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {labor.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">
                No labor added
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
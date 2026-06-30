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

const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Motorcycle/ATV',
  'Generator',
  'Compressor',
  'Chainsaw',
  'Weed Eater',
  'Other',
];

export default function JobForm({ customer, job, onClose, onSaved }) {
  const [form, setForm] = useState({
    customer_id: customer?.id || job?.customer_id,
    customer_name: customer?.name || job?.customer_name || '',
    equipment_type: job?.equipment_type || 'Lawn Mower',
    make: job?.make || '',
    model: job?.model || '',
    serial_number: job?.serial_number || '',
    problem_description: job?.problem_description || '',
    status: job?.status || 'Intake',
    tax_rate: job?.tax_rate ?? 7,
    default_labor_rate: job?.default_labor_rate ?? 75,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let saved;
      if (job) {
        saved = await base44.entities.Job.update(job.id, form);
      } else {
        saved = await base44.entities.Job.create(form);
      }
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {job ? 'Edit Job' : `New Job — ${customer?.name}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Equipment Type *</Label>
            <select
              value={form.equipment_type}
              onChange={(e) =>
                setForm({ ...form, equipment_type: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Make</Label>
              <Input
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                placeholder="Honda"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="HRX217"
              />
            </div>
          </div>
          <div>
            <Label>Serial Number</Label>
            <Input
              value={form.serial_number}
              onChange={(e) =>
                setForm({ ...form, serial_number: e.target.value })
              }
              placeholder="SN-12345"
            />
          </div>
          <div>
            <Label>Problem / Work Description *</Label>
            <textarea
              value={form.problem_description}
              onChange={(e) =>
                setForm({ ...form, problem_description: e.target.value })
              }
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Won't start, oil leak, needs tune-up..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.tax_rate}
                onChange={(e) =>
                  setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Default Labor $/hr</Label>
              <Input
                type="number"
                value={form.default_labor_rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    default_labor_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
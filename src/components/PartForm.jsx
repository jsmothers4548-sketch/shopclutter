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

export default function PartForm({ jobId, jobStatus, part, onClose, onSaved }) {
  const [form, setForm] = useState({
    job_id: jobId,
    job_status: part?.job_status || jobStatus || 'Intake',
    name: part?.name || '',
    part_number: part?.part_number || '',
    quantity: part?.quantity ?? 1,
    unit_cost: part?.unit_cost ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (part) {
        await base44.entities.Part.update(part.id, form);
      } else {
        await base44.entities.Part.create(form);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{part ? 'Edit Part' : 'Add Part'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Part Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Spark plug"
            />
          </div>
          <div>
            <Label>Part Number</Label>
            <Input
              value={form.part_number}
              onChange={(e) =>
                setForm({ ...form, part_number: e.target.value })
              }
              placeholder="NGK BPR6ES"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Unit Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.unit_cost}
                onChange={(e) =>
                  setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Line total:{' '}
            <span className="font-bold text-slate-900">
              ${(form.quantity * form.unit_cost).toFixed(2)}
            </span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
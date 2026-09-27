import React, { useState, useEffect } from 'react';
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
import { withShop } from '@/lib/shopScope';

export default function LaborForm({ jobId, jobStatus, defaultRate, labor, onClose, onSaved }) {
  const [form, setForm] = useState({
    job_id: jobId,
    job_status: labor?.job_status || jobStatus || 'Intake',
    description: labor?.description || '',
    hours: labor?.hours ?? 1,
    hourly_rate: labor?.hourly_rate ?? defaultRate ?? 75,
    pay_rate: labor?.pay_rate ?? 0,
    technician: labor?.technician || '',
  });
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    base44.entities.Staff.filter({ status: 'active' }).then((data) =>
      setStaff(Array.isArray(data) ? data : [])
    );
  }, []);

  const handleTechnicianChange = (name) => {
    const selected = staff.find((s) => s.name === name);
    setForm({
      ...form,
      technician: name,
      pay_rate: selected ? selected.pay_rate || 0 : form.pay_rate,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (labor) {
        await base44.entities.LaborEntry.update(labor.id, form);
      } else {
        await base44.entities.LaborEntry.create(withShop(form));
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
          <DialogTitle>{labor ? 'Edit Labor' : 'Add Labor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Description *</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
              placeholder="Carburetor cleaning"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hours</Label>
              <Input
                type="number"
                step="0.25"
                min="0"
                value={form.hours}
                onChange={(e) =>
                  setForm({ ...form, hours: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label>Rate ($/hr)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.hourly_rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hourly_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Technician</Label>
              <select
                value={form.technician}
                onChange={(e) => handleTechnicianChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
                {form.technician &&
                  !staff.some((s) => s.name === form.technician) && (
                    <option value={form.technician}>
                      {form.technician}
                    </option>
                  )}
              </select>
            </div>
            <div>
              <Label>Pay Rate ($/hr)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.pay_rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pay_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Line total:{' '}
            <span className="font-bold text-slate-900">
              ${(form.hours * form.hourly_rate).toFixed(2)}
            </span>
            {form.pay_rate > 0 && (
              <span className="ml-2 text-slate-400">
                (cost: ${(form.hours * form.pay_rate).toFixed(2)})
              </span>
            )}
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
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

export default function JobForm({ customer, job, template, jobLocation, onClose, onSaved }) {
  const [form, setForm] = useState({
    customer_id: customer?.id || job?.customer_id,
    customer_name: customer?.name || job?.customer_name || '',
    job_location: jobLocation || job?.job_location || 'On-site',
    offsite_address: job?.offsite_address || '',
    service_call_fee: job?.service_call_fee ?? (jobLocation === 'Off-site' ? 80 : 0),
    equipment_type: job?.equipment_type || template?.equipment_type || 'Lawn Mower',
    make: job?.make || '',
    model: job?.model || '',
    serial_number: job?.serial_number || '',
    problem_description: job?.problem_description || template?.problem_description || '',
    status: job?.status || 'Intake',
    tax_rate: job?.tax_rate ?? template?.tax_rate ?? 7,
    default_labor_rate: job?.default_labor_rate ?? (jobLocation === 'Off-site' ? 40 : template?.default_labor_rate ?? 75),
    parts_discount_type: job?.parts_discount_type || 'fixed',
    parts_discount_value: job?.parts_discount_value ?? 0,
    labor_discount_type: job?.labor_discount_type || 'fixed',
    labor_discount_value: job?.labor_discount_value ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleLocationChange = (loc) => {
    setForm((prev) => {
      const updates = { job_location: loc };
      if (loc === 'Off-site') {
        if (!prev.service_call_fee) updates.service_call_fee = 80;
        if (!prev.default_labor_rate || prev.default_labor_rate === 75) updates.default_labor_rate = 40;
      } else {
        updates.service_call_fee = 0;
        if (prev.default_labor_rate === 40) updates.default_labor_rate = 75;
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let saved;
      if (job) {
        saved = await base44.entities.Job.update(job.id, form);
      } else {
        saved = await base44.entities.Job.create(form);
        if (template) {
          const parts = template.parts_data ? JSON.parse(template.parts_data) : [];
          const labor = template.labor_data ? JSON.parse(template.labor_data) : [];
          if (parts.length) {
            await base44.entities.Part.bulkCreate(
              parts.map((p) => ({ ...p, job_id: saved.id, job_status: saved.status }))
            );
          }
          if (labor.length) {
            await base44.entities.LaborEntry.bulkCreate(
              labor.map((l) => ({ ...l, job_id: saved.id, job_status: saved.status }))
            );
          }
        }
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
            {job ? 'Edit Job' : `New Job — ${customer?.name}${template ? ` (Template: ${template.name})` : ''}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Job Location</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLocationChange('On-site')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  form.job_location === 'On-site'
                    ? 'bg-amber-500 text-slate-900 border-amber-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                On-site
              </button>
              <button
                type="button"
                onClick={() => handleLocationChange('Off-site')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  form.job_location === 'Off-site'
                    ? 'bg-blue-500 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Off-site
              </button>
            </div>
          </div>
          {form.job_location === 'Off-site' && (
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label>Off-site Address *</Label>
                <textarea
                  value={form.offsite_address}
                  onChange={(e) =>
                    setForm({ ...form, offsite_address: e.target.value })
                  }
                  className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="123 Main St, Springfield, IL 62701 (can differ from customer's address)"
                  required
                />
              </div>
              <div>
                <Label>Service Call Fee ($)</Label>
                <Input
                  type="number"
                  value={form.service_call_fee}
                  onChange={(e) =>
                    setForm({ ...form, service_call_fee: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          )}
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
          <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-800">Discounts</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Parts Discount Type</Label>
                <select
                  value={form.parts_discount_type}
                  onChange={(e) =>
                    setForm({ ...form, parts_discount_type: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="fixed">Fixed $</option>
                  <option value="percentage">Percentage %</option>
                </select>
              </div>
              <div>
                <Label>
                  Parts Discount {form.parts_discount_type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.parts_discount_value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      parts_discount_value: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Labor Discount Type</Label>
                <select
                  value={form.labor_discount_type}
                  onChange={(e) =>
                    setForm({ ...form, labor_discount_type: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="fixed">Fixed $</option>
                  <option value="percentage">Percentage %</option>
                </select>
              </div>
              <div>
                <Label>
                  Labor Discount {form.labor_discount_type === 'percentage' ? '(%)' : '($)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.labor_discount_value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      labor_discount_value: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
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
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
import QrScanner from '@/components/QrScanner';
import CustomerPicker from '@/components/CustomerPicker';
import VoiceIntake from '@/components/VoiceIntake';
import { ScanLine } from 'lucide-react';
import { getShopSettings, DEFAULT_SETTINGS } from '@/lib/shopSettings';
import { createJobWithTicket } from '@/lib/ticketNumbers';

const EQUIPMENT_TYPES = [
  'Lawn Mower',
  'Motorcycle/ATV',
  'Generator',
  'Compressor',
  'Chainsaw',
  'Weed Eater',
  'Other',
];

export default function JobForm({ customer, unit, job, template, jobLocation, onClose, onSaved }) {
  const [form, setForm] = useState({
    customer_id: customer?.id || unit?.customer_id || job?.customer_id,
    customer_name: customer?.name || unit?.customer_name || job?.customer_name || '',
    job_location: jobLocation || job?.job_location || 'On-site',
    offsite_address: job?.offsite_address || '',
    service_call_fee: job?.service_call_fee ?? (jobLocation === 'Off-site' ? DEFAULT_SETTINGS.service_call_fee : 0),
    equipment_type: unit?.equipment_type || job?.equipment_type || template?.equipment_type || 'Lawn Mower',
    make: unit?.make || job?.make || '',
    model: unit?.model || job?.model || '',
    serial_number: unit?.serial_number || job?.serial_number || '',
    problem_description: job?.problem_description || template?.problem_description || '',
    status: job?.status || 'Intake',
    tax_rate: job?.tax_rate ?? template?.tax_rate ?? DEFAULT_SETTINGS.job_tax_rate,
    default_labor_rate: job?.default_labor_rate ?? (jobLocation === 'Off-site' ? DEFAULT_SETTINGS.off_site_rate : template?.default_labor_rate ?? DEFAULT_SETTINGS.on_site_rate),
    parts_discount_type: job?.parts_discount_type || 'fixed',
    parts_discount_value: job?.parts_discount_value ?? 0,
    labor_discount_type: job?.labor_discount_type || 'fixed',
    labor_discount_value: job?.labor_discount_value ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [unitId, setUnitId] = useState(unit?.id || job?.unit_id || null);
  const [unitLabel, setUnitLabel] = useState(unit?.label_number || '');
  const [unitNote, setUnitNote] = useState(unit ? `Unit #${unit.label_number} linked` : '');
  const [showScanner, setShowScanner] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getShopSettings().then(setSettings).catch(() => {});
    base44.entities.Customer.list('-created_date', 500).then((list) =>
      setCustomers(Array.isArray(list) ? list : [])
    );
  }, []);

  useEffect(() => {
    if (job?.unit_id) {
      base44.entities.Equipment.get(job.unit_id)
        .then((u) => u && setUnitLabel(u.label_number || ''))
        .catch(() => {});
    }
  }, [job]);

  useEffect(() => {
    if (!settings || job) return;
    setForm((prev) => ({
      ...prev,
      tax_rate: template?.tax_rate ?? settings.job_tax_rate,
      default_labor_rate:
        template?.default_labor_rate ??
        (prev.job_location === 'Off-site'
          ? settings.off_site_rate
          : settings.on_site_rate),
      service_call_fee:
        prev.job_location === 'Off-site'
          ? settings.service_call_fee
          : prev.service_call_fee,
    }));
  }, [settings]);

  const lookupUnit = async (raw) => {
    const value = (raw || '').trim();
    if (!value) {
      setUnitId(null);
      setUnitNote('');
      return;
    }
    const found = await base44.entities.Equipment.filter({
      label_number: value,
    });
    const u = Array.isArray(found) ? found[0] : null;
    if (u) {
      setUnitId(u.id);
      setForm((prev) => ({
        ...prev,
        equipment_type: u.equipment_type || prev.equipment_type,
        make: u.make || prev.make,
        model: u.model || prev.model,
        serial_number: u.serial_number || prev.serial_number,
        customer_id: u.customer_id || prev.customer_id,
        customer_name: u.customer_name || prev.customer_name,
      }));
      setUnitNote(`Unit #${u.label_number} — existing unit, details loaded`);
    } else {
      setUnitId(null);
      setUnitNote(`Unit #${value} is new — it will be created for this job`);
    }
  };

  const handleVoiceExtracted = (d) => {
    setForm((prev) => ({
      ...prev,
      equipment_type: d.equipment_type || prev.equipment_type,
      make: d.make || prev.make,
      model: d.model || prev.model,
      serial_number: d.serial_number || prev.serial_number,
      problem_description: d.problem_description || prev.problem_description,
    }));
    if (d.unit_label) {
      setUnitLabel(String(d.unit_label));
      lookupUnit(String(d.unit_label));
    }
    if (d.customer_name) {
      const match = customers.find(
        (c) =>
          c.name?.toLowerCase().trim() ===
          String(d.customer_name).toLowerCase().trim()
      );
      if (match) handleCustomerChange(match.id);
    }
  };

  const handleCustomerChange = (customerId) => {
    setCustomerError('');
    const c = customers.find((x) => x.id === customerId);
    setForm((prev) => ({
      ...prev,
      customer_id: customerId,
      customer_name: c?.name || '',
    }));
  };

  const handleLocationChange = (loc) => {
    setForm((prev) => {
      const updates = { job_location: loc };
      const onSite = settings?.on_site_rate ?? DEFAULT_SETTINGS.on_site_rate;
      const offSite = settings?.off_site_rate ?? DEFAULT_SETTINGS.off_site_rate;
      if (loc === 'Off-site') {
        if (!prev.service_call_fee)
          updates.service_call_fee = settings?.service_call_fee ?? DEFAULT_SETTINGS.service_call_fee;
        if (!prev.default_labor_rate || prev.default_labor_rate === onSite)
          updates.default_labor_rate = offSite;
      } else {
        updates.service_call_fee = 0;
        if (prev.default_labor_rate === offSite)
          updates.default_labor_rate = onSite;
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) {
      setCustomerError('Select a customer to continue');
      return;
    }
    setSaving(true);
    try {
      let finalUnitId = unitId;
      const label = unitLabel.trim();
      if (label && !finalUnitId) {
        const createdUnit = await base44.entities.Equipment.create({
          label_number: label,
          customer_id: form.customer_id,
          customer_name: form.customer_name,
          equipment_type: form.equipment_type,
          make: form.make,
          model: form.model,
          serial_number: form.serial_number,
        });
        finalUnitId = createdUnit.id;
      }
      const payload = { ...form, unit_id: finalUnitId || null };
      let saved;
      if (job) {
        saved = await base44.entities.Job.update(job.id, payload);
      } else {
        saved = await createJobWithTicket(payload);
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
        <VoiceIntake onExtracted={handleVoiceExtracted} />
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Customer *</Label>
            <CustomerPicker
              customers={customers}
              value={form.customer_id || ''}
              onChange={(c) => handleCustomerChange(c?.id || '')}
              placeholder="Search by name or phone…"
            />
            {customerError && (
              <p className="text-xs text-red-600 mt-1">{customerError}</p>
            )}
          </div>
          <div>
            <Label>Unit Label #</Label>
            <div className="flex gap-2">
              <Input
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                onBlur={(e) => lookupUnit(e.target.value)}
                placeholder="e.g. 1001"
                inputMode="numeric"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowScanner(true)}
                className="px-3"
              >
                <ScanLine className="w-4 h-4" />
              </Button>
            </div>
            {unitNote && (
              <p className="text-xs text-amber-600 mt-1">{unitNote}</p>
            )}
          </div>
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
                  autoCapitalize="words"
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
                autoCapitalize="words"
                placeholder="Honda"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                autoCapitalize="words"
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
              autoCapitalize="sentences"
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
        {showScanner && (
          <QrScanner
            onClose={() => setShowScanner(false)}
            onResult={(text) => {
              setShowScanner(false);
              const value = (text.match(/\d+/) || [])[0] || text;
              setUnitLabel(value);
              lookupUnit(value);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
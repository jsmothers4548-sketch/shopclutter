import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Check } from 'lucide-react';
import { getShopSettings, DEFAULT_SETTINGS } from '@/lib/shopSettings';

const FIELDS = [
  ['on_site_rate', 'On-site Hourly Rate ($/hr)'],
  ['off_site_rate', 'Off-site Hourly Rate ($/hr)'],
  ['service_call_fee', 'Off-site Service Call Fee ($)'],
  ['job_tax_rate', 'Default Job Tax Rate (%)'],
  ['sales_tax_rate', 'Default Sales Tax Rate (%)'],
];

export default function ShopSettingsForm() {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getShopSettings()
      .then((s) => {
        setRecord(s.id || null);
        setForm({
          on_site_rate: s.on_site_rate,
          off_site_rate: s.off_site_rate,
          service_call_fee: s.service_call_fee,
          job_tax_rate: s.job_tax_rate,
          sales_tax_rate: s.sales_tax_rate,
        });
      })
      .catch(() => setForm({ ...DEFAULT_SETTINGS }));
  }, []);

  if (!form) return null;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const payload = {
      on_site_rate: Number(form.on_site_rate) || 0,
      off_site_rate: Number(form.off_site_rate) || 0,
      service_call_fee: Number(form.service_call_fee) || 0,
      job_tax_rate: Number(form.job_tax_rate) || 0,
      sales_tax_rate: Number(form.sales_tax_rate) || 0,
    };
    if (record) {
      await base44.entities.ShopSettings.update(record, payload);
    } else {
      const created = await base44.entities.ShopSettings.create(payload);
      setRecord(created.id);
    }
    setSaving(false);
    setSaved(true);
  };

  return (
    <form
      onSubmit={save}
      className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-amber-600" />
        <h2 className="font-bold text-slate-900">Default Rates</h2>
        <span className="text-xs text-slate-400">
          Defaults for new records only
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map(([key, label]) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              type="number"
              step="0.01"
              min="0"
              value={form[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
            <Check className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
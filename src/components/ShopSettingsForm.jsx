import React, { useState, useEffect } from 'react';
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
import { Settings, Check } from 'lucide-react';
import { getShopSettings, DEFAULT_SETTINGS } from '@/lib/shopSettings';

const FIELDS = [
  ['on_site_rate', 'On-site Hourly Rate ($/hr)'],
  ['off_site_rate', 'Off-site Hourly Rate ($/hr)'],
  ['service_call_fee', 'Off-site Service Call Fee ($)'],
  ['job_tax_rate', 'Default Job Tax Rate (%)'],
  ['sales_tax_rate', 'Default Sales Tax Rate (%)'],
];

const PICKUP_GROUPS = [
  {
    zone: 'In-town',
    fields: [
      ['pickup_in_town', 'Pickup ($)'],
      ['return_in_town', 'Delivery ($)'],
    ],
  },
  {
    zone: 'Out-of-town',
    fields: [
      ['pickup_out_of_town', 'Pickup ($)'],
      ['return_out_of_town', 'Delivery ($)'],
    ],
  },
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
          pickup_in_town: s.pickup_in_town,
          return_in_town: s.return_in_town,
          pickup_out_of_town: s.pickup_out_of_town,
          return_out_of_town: s.return_out_of_town,
          job_tax_rate: s.job_tax_rate,
          sales_tax_rate: s.sales_tax_rate,
          overtime_rule: s.overtime_rule || 'federal',
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
      pickup_in_town: Number(form.pickup_in_town) || 0,
      return_in_town: Number(form.return_in_town) || 0,
      pickup_out_of_town: Number(form.pickup_out_of_town) || 0,
      return_out_of_town: Number(form.return_out_of_town) || 0,
      job_tax_rate: Number(form.job_tax_rate) || 0,
      sales_tax_rate: Number(form.sales_tax_rate) || 0,
      overtime_rule: form.overtime_rule || 'federal',
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
      className="flex max-h-[85dvh] flex-col bg-white"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3 pr-12">
        <Settings className="w-4 h-4 shrink-0 text-amber-600" />
        <h2 className="font-bold text-slate-900">Default Rates</h2>
        <span className="min-w-0 truncate text-xs text-slate-400">
          Defaults for new records only
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
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
        <div className="pt-1 border-t border-slate-100 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">
            Pickup &amp; Delivery
          </h3>
          {PICKUP_GROUPS.map((group) => (
            <div
              key={group.zone}
              className="rounded-lg bg-slate-50 border border-slate-100 p-3"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {group.zone}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {group.fields.map(([key, label]) => (
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
            </div>
          ))}
          <p className="text-xs text-slate-400">
            Pre-fills new jobs — amounts can be typed over on each job
          </p>
        </div>
        <div>
          <Label htmlFor="overtime_rule">Overtime Rule</Label>
          <Select
            value={form.overtime_rule}
            onValueChange={(v) => setForm({ ...form, overtime_rule: v })}
          >
            <SelectTrigger id="overtime_rule" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="federal">
                Federal — over 40 hrs/week
              </SelectItem>
              <SelectItem value="daily">
                Daily — over 8 hrs/day + over 40/week
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400 mt-1">
            Applied automatically to all time clock overtime
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
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
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
import { Switch } from '@/components/ui/switch';
import { getShopSettings, DEFAULT_SETTINGS } from '@/lib/shopSettings';
import { withShop } from '@/lib/shopScope';
import TemplateRatesSection from '@/components/TemplateRatesSection';
import {
  recordAudit,
  AUDIT_CATEGORIES,
  formatAuditValue,
} from '@/lib/auditLog';

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

const RATE_FIELDS = [
  ['on_site_rate', 'On-site hourly rate', 'money'],
  ['off_site_rate', 'Off-site hourly rate', 'money'],
  ['service_call_fee', 'Service call fee', 'money'],
  ['pickup_in_town', 'In-town pickup', 'money'],
  ['return_in_town', 'In-town delivery', 'money'],
  ['pickup_out_of_town', 'Out-of-town pickup', 'money'],
  ['return_out_of_town', 'Out-of-town delivery', 'money'],
  ['job_tax_rate', 'Job tax rate', 'percent'],
  ['sales_tax_rate', 'Sales tax rate', 'percent'],
  ['overtime_rule', 'Overtime rule', 'overtime'],
  ['late_fee_value', 'Late pickup fee', 'money'],
  ['daily_fee_value', 'Late pickup daily fee', 'money'],
];

export default function ShopSettingsForm({ onSaved }) {
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getShopSettings()
      .then((s) => {
        setRecord(s.id || null);
        const values = {
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
          allow_overlapping_job_timers: !!s.allow_overlapping_job_timers,
          late_fee_enabled: !!s.late_fee_enabled,
          late_fee_days: s.late_fee_days ?? 30,
          late_fee_type: s.late_fee_type || 'flat',
          late_fee_value: s.late_fee_value ?? 0,
          daily_fee_enabled: !!s.daily_fee_enabled,
          daily_fee_type: s.daily_fee_type || 'flat',
          daily_fee_value: s.daily_fee_value ?? 0,
        };
        setInitial(values);
        setForm(values);
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
      allow_overlapping_job_timers: !!form.allow_overlapping_job_timers,
      late_fee_enabled: !!form.late_fee_enabled,
      late_fee_days: Number(form.late_fee_days) || 30,
      late_fee_type: form.late_fee_type || 'flat',
      late_fee_value: Number(form.late_fee_value) || 0,
      daily_fee_enabled: !!form.daily_fee_enabled,
      daily_fee_type: form.daily_fee_type || 'flat',
      daily_fee_value: Number(form.daily_fee_value) || 0,
    };
    if (record) {
      await base44.entities.ShopSettings.update(record, payload);
    } else {
      const created = await base44.entities.ShopSettings.create(
        withShop(payload)
      );
      setRecord(created.id);
    }

    const changed = RATE_FIELDS.filter(
      ([key]) => String(initial?.[key] ?? '') !== String(payload[key] ?? '')
    );
    if (changed.length) {
      await recordAudit({
        category: AUDIT_CATEGORIES.DEFAULT_RATES,
        action: 'update',
        target: 'Shop defaults',
        summary: `Changed ${changed.length} default rate${
          changed.length === 1 ? '' : 's'
        }`,
        details: changed
          .map(
            ([key, label, kind]) =>
              `${label}: ${formatAuditValue(
                initial?.[key],
                kind
              )} → ${formatAuditValue(payload[key], kind)}`
          )
          .join('\n'),
      });
    }

    setSaving(false);
    setSaved(true);
    onSaved?.();
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
        <div className="pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label htmlFor="allow_overlapping_job_timers">
                Allow more than one job timer
              </Label>
              <p className="text-xs text-slate-400 mt-1">
                Off: a technician must clock out of one job before starting
                another
              </p>
            </div>
            <Switch
              id="allow_overlapping_job_timers"
              checked={!!form.allow_overlapping_job_timers}
              onCheckedChange={(v) =>
                setForm({ ...form, allow_overlapping_job_timers: v })
              }
            />
          </div>
        </div>
        <div className="pt-1 border-t border-slate-100 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">
            Late Pickup Fees
          </h3>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label htmlFor="late_fee_enabled">Charge for late pickups</Label>
              <p className="text-xs text-slate-400 mt-1">
                For units left in the shop after they are ready
              </p>
            </div>
            <Switch
              id="late_fee_enabled"
              checked={!!form.late_fee_enabled}
              onCheckedChange={(v) =>
                setForm({ ...form, late_fee_enabled: v })
              }
            />
          </div>

          {form.late_fee_enabled && (
            <>
              <div>
                <Label htmlFor="late_fee_days">Days ready before the fee</Label>
                <Input
                  id="late_fee_days"
                  type="number"
                  min="1"
                  step="1"
                  value={form.late_fee_days}
                  onChange={(e) =>
                    setForm({ ...form, late_fee_days: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="late_fee_value">One-time fee</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.late_fee_type}
                    onValueChange={(v) =>
                      setForm({ ...form, late_fee_type: v })
                    }
                  >
                    <SelectTrigger className="w-20 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">$</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="late_fee_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.late_fee_value}
                    onChange={(e) =>
                      setForm({ ...form, late_fee_value: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Charged once. A percentage comes off the pre-tax job total.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label htmlFor="daily_fee_enabled">
                    Charge every day after
                  </Label>
                  <p className="text-xs text-slate-400 mt-1">
                    Adds up for each day past the day limit, on top of the
                    one-time fee
                  </p>
                </div>
                <Switch
                  id="daily_fee_enabled"
                  checked={!!form.daily_fee_enabled}
                  onCheckedChange={(v) =>
                    setForm({ ...form, daily_fee_enabled: v })
                  }
                />
              </div>
              {form.daily_fee_enabled && (
                <div>
                  <Label htmlFor="daily_fee_value">Daily fee</Label>
                  <div className="flex gap-2">
                    <Select
                      value={form.daily_fee_type}
                      onValueChange={(v) =>
                        setForm({ ...form, daily_fee_type: v })
                      }
                    >
                      <SelectTrigger className="w-20 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">$</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="daily_fee_value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.daily_fee_value}
                      onChange={(e) =>
                        setForm({ ...form, daily_fee_value: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400">
                Review and record fees from Late pickup fees on the job board.
              </p>
            </>
          )}
        </div>
        <TemplateRatesSection />
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
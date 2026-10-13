import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ShopSettingsForm from '@/components/ShopSettingsForm';
import useLateFees from '@/hooks/useLateFees';
import { withShop } from '@/lib/shopScope';
import { Settings, AlertTriangle, Check, Clock } from 'lucide-react';

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

function feeSummary(settings) {
  if (!settings?.late_fee_enabled) return 'Not charging late pickup fees';
  const oneTime =
    settings.late_fee_type === 'percentage'
      ? `${Number(settings.late_fee_value) || 0}%`
      : money(settings.late_fee_value);
  const days = Number(settings.late_fee_days) || 30;
  const daily = settings.daily_fee_enabled
    ? ` + ${
        settings.daily_fee_type === 'percentage'
          ? `${Number(settings.daily_fee_value) || 0}%`
          : money(settings.daily_fee_value)
      }/day after`
    : '';
  return `${oneTime} at ${days} days${daily}`;
}

export default function LateFeePanel() {
  const { settings, units, loading, reload } = useLateFees(true);
  const [showSettings, setShowSettings] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [recorded, setRecorded] = useState(null);

  const apply = async (unit) => {
    setBusyId(unit.job.id);
    setRecorded(null);
    try {
      const expense = await base44.entities.JobExpense.create(
        withShop({
          job_id: unit.job.id,
          job_status: unit.job.status,
          description: `Late pickup fee — ${unit.daysLate} days ready`,
          amount: Number(unit.total.toFixed(2)),
          expense_date: new Date().toISOString().split('T')[0],
          billable: true,
          markup_percent: 0,
          reimbursed: false,
        })
      );

      const payload = withShop({
        job_id: unit.job.id,
        job_label: unit.job.ticket_number
          ? `Ticket #${unit.job.ticket_number}`
          : unit.job.customer_name,
        customer_name: unit.job.customer_name,
        ready_at: unit.job.pickup_ready_at,
        trigger_days: Number(settings?.late_fee_days) || 30,
        days_late: unit.daysLate,
        basis_amount: unit.basis,
        base_fee_amount: unit.baseFee,
        daily_fee_amount: unit.dailyFee,
        total_amount: unit.total,
        status: 'applied',
        applied_at: new Date().toISOString(),
        applied_expense_id: expense.id,
      });

      if (unit.applied) {
        await base44.entities.LateFee.update(unit.applied.id, payload);
      } else {
        await base44.entities.LateFee.create(payload);
      }

      setRecorded(unit.job.customer_name || 'Unit');
      await reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex max-h-[85dvh] flex-col bg-white">
      <div className="flex shrink-0 items-start gap-2 border-b border-slate-200 px-4 py-3 pr-12">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900">Late Pickup Fees</h2>
          <p className="text-xs text-slate-500">{feeSummary(settings)}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-3.5 h-3.5" /> Settings
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : !settings?.late_fee_enabled ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-sm text-slate-500">
              Turn on late pickup fees to start tracking units left in the shop
              past their pickup window.
            </p>
            <Button type="button" size="sm" onClick={() => setShowSettings(true)}>
              Set up late pickup fees
            </Button>
          </div>
        ) : units.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">
            No units are past the pickup window.
          </p>
        ) : (
          <div className="space-y-3">
            {recorded && (
              <p className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm font-medium text-green-700">
                <Check className="w-4 h-4" /> Fee recorded on {recorded}'s job
              </p>
            )}
            {units.map((unit) => (
              <div
                key={unit.job.id}
                className="rounded-xl border border-slate-200 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {unit.job.customer_name || 'Unnamed customer'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {unit.job.ticket_number
                        ? `Ticket #${unit.job.ticket_number} · `
                        : ''}
                      {unit.job.equipment_type || 'Unit'}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 shrink-0 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-600">
                    <Clock className="w-3 h-3" />
                    {unit.daysLate}d ready
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>
                      Late fee at {Number(settings.late_fee_days) || 30} days
                    </span>
                    <span className="font-medium text-slate-700">
                      {money(unit.baseFee)}
                    </span>
                  </div>
                  {unit.dailyFee > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Daily fee ({unit.dailyDays} days)</span>
                      <span className="font-medium text-slate-700">
                        {money(unit.dailyFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total due</span>
                    <span>{money(unit.total)}</span>
                  </div>
                </div>

                {unit.applied ? (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                    <Check className="w-3.5 h-3.5" /> Recorded on the job{' '}
                    {new Date(unit.applied.applied_at).toLocaleDateString()}
                  </p>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={busyId === unit.job.id}
                    onClick={() => apply(unit)}
                  >
                    {busyId === unit.job.id
                      ? 'Recording…'
                      : `Record ${money(unit.total)} on job`}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="p-0 border-0 max-w-md overflow-hidden rounded-xl">
          <DialogTitle className="sr-only">Late Pickup Fees</DialogTitle>
          <ShopSettingsForm
            onSaved={() => {
              setShowSettings(false);
              reload();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
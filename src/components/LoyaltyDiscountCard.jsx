import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Gift, Check, Undo2 } from 'lucide-react';
import { discountLabel, loyaltyAmount, ordinal } from '@/lib/loyalty';

// On the ticket itself, an administrator approves a milestone discount for
// this customer. Applying it writes the discount onto the ticket — so the
// totals, the estimate and the invoice all follow — and settles the reminder
// so it stops asking.
export default function LoyaltyDiscountCard({ job, subtotal, onChanged }) {
  const [reminders, setReminders] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const customerId = job?.customer_id;
  const applied = Number(job?.loyalty_discount_value) > 0;

  useEffect(() => {
    if (!customerId || applied) {
      setReminders([]);
      return;
    }
    base44.entities.LoyaltyReminder.filter(
      { customer_id: customerId, status: 'pending' },
      { sort: '-created_date', limit: 50 }
    )
      .then((page) => setReminders(page?.items || []))
      .catch(() => setReminders([]));
  }, [customerId, applied]);

  if (!job) return null;
  if (!applied && reminders.length === 0) return null;

  const apply = async (reminder) => {
    setBusy(true);
    setError('');
    try {
      await base44.entities.Job.update(job.id, {
        loyalty_discount_type: reminder.discount_type || 'percentage',
        loyalty_discount_value: Number(reminder.discount_value) || 0,
        loyalty_reminder_id: reminder.id,
      });
      await base44.entities.LoyaltyReminder.update(reminder.id, {
        status: 'applied',
        applied_job_id: job.id,
        applied_amount: loyaltyAmount(
          subtotal,
          reminder.discount_type,
          reminder.discount_value
        ),
        handled_at: new Date().toISOString(),
      });
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'That discount could not be applied.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      const reminderId = job.loyalty_reminder_id;
      await base44.entities.Job.update(job.id, {
        loyalty_discount_type: 'fixed',
        loyalty_discount_value: 0,
        loyalty_reminder_id: '',
      });
      if (reminderId) {
        await base44.entities.LoyaltyReminder.update(reminderId, {
          status: 'pending',
          applied_job_id: '',
          applied_amount: 0,
          handled_at: '',
        });
      }
      onChanged?.();
    } catch (err) {
      setError(err?.message || 'That discount could not be removed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-amber-50 rounded-xl border-2 border-amber-400 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="w-4 h-4 text-amber-600" />
        <h2 className="font-bold text-slate-900">Loyalty Milestone</h2>
        <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
          Admin only
        </span>
      </div>

      {applied ? (
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
            <Check className="w-4 h-4" />
            {discountLabel(job.loyalty_discount_type, job.loyalty_discount_value)}{' '}
            applied to this ticket
          </p>
          <button
            onClick={remove}
            disabled={busy}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50 shrink-0"
          >
            <Undo2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-lg bg-white border border-amber-200 px-3 py-2"
            >
              <p className="min-w-0 flex-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">
                  {ordinal(r.milestone_visit_count)} visit
                </span>{' '}
                · {discountLabel(r.discount_type, r.discount_value)}
              </p>
              <button
                onClick={() => apply(r)}
                disabled={busy}
                className="bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold active:bg-amber-600 disabled:opacity-50 shrink-0"
              >
                Apply to ticket
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Gift, X, ArrowRight } from 'lucide-react';
import { discountLabel, ordinal } from '@/lib/loyalty';

// The administrator's loyalty reminders, shown at the top of the job board.
// Each one is a customer who has reached a milestone; taking it opens that
// customer's ticket, where the discount is approved. Nobody else sees this.
export default function LoyaltyRemindersCard({ reminders, onChanged }) {
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  if (!reminders || reminders.length === 0) return null;

  const openTicket = async (reminder) => {
    setBusyId(reminder.id);
    setError('');
    try {
      const openPage = await base44.entities.Job.filter(
        { customer_id: reminder.customer_id, status: { $ne: 'Closed' } },
        { sort: '-created_date', limit: 1 }
      );
      let job = (openPage?.items || [])[0];
      if (!job) {
        const anyPage = await base44.entities.Job.filter(
          { customer_id: reminder.customer_id },
          { sort: '-created_date', limit: 1 }
        );
        job = (anyPage?.items || [])[0];
      }
      if (!job) {
        setError(`${reminder.customer_name} has no ticket to discount yet.`);
        return;
      }
      navigate(`/jobs/${job.id}`);
    } finally {
      setBusyId(null);
    }
  };

  const dismiss = async (reminder) => {
    setBusyId(reminder.id);
    await base44.entities.LoyaltyReminder.update(reminder.id, {
      status: 'dismissed',
      handled_at: new Date().toISOString(),
    });
    setBusyId(null);
    onChanged?.();
  };

  return (
    <div className="bg-white rounded-xl border-2 border-amber-400 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-4 h-4 text-amber-600" />
        <h2 className="text-sm font-bold text-slate-900">Loyalty Milestones</h2>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          Admin only
        </span>
      </div>
      <div className="space-y-2">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {r.customer_name}
              </p>
              <p className="text-xs text-slate-600">
                {ordinal(r.milestone_visit_count)} visit ·{' '}
                {discountLabel(r.discount_type, r.discount_value)}
              </p>
            </div>
            <button
              onClick={() => openTicket(r)}
              disabled={busyId === r.id}
              className="flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold active:bg-slate-700 disabled:opacity-50 shrink-0"
            >
              Apply <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => dismiss(r)}
              disabled={busyId === r.id}
              title="Dismiss this reminder"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-50 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
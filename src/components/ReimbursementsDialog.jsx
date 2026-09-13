import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet } from 'lucide-react';

export default function ReimbursementsDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const [expensesData, staffData] = await Promise.all([
          base44.entities.JobExpense.list('-expense_date', 500),
          base44.entities.Staff.list(),
        ]);
        const staff = Array.isArray(staffData) ? staffData : [];
        const outstanding = (Array.isArray(expensesData) ? expensesData : []).filter(
          (e) => !e.reimbursed
        );
        const byPerson = {};
        for (const e of outstanding) {
          const key = e.paid_by || 'Unassigned';
          (byPerson[key] = byPerson[key] || []).push(e);
        }
        setGroups(
          Object.entries(byPerson)
            .map(([name, items]) => ({
              name,
              known: staff.some((s) => s.name === name),
              items: items.sort(
                (a, b) =>
                  new Date(b.expense_date || b.created_date) -
                  new Date(a.expense_date || a.created_date)
              ),
              total: items.reduce((s, e) => s + (e.amount || 0), 0),
            }))
            .sort((a, b) => b.total - a.total)
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const markPaid = async (expenseId) => {
    await base44.entities.JobExpense.update(expenseId, { reimbursed: true });
    removeExpense(expenseId);
  };

  const markAllPaid = async (personName) => {
    const ids = groups
      .find((g) => g.name === personName)
      ?.items.map((e) => e.id) || [];
    if (ids.length === 0) return;
    await base44.entities.JobExpense.bulkUpdate(
      ids.map((id) => ({ id, reimbursed: true }))
    );
    setGroups((prev) => prev.filter((g) => g.name !== personName));
  };

  const removeExpense = (expenseId) => {
    setGroups((prev) =>
      prev
        .map((g) => {
          if (!g.items.some((e) => e.id === expenseId)) return g;
          const items = g.items.filter((e) => e.id !== expenseId);
          return { ...g, items, total: items.reduce((s, e) => s + (e.amount || 0), 0) };
        })
        .filter((g) => g.items.length > 0)
    );
  };

  const grandTotal = groups.reduce((s, g) => s + g.total, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 pb-2 border-b border-slate-100 space-y-0">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Wallet className="w-4 h-4" /> Reimbursements
          </DialogTitle>
          <p className="text-xs text-slate-400">
            Outstanding out-of-pocket expenses, by employee
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">
            Nothing outstanding — everyone is caught up.
          </p>
        ) : (
          <div className="p-4 pt-3 space-y-3">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-xs font-semibold text-amber-800 uppercase">
                Total Owed
              </span>
              <span className="text-lg font-bold text-amber-700">
                ${grandTotal.toFixed(2)}
              </span>
            </div>

            {groups.map((g) => (
              <div
                key={g.name}
                className="bg-white rounded-xl border border-slate-200 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {g.name}
                      {!g.known && (
                        <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-normal">
                          not in staff list
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {g.items.length} expense{g.items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-amber-600">
                      ${g.total.toFixed(2)}
                    </p>
                    <button
                      onClick={() => markAllPaid(g.name)}
                      className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg active:bg-green-100"
                    >
                      Mark All Paid
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  {g.items.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0"
                    >
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/jobs/${e.job_id}`);
                        }}
                      >
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {e.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {e.expense_date
                            ? new Date(e.expense_date).toLocaleDateString()
                            : ''}
                          {e.billable ? ' · Billable' : ' · Shop'}
                        </p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        ${(e.amount || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => markPaid(e.id)}
                        className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg shrink-0 active:bg-green-100"
                      >
                        Mark Paid
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
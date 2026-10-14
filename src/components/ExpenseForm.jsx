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
import { Checkbox } from '@/components/ui/checkbox';
import { withShop } from '@/lib/shopScope';
import { gated } from '@/lib/planApi';
import usePlanFeature from '@/hooks/usePlanFeature';

export default function ExpenseForm({
  jobId,
  jobStatus,
  expense,
  onClose,
  onSaved,
}) {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(
    expense?.amount !== undefined ? expense.amount : ''
  );
  const [expenseDate, setExpenseDate] = useState(
    expense?.expense_date || new Date().toISOString().slice(0, 10)
  );
  const [paidBy, setPaidBy] = useState(expense?.paid_by || '');
  const [billable, setBillable] = useState(
    expense?.billable !== undefined ? expense.billable : true
  );
  const [markupPercent, setMarkupPercent] = useState(
    expense?.markup_percent !== undefined ? expense.markup_percent : 0
  );
  const [saving, setSaving] = useState(false);
  // Out-of-pocket entries belong to the reimbursements tool, so a plan without
  // it logs a plain job expense: no "paid by" field and nothing owed back.
  const { locked: outOfPocketLocked } = usePlanFeature('reimbursements');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      job_id: jobId,
      job_status: jobStatus,
      description,
      amount: Number(amount) || 0,
      expense_date: expenseDate,
      ...(outOfPocketLocked ? {} : { paid_by: paidBy }),
      billable,
      markup_percent: Number(markupPercent) || 0,
      reimbursed: expense?.reimbursed || false,
    };
    if (expense?.id) {
      await gated.expenses.update(expense.id, payload);
    } else {
      await gated.expenses.create(withShop(payload));
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {expense
              ? 'Edit Expense'
              : outOfPocketLocked
                ? 'Log Job Expense'
                : 'Log Out-of-Pocket Expense'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 gallons of mix gas"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          {!outOfPocketLocked && (
            <div>
              <Label htmlFor="paidBy">Paid By (out of pocket)</Label>
              <Input
                id="paidBy"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                placeholder="Employee name"
              />
            </div>
          )}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="billable"
              checked={billable}
              onCheckedChange={(v) => setBillable(v === true)}
            />
            <Label htmlFor="billable" className="cursor-pointer">
              Bill to customer
            </Label>
          </div>
          {billable && (
            <div>
              <Label htmlFor="markup">Markup %</Label>
              <Input
                id="markup"
                type="number"
                step="1"
                min="0"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
              />
              {Number(amount) > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Customer billed: $
                  {(
                    (Number(amount) || 0) *
                    (1 + (Number(markupPercent) || 0) / 100)
                  ).toFixed(2)}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
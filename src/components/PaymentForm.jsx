import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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

export default function PaymentForm({
  jobId,
  jobStatus,
  payment,
  onClose,
  onSaved,
}) {
  const [amount, setAmount] = useState(
    payment?.amount !== undefined ? payment.amount : ''
  );
  const [paymentType, setPaymentType] = useState(
    payment?.payment_type || 'Deposit'
  );
  const [paymentDate, setPaymentDate] = useState(
    payment?.payment_date || new Date().toISOString().slice(0, 10)
  );
  const [method, setMethod] = useState(payment?.method || 'Cash');
  const [notes, setNotes] = useState(payment?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      job_id: jobId,
      job_status: jobStatus,
      amount: Number(amount) || 0,
      payment_type: paymentType,
      payment_date: paymentDate,
      method,
      notes,
    };
    if (payment?.id) {
      await base44.entities.Payment.update(payment.id, payload);
    } else {
      await base44.entities.Payment.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit Payment' : 'Log Payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
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
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option>Deposit</option>
              <option>Partial Payment</option>
              <option>Final Payment</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="method">Method</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option>Cash</option>
              <option>Card</option>
              <option>Check</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>
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
import React, { useState, useEffect } from 'react';
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

export default function SaleForm({ sale, onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(sale?.customer_id || '');
  const [itemDescription, setItemDescription] = useState(
    sale?.item_description || ''
  );
  const [totalPrice, setTotalPrice] = useState(
    sale?.total_price !== undefined ? sale.total_price : ''
  );
  const [amountPaid, setAmountPaid] = useState(
    sale?.amount_paid !== undefined ? sale.amount_paid : 0
  );
  const [saleDate, setSaleDate] = useState(
    sale?.sale_date || new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState(sale?.status || 'Open');
  const [notes, setNotes] = useState(sale?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Customer.list('-created_date', 200).then(setCustomers).catch(() => {});
  }, []);

  const totalNum = Number(totalPrice) || 0;
  const paidNum = Number(amountPaid) || 0;
  const balance = Math.max(totalNum - paidNum, 0);
  const autoPaid = totalNum > 0 && balance <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const cust = customers.find((c) => c.id === customerId);
    const payload = {
      customer_id: customerId || undefined,
      customer_name: customerId ? cust?.name || '' : 'Walk-in',
      item_description: itemDescription,
      total_price: totalNum,
      amount_paid: paidNum,
      sale_date: saleDate,
      status: autoPaid ? 'Paid' : status,
      notes,
    };
    if (sale?.id) {
      await base44.entities.Sale.update(sale.id, payload);
    } else {
      await base44.entities.Sale.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'New Sale'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="cust">Customer (optional)</Label>
            <select
              id="cust"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Walk-in / No customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="item">Item / Description</Label>
            <Input
              id="item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              required
              placeholder="e.g. Husqvarna chainsaw"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="total">Total Price</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="paid">Amount Paid</Label>
              <Input
                id="paid"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
          </div>
          {totalPrice !== '' && (
            <div className="flex justify-between text-sm bg-slate-50 rounded-md px-3 py-2">
              <span className="text-slate-500">Balance Due</span>
              <span
                className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                ${balance.toFixed(2)}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Sale Date</Label>
              <Input
                id="date"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={autoPaid ? 'Paid' : status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={autoPaid}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm disabled:opacity-60"
              >
                <option>Open</option>
                <option>Paid</option>
              </select>
            </div>
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
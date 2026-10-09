import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { gated } from '@/lib/planApi';
import { withShop, withShopAll } from '@/lib/shopScope';
import { getShopSettings } from '@/lib/shopSettings';
import CustomerPicker from '@/components/CustomerPicker';
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

// Records a counter sale for a shop-owned item: an individually tracked ShopUnit
// or a quantity of stock from a ShopItem. The sale goes through the normal sales
// workflow, then the source item is marked sold or its stock is deducted so the
// same thing can never be sold twice.
export default function RecordSaleDialog({ kind, item, onClose, onSaved }) {
  const isUnit = kind === 'unit';
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(
    isUnit ? item.price ?? '' : item.sale_price ?? ''
  );
  const [taxRate, setTaxRate] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Customer.list('-created_date', 200)
      .then((c) => setCustomers(Array.isArray(c) ? c : []))
      .catch(() => {});
    getShopSettings()
      .then((s) => setTaxRate(s.sales_tax_rate || 0))
      .catch(() => {});
  }, []);

  const description = isUnit
    ? [item.name, item.make, item.model].filter(Boolean).join(' · ')
    : item.name;

  const qty = isUnit ? 1 : Math.max(Number(quantity) || 1, 1);
  const price = Number(unitPrice) || 0;
  const unitCost = isUnit
    ? Number(item.cost) || 0
    : Number(item.unit_cost) || 0;
  const subtotal = qty * price;
  const tax = subtotal * ((Number(taxRate) || 0) / 100);
  const total = subtotal + tax;
  const paid = Number(amountPaid) || 0;
  const balance = Math.max(total - paid, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cust = customers.find((c) => c.id === customerId);
      const sale = await gated.sales.create(
        withShop({
          customer_id: customerId || undefined,
          customer_name: customerId ? cust?.name || '' : 'Walk-in',
          item_description: description,
          part_number: item.part_number || item.serial_number || '',
          unit_cost: unitCost * qty,
          subtotal,
          tax_rate: Number(taxRate) || 0,
          total_price: total,
          amount_paid: paid,
          sale_date: saleDate,
          status: total > 0 && paid >= total ? 'Paid' : 'Open',
        })
      );
      await gated.saleItems.bulkCreate(
        withShopAll([
          {
            sale_id: sale.id,
            description,
            part_number: item.part_number || '',
            quantity: qty,
            unit_price: price,
            unit_cost: unitCost,
            ...(isUnit ? {} : { shop_item_id: item.id }),
          },
        ])
      );
      if (isUnit) {
        await base44.entities.ShopUnit.update(item.id, {
          sold: true,
          for_sale: false,
          sale_id: sale.id,
          sold_date: saleDate,
        });
      } else {
        await gated.salesStock.update(item.id, {
          stock_quantity: Math.max((Number(item.stock_quantity) || 0) - qty, 0),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="font-semibold text-slate-900">{description}</p>
            {!isUnit && (
              <p className="text-xs text-slate-500">
                {Number(item.stock_quantity) || 0} in stock
              </p>
            )}
          </div>

          <div>
            <Label>Customer (optional)</Label>
            <CustomerPicker
              customers={customers}
              value={customerId}
              onChange={(c) => setCustomerId(c?.id || '')}
              emptyLabel="Walk-in / No customer"
              placeholder="Search by name or phone…"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Qty</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={isUnit ? 1 : quantity}
                disabled={isUnit}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount Paid</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
            <div>
              <Label>Sale Date</Label>
              <Input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                Tax ({Number(taxRate) || 0}%)
              </span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-slate-200 pt-1.5">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Balance Due</span>
              <span
                className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Record Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
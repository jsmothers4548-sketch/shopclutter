import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import VoiceIntake from '@/components/VoiceIntake';
import { getShopSettings } from '@/lib/shopSettings';
import SaleLineEditor from '@/components/SaleLineEditor';
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

export default function SaleForm({ sale, onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [customerId, setCustomerId] = useState(sale?.customer_id || '');
  const [lines, setLines] = useState([
    { description: '', part_number: '', quantity: 1, unit_price: '', unit_cost: '', shop_item_id: null },
  ]);
  const [existingLines, setExistingLines] = useState([]);
  const [taxRate, setTaxRate] = useState(
    sale?.tax_rate !== undefined && sale?.tax_rate !== null ? sale.tax_rate : null
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
    base44.entities.ShopItem.list('-created_date', 500).then(setShopItems).catch(() => {});
    getShopSettings()
      .then((s) => {
        if (!sale) setTaxRate((r) => (r === null ? s.sales_tax_rate : r));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sale?.id) return;
    base44.entities.SaleItem.filter({ sale_id: sale.id })
      .then((items) => {
        if (items.length) {
          setLines(
            items.map((i) => ({
              description: i.description,
              part_number: i.part_number || '',
              quantity: i.quantity ?? 1,
              unit_price: i.unit_price ?? '',
              unit_cost: i.unit_cost ?? '',
              shop_item_id: i.shop_item_id || null,
            }))
          );
          setExistingLines(items);
        } else if (sale.item_description) {
          setLines([
            {
              description: sale.item_description,
              part_number: sale.part_number || '',
              quantity: 1,
              unit_price: sale.total_price ?? '',
              unit_cost: sale.unit_cost ?? '',
              shop_item_id: null,
            },
          ]);
        }
      })
      .catch(() => {});
  }, [sale?.id]);

  const valid = lines.filter((l) => l.description && l.description.trim());
  const qty = (l) => Number(l.quantity) || 1;
  const subtotal = valid.reduce(
    (a, l) => a + qty(l) * (Number(l.unit_price) || 0),
    0
  );
  const tax = subtotal * ((Number(taxRate) || 0) / 100);
  const total = subtotal + tax;
  const paid = Number(amountPaid) || 0;
  const balance = Math.max(total - paid, 0);
  const cost = valid.reduce(
    (a, l) => a + qty(l) * (Number(l.unit_cost) || 0),
    0
  );
  const profit = subtotal - cost;
  const autoPaid = total > 0 && paid >= total;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid.length) return;
    setSaving(true);
    const cust = customers.find((c) => c.id === customerId);
    const summary =
      valid.length > 1
        ? `${valid[0].description.trim()} +${valid.length - 1} more`
        : valid[0].description.trim();
    const payload = {
      customer_id: customerId || undefined,
      customer_name: customerId ? cust?.name || '' : 'Walk-in',
      item_description: summary,
      part_number: valid[0].part_number || '',
      unit_cost: cost,
      subtotal,
      tax_rate: Number(taxRate) || 0,
      total_price: total,
      amount_paid: paid,
      sale_date: saleDate,
      status: autoPaid ? 'Paid' : status,
      notes,
    };
    let saleId = sale?.id;
    if (saleId) {
      await base44.entities.Sale.update(saleId, payload);
    } else {
      saleId = (await base44.entities.Sale.create(payload)).id;
    }

    // Net stock change per inventory item: restore old lines, deduct new ones
    const net = {};
    for (const old of existingLines) {
      if (old.shop_item_id)
        net[old.shop_item_id] = (net[old.shop_item_id] || 0) + (old.quantity || 1);
    }
    for (const l of valid) {
      if (l.shop_item_id)
        net[l.shop_item_id] = (net[l.shop_item_id] || 0) - qty(l);
    }
    for (const [itemId, delta] of Object.entries(net)) {
      if (!delta) continue;
      const item = shopItems.find((s) => s.id === itemId);
      if (!item) continue;
      await base44.entities.ShopItem.update(itemId, {
        stock_quantity: (item.stock_quantity || 0) + delta,
      });
    }

    // Replace line items
    if (sale?.id) {
      await base44.entities.SaleItem.deleteMany({ sale_id: sale.id });
    }
    await base44.entities.SaleItem.bulkCreate(
      valid.map((l) => ({
        sale_id: saleId,
        description: l.description.trim(),
        part_number: l.part_number || '',
        quantity: qty(l),
        unit_price: Number(l.unit_price) || 0,
        unit_cost: Number(l.unit_cost) || 0,
        ...(l.shop_item_id ? { shop_item_id: l.shop_item_id } : {}),
      }))
    );
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'New Sale'}</DialogTitle>
        </DialogHeader>
        <VoiceIntake
          formType="sale"
          onExtracted={(d) => {
            if (d.customer_name) {
              const match = customers.find(
                (c) =>
                  c.name?.toLowerCase().trim() ===
                  String(d.customer_name).toLowerCase().trim()
              );
              if (match) setCustomerId(match.id);
            }
            if (d.item_description) {
              const line = {
                description: String(d.item_description),
                part_number: d.part_number || '',
                quantity: 1,
                unit_price: d.total_price !== undefined ? Number(d.total_price) : '',
                unit_cost: '',
                shop_item_id: null,
              };
              setLines((prev) => {
                const idx = prev.findIndex((l) => !l.description?.trim());
                if (idx >= 0) {
                  const cp = [...prev];
                  cp[idx] = { ...cp[idx], ...line };
                  return cp;
                }
                return [...prev, line];
              });
            }
            if (d.amount_paid) setAmountPaid(d.amount_paid);
            if (d.sale_date) setSaleDate(d.sale_date);
            if (d.notes) setNotes(d.notes);
          }}
        />
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="cust">Customer (optional)</Label>
            <CustomerPicker
              customers={customers}
              value={customerId}
              onChange={(c) => setCustomerId(c?.id || '')}
              emptyLabel="Walk-in / No customer"
              placeholder="Search by name or phone…"
            />
          </div>

          <SaleLineEditor lines={lines} shopItems={shopItems} onChange={setLines} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tax">Tax Rate (%)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={taxRate ?? ''}
                onChange={(e) => setTaxRate(e.target.value)}
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
            <div className="flex justify-between">
              <span className="text-slate-500">Profit</span>
              <span
                className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                ${profit.toFixed(2)}
              </span>
            </div>
          </div>

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
              autoCapitalize="sentences"
              placeholder="Optional"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !valid.length}>
              {saving ? 'Saving…' : 'Save Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
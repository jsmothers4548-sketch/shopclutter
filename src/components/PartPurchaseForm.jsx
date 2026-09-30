import React, { useEffect, useState } from 'react';
import { gated } from '@/lib/planApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { withShop } from '@/lib/shopScope';

const sentenceCase = (v) => v.trim().replace(/^./, (c) => c.toUpperCase());
const today = () => new Date().toISOString().slice(0, 10);

export default function PartPurchaseForm({
  open,
  onClose,
  partName,
  partNumber,
  onSaved,
}) {
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSupplier('');
      setQuantity('1');
      setUnitCost('');
      setPurchaseDate(today());
      setError('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!supplier.trim()) {
      setError('Supplier is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const rec = await gated.partPurchases.create(
        withShop({
          part_name: partName,
          part_number: partNumber || '',
          supplier: sentenceCase(supplier),
          quantity: Number(quantity) || 0,
          unit_cost: Number(unitCost) || 0,
          purchase_date: purchaseDate,
        })
      );
      onSaved?.(rec);
      onClose();
    } catch (e) {
      setError(e.message || 'Could not save the purchase');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Purchase</DialogTitle>
          <DialogDescription>
            {partName}
            {partNumber ? ` · ${partNumber}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="purchase-supplier">Supplier</Label>
            <Input
              id="purchase-supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier name"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchase-qty">Quantity</Label>
              <Input
                id="purchase-qty"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchase-cost">Unit Cost</Label>
              <Input
                id="purchase-cost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchase-date">Purchase Date</Label>
            <Input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Purchase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
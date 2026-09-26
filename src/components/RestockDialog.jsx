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
import { base44 } from '@/api/base44Client';
import UpgradePrompt from '@/components/UpgradePrompt';
import usePlanFeature from '@/hooks/usePlanFeature';

export default function RestockDialog({ item, onClose, onSaved }) {
  const { locked } = usePlanFeature('supplier_orders');
  const [addQty, setAddQty] = useState('');
  const [saving, setSaving] = useState(false);

  if (locked) {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogTitle className="sr-only">Restocking</DialogTitle>
          <UpgradePrompt feature="supplier_orders" />
        </DialogContent>
      </Dialog>
    );
  }

  const addAmount = parseInt(addQty) || 0;
  const currentStock = Number(item.stock_quantity) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.ShopItem.update(item.id, {
        stock_quantity: currentStock + addAmount,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-sm text-slate-500">
            Current stock: <span className="font-bold text-slate-900">{currentStock}</span>
          </div>
          <div>
            <Label>Add Quantity</Label>
            <Input
              type="number"
              min="1"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              required
              autoFocus
              placeholder="10"
            />
          </div>
          <div className="text-sm text-slate-500">
            New total: <span className="font-bold text-slate-900">{currentStock + addAmount}</span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || addAmount < 1}>
              {saving ? 'Saving...' : 'Restock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
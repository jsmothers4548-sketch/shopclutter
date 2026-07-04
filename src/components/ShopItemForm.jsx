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

const CATEGORIES = ['Spark Plugs', 'Filters', 'Oil & Fluids', 'Belts', 'Blades', 'Hardware', 'Other'];

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm';

export default function ShopItemForm({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    part_number: item?.part_number || '',
    category: item?.category || 'Other',
    supplier: item?.supplier || '',
    stock_quantity: item?.stock_quantity ?? 0,
    unit_cost: item?.unit_cost ?? 0,
    reorder_threshold: item?.reorder_threshold ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (item) {
        await base44.entities.ShopItem.update(item.id, form);
      } else {
        await base44.entities.ShopItem.create(form);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Item Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="NGK Spark Plug"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Part Number</Label>
              <Input
                value={form.part_number}
                onChange={(e) => setForm({ ...form, part_number: e.target.value })}
                placeholder="BPR6ES"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Supplier</Label>
            <Input
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              placeholder="NAPA Auto Parts"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Stock Qty</Label>
              <Input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Unit Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Reorder At</Label>
              <Input
                type="number"
                min="0"
                value={form.reorder_threshold}
                onChange={(e) => setForm({ ...form, reorder_threshold: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
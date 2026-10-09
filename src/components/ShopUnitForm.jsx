import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { withShop } from '@/lib/shopScope';
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
import { Switch } from '@/components/ui/switch';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm';

export default function ShopUnitForm({ unit, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: unit?.name || '',
    make: unit?.make || '',
    model: unit?.model || '',
    serial_number: unit?.serial_number || '',
    condition: unit?.condition || 'Used',
    cost: unit?.cost ?? '',
    price: unit?.price ?? '',
    for_sale: unit?.for_sale ?? true,
    notes: unit?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      cost: Number(form.cost) || 0,
      price: Number(form.price) || 0,
    };
    try {
      if (unit) {
        await base44.entities.ShopUnit.update(unit.id, payload);
      } else {
        await base44.entities.ShopUnit.create(withShop(payload));
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
          <DialogTitle>{unit ? 'Edit Shop Unit' : 'Add Shop Unit'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Equipment *</Label>
            <Input
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              autoCapitalize="sentences"
              placeholder="e.g. Push mower, chainsaw, generator"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Make</Label>
              <Input
                value={form.make}
                onChange={(e) => set({ make: e.target.value })}
                placeholder="Craftsman"
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={form.model}
                onChange={(e) => set({ model: e.target.value })}
                placeholder="22in"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Serial Number</Label>
              <Input
                value={form.serial_number}
                onChange={(e) => set({ serial_number: e.target.value })}
                autoCapitalize="none"
              />
            </div>
            <div>
              <Label>Condition</Label>
              <select
                value={form.condition}
                onChange={(e) => set({ condition: e.target.value })}
                className={selectClass}
              >
                <option>New</option>
                <option>Used</option>
                <option>Refurbished</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Your Cost ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => set({ cost: e.target.value })}
                placeholder="What you paid"
              />
            </div>
            <div>
              <Label>Asking Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set({ price: e.target.value })}
                placeholder="Sale price"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-900">Available for sale</p>
              <p className="text-xs text-slate-500">
                Show this unit in the For Sale list
              </p>
            </div>
            <Switch
              checked={form.for_sale}
              onCheckedChange={(v) => set({ for_sale: v })}
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              autoCapitalize="sentences"
              placeholder="Optional"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
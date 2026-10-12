import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, MessageSquare, Mail, ArrowLeft } from 'lucide-react';
import UpgradePrompt from '@/components/UpgradePrompt';
import usePlanFeature from '@/hooks/usePlanFeature';
import useVisibleBrand from '@/hooks/useVisibleBrand';

export default function SupplierOrderDialog({ items, onClose }) {
  const { locked: supplierOrderLocked } = usePlanFeature('supplier_orders');
  const brand = useVisibleBrand();
  const lowStock = useMemo(
    () =>
      items.filter(
        (i) =>
          (Number(i.reorder_threshold) || 0) > 0 &&
          (Number(i.stock_quantity) || 0) <= (Number(i.reorder_threshold) || 0)
      ),
    [items]
  );

  const suppliers = useMemo(
    () =>
      [...new Set(lowStock.map((i) => i.supplier || 'No supplier'))].sort(),
    [lowStock]
  );

  const [supplier, setSupplier] = useState(suppliers[0] || '');
  const [step, setStep] = useState('build');
  const [qtys, setQtys] = useState({});
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (supplierOrderLocked) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle className="sr-only">Supplier orders</DialogTitle>
          <UpgradePrompt feature="supplier_orders" />
        </DialogContent>
      </Dialog>
    );
  }

  const groupItems = lowStock.filter(
    (i) => (i.supplier || 'No supplier') === supplier
  );

  const suggested = (item) =>
    Math.max(
      (Number(item.reorder_threshold) || 1) * 2 -
        (Number(item.stock_quantity) || 0),
      1
    );

  const qtyFor = (item) => Number(qtys[item.id]) || suggested(item);

  const buildMessage = () => {
    const lines = groupItems
      .map(
        (i) =>
          `${i.name}${i.part_number ? ` (#${i.part_number})` : ''} — ${qtyFor(
            i
          )} @ $${(Number(i.unit_cost) || 0).toFixed(2)}`
      )
      .join('\n');
    const total = groupItems.reduce(
      (sum, i) => sum + qtyFor(i) * (Number(i.unit_cost) || 0),
      0
    );
    return `Hi${
      supplier && supplier !== 'No supplier' ? ` ${supplier}` : ''
    }, we'd like to order:\n\n${lines}\n\nEstimated total: $${total.toFixed(
      2
    )}\n\nThanks!\n${brand.name}`;
  };

  const sendText = () => {
    window.location.href = `sms:${phone}?&body=${encodeURIComponent(message)}`;
  };

  const sendEmail = () => {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      'Restock order'
    )}&body=${encodeURIComponent(message)}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'preview' && (
              <button
                onClick={() => setStep('build')}
                className="p-1 rounded hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            Supplier Restock Order
          </DialogTitle>
        </DialogHeader>

        {lowStock.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No items are at or below their reorder threshold.
          </p>
        ) : step === 'build' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {suppliers.map((s) => (
                <button
                  key={s}
                  onClick={() => setSupplier(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    s === supplier
                      ? 'bg-amber-500 text-slate-900 border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {groupItems.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {i.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {i.stock_quantity} in stock · threshold{' '}
                      {i.reorder_threshold}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    className="w-20"
                    value={qtys[i.id] ?? suggested(i)}
                    onChange={(e) =>
                      setQtys({ ...qtys, [i.id]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                setMessage(buildMessage());
                setStep('preview');
              }}
              className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600"
            >
              <Truck className="w-4 h-4" /> Preview Order
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Order details (editable)</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Supplier phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label>Supplier email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="orders@supplier.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={sendText}
                disabled={!phone}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageSquare className="w-4 h-4" /> Send Text
              </Button>
              <Button onClick={sendEmail} disabled={!email} variant="outline">
                <Mail className="w-4 h-4" /> Send Email
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
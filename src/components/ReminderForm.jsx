import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { MapPin } from 'lucide-react';

const APPOINTMENT_TYPES = ['General', 'On-site', 'Off-site'];
const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm';

export default function ReminderForm({ reminder, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    due_date: reminder?.due_date || '',
    appointment_type: reminder?.appointment_type || 'General',
    status: reminder?.status || 'pending',
    customer_id: reminder?.customer_id || '',
    customer_name: reminder?.customer_name || '',
    customer_address: reminder?.customer_address || '',
  });
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Customer.list('name', 200).then(setCustomers).catch(() => {});
  }, []);

  const handleCustomerChange = (e) => {
    const customer = customers.find((c) => c.id === e.target.value);
    if (customer) {
      setForm({
        ...form,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_address: customer.address || '',
      });
    } else {
      setForm({ ...form, customer_id: '', customer_name: '', customer_address: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (reminder) {
        await base44.entities.Reminder.update(reminder.id, form);
      } else {
        await base44.entities.Reminder.create(form);
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
          <DialogTitle>{reminder ? 'Edit Reminder' : 'New Reminder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Order oil filters"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Details about this reminder..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.appointment_type}
                onChange={(e) => setForm({ ...form, appointment_type: e.target.value })}
                className={selectClass}
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Link to Customer (optional)</Label>
            <select
              value={form.customer_id}
              onChange={handleCustomerChange}
              className={selectClass}
            >
              <option value="">— General Shop Reminder —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
              ))}
            </select>
          </div>
          {form.customer_id && form.customer_address && (
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{form.customer_address}</span>
            </div>
          )}
          {reminder && (
            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={selectClass}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
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
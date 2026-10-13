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
import CustomerPicker from '@/components/CustomerPicker';
import { MapPin } from 'lucide-react';
import { withShop } from '@/lib/shopScope';

const APPOINTMENT_TYPES = ['General', 'On-site', 'Off-site'];
const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm';

const today = () => new Date().toISOString().split('T')[0];

// Schedule or edit an appointment. Everything except the title and date is
// optional, so a quick booking and a fully detailed one both work.
export default function AppointmentForm({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: appointment?.title || '',
    appointment_type: appointment?.appointment_type || 'General',
    appointment_date: appointment?.appointment_date || today(),
    start_time: appointment?.start_time || '',
    end_time: appointment?.end_time || '',
    customer_id: appointment?.customer_id || '',
    customer_name: appointment?.customer_name || '',
    customer_phone: appointment?.customer_phone || '',
    customer_address: appointment?.customer_address || '',
    notes: appointment?.notes || '',
    status: appointment?.status || 'scheduled',
  });
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Customer.list('name', 200).then(setCustomers).catch(() => {});
  }, []);

  const handleCustomerChange = (c) => {
    if (c) {
      setForm((prev) => ({
        ...prev,
        customer_id: c.id,
        customer_name: c.name || '',
        customer_phone: c.phone || '',
        customer_address: c.address || '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        customer_id: '',
        customer_name: '',
        customer_phone: '',
        customer_address: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (appointment) {
        await base44.entities.Appointment.update(appointment.id, form);
      } else {
        await base44.entities.Appointment.create(withShop(form));
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoCapitalize="sentences"
              required
              placeholder="Pick up mower for service"
            />
          </div>
          <div>
            <Label>Type</Label>
            <select
              value={form.appointment_type}
              onChange={(e) =>
                setForm({ ...form, appointment_type: e.target.value })
              }
              className={selectClass}
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              value={form.appointment_date}
              onChange={(e) =>
                setForm({ ...form, appointment_date: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Customer (optional)</Label>
            <CustomerPicker
              customers={customers}
              value={form.customer_id}
              onChange={handleCustomerChange}
              emptyLabel="— No customer —"
              placeholder="Search by name or phone…"
            />
          </div>
          {form.customer_id && (
            <div className="space-y-2 rounded-lg bg-slate-50 p-3">
              <div>
                <Label>Contact Number</Label>
                <Input
                  value={form.customer_phone}
                  onChange={(e) =>
                    setForm({ ...form, customer_phone: e.target.value })
                  }
                  placeholder="(555) 555-5555"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={form.customer_address}
                  onChange={(e) =>
                    setForm({ ...form, customer_address: e.target.value })
                  }
                  autoCapitalize="words"
                  placeholder="Street, city"
                />
              </div>
              {form.customer_address && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{form.customer_address}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              autoCapitalize="sentences"
              rows={3}
              placeholder="What to bring, who to ask for, anything else..."
            />
          </div>
          {appointment && (
            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={selectClass}
              >
                <option value="scheduled">Scheduled</option>
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
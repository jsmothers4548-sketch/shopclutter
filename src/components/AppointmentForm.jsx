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
import { Bell, MapPin } from 'lucide-react';
import { withShop } from '@/lib/shopScope';
import { formatTime } from '@/lib/appointmentTime';

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
  const [makeReminder, setMakeReminder] = useState(!!appointment?.reminder_id);
  const [reminderDate, setReminderDate] = useState(
    appointment?.appointment_date || ''
  );
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Customer.list('name', 200).then(setCustomers).catch(() => {});
    // Editing an appointment that already has a reminder: start from the date
    // that reminder is set for.
    if (appointment?.reminder_id) {
      base44.entities.Reminder.get(appointment.reminder_id)
        .then((r) => {
          if (r?.due_date) setReminderDate(r.due_date);
        })
        .catch(() => {});
    }
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

  // The reminder carries the appointment's details into the signed-in user's
  // own list, where it shows up on the day it's set for.
  const buildReminder = () => {
    const when = [
      form.appointment_date,
      form.start_time ? `at ${formatTime(form.start_time)}` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return withShop({
      title: `Appointment: ${form.title}`,
      description: [
        `${form.appointment_type} — ${when}`,
        form.customer_name
          ? `With ${form.customer_name}${
              form.customer_address ? `, ${form.customer_address}` : ''
            }`
          : '',
        form.notes,
      ]
        .filter(Boolean)
        .join('\n'),
      due_date: reminderDate || form.appointment_date,
      appointment_type: form.appointment_type,
      priority: 'high',
      status: 'pending',
      customer_id: form.customer_id,
      customer_name: form.customer_name,
      customer_address: form.customer_address,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Reminders are private to whoever made them, so a reminder set by
      // someone else is left untouched if the sync below can't reach it.
      let reminderId = appointment?.reminder_id || '';
      try {
        if (makeReminder) {
          const payload = buildReminder();
          if (reminderId) {
            await base44.entities.Reminder.update(reminderId, payload);
          } else {
            const created = await base44.entities.Reminder.create(payload);
            reminderId = created?.id || '';
          }
        } else if (reminderId) {
          await base44.entities.Reminder.delete(reminderId);
          reminderId = '';
        }
      } catch (err) {
        reminderId = appointment?.reminder_id || '';
      }

      const payload = { ...form, reminder_id: reminderId };
      if (appointment) {
        await base44.entities.Appointment.update(appointment.id, payload);
      } else {
        await base44.entities.Appointment.create(withShop(payload));
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
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <label className="flex items-start gap-2 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={makeReminder}
                onChange={(e) => {
                  setMakeReminder(e.target.checked);
                  if (e.target.checked && !reminderDate) {
                    setReminderDate(form.appointment_date || today());
                  }
                }}
                className="mt-0.5 w-4 h-4 accent-amber-500"
              />
              <span>
                <span className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-600" /> Remind me
                </span>
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Puts this appointment in My Reminders so it's on your list the
                  day it's set for.
                </span>
              </span>
            </label>
            {makeReminder && (
              <div>
                <Label>Remind on</Label>
                <Input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </div>
            )}
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
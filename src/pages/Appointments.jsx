import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, CalendarDays } from 'lucide-react';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentCard from '@/components/AppointmentCard';

const today = () => new Date().toISOString().split('T')[0];

// Appointments for the whole shop: on-site, off-site, and general business
// bookings, kept in one list of what's coming up and what's done.
export default function Appointments() {
  const [tab, setTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editAppointment, setEditAppointment] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const day = today();
      const query =
        tab === 'upcoming'
          ? { appointment_date: { $gte: day }, status: { $ne: 'completed' } }
          : { $or: [{ appointment_date: { $lt: day } }, { status: 'completed' }] };
      const page = await base44.entities.Appointment.filter(query, {
        sort: tab === 'upcoming' ? 'appointment_date' : '-appointment_date',
        limit: 100,
      });
      // Same-day appointments read in time order.
      const items = [...(page?.items || [])].sort((a, b) => {
        const left = `${a.appointment_date} ${a.start_time || ''}`;
        const right = `${b.appointment_date} ${b.start_time || ''}`;
        return tab === 'upcoming'
          ? left.localeCompare(right)
          : right.localeCompare(left);
      });
      setAppointments(items);
    } catch (err) {
      setError(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleComplete = async (appointment) => {
    const next =
      appointment.status === 'completed' ? 'scheduled' : 'completed';
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointment.id ? { ...a, status: next } : a))
    );
    try {
      await base44.entities.Appointment.update(appointment.id, {
        status: next,
      });
      load();
    } catch (err) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, status: appointment.status } : a
        )
      );
      window.alert('Failed to update appointment');
    }
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm(`Delete "${appointment.title}"?`)) return;
    setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
    try {
      await base44.entities.Appointment.delete(appointment.id);
    } catch (err) {
      window.alert('Failed to delete appointment');
      load();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-xs text-slate-400">
            On-site, off-site, and general bookings
          </p>
        </div>
        <button
          onClick={() => {
            setEditAppointment(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-slate-500">Couldn't load appointments.</p>
          <button
            onClick={() => load()}
            className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            Try again
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            {tab === 'upcoming'
              ? 'Nothing scheduled yet'
              : 'No past appointments'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onEdit={(item) => {
                setEditAppointment(item);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onToggleComplete={toggleComplete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AppointmentForm
          appointment={editAppointment}
          onClose={() => {
            setShowForm(false);
            setEditAppointment(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditAppointment(null);
            load();
          }}
        />
      )}
    </div>
  );
}
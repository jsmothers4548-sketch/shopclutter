import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import StaffForm from '@/components/StaffForm';
import ShopSettingsForm from '@/components/ShopSettingsForm';
import ReimbursementsDialog from '@/components/ReimbursementsDialog';
import { Plus, Edit, Trash2, Clock, BarChart3, Wallet } from 'lucide-react';

export default function Staff() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [labor, setLabor] = useState([]);
  const [timeClocks, setTimeClocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showReimbursements, setShowReimbursements] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [staffData, laborData, clockData] = await Promise.all([
        base44.entities.Staff.list('-created_date'),
        base44.entities.LaborEntry.list(),
        base44.entities.TimeClock.list('-timestamp', 50),
      ]);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setLabor(Array.isArray(laborData) ? laborData : []);
      setTimeClocks(Array.isArray(clockData) ? clockData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    return { start: monday, end: nextMonday };
  }, []);

  const weeklyHoursByTech = useMemo(() => {
    const map = {};
    for (const l of labor) {
      const tech = l.technician || '';
      if (!tech) continue;
      const created = new Date(l.created_date);
      if (created >= weekRange.start && created < weekRange.end) {
        map[tech] = (map[tech] || 0) + (l.hours || 0);
      }
    }
    return map;
  }, [labor, weekRange]);

  const deleteStaff = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    await base44.entities.Staff.delete(id);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Staff Directory</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg font-semibold text-sm active:bg-slate-700"
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
          <button
            onClick={() => setShowReimbursements(true)}
            className="flex items-center gap-1.5 bg-white border border-amber-300 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-50"
          >
            <Wallet className="w-4 h-4" /> Reimbursements
          </button>
          <button
            onClick={() => {
              setEditingStaff(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <ShopSettingsForm />

      {staff.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">No staff members yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => {
            const weekHours = weeklyHoursByTech[s.name] || 0;
            const weekPay = weekHours * (s.pay_rate || 0);
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 truncate">
                        {s.name}
                      </p>
                      {s.employee_id && (
                        <span className="text-xs font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          ID: {s.employee_id}
                        </span>
                      )}
                      {s.status === 'inactive' && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {s.role_title && (
                      <p className="text-sm text-slate-500">{s.role_title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingStaff(s);
                        setShowForm(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStaff(s.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {(s.phone || s.email) && (
                  <div className="text-xs text-slate-500 space-y-0.5">
                    {s.phone && <p>{s.phone}</p>}
                    {s.email && <p>{s.email}</p>}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  <span className="text-xs text-slate-400">Wage</span>
                  <span className="text-sm font-semibold">
                    ${(s.pay_rate || 0).toFixed(2)}/hr
                  </span>
                  {s.hire_date && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400">
                        Hired{' '}
                        {new Date(s.hire_date).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      This Week
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {weekHours.toFixed(1)} hrs
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ${weekPay.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Time Clock Logs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-bold text-slate-900 mb-3">Time Clock Logs</h2>
        {timeClocks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No clock entries yet
          </p>
        ) : (
          <div className="space-y-1">
            {timeClocks.slice(0, 20).map((tc) => {
              const staffMatch = staff.find(
                (s) => s.employee_id === tc.employee_id
              );
              return (
                <div
                  key={tc.id}
                  className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {staffMatch?.name || `ID: ${tc.employee_id}`}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(tc.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      tc.action === 'clock_in'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tc.action === 'clock_in' ? 'In' : 'Out'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      <ReimbursementsDialog
        open={showReimbursements}
        onOpenChange={setShowReimbursements}
      />
    </div>
  );
}
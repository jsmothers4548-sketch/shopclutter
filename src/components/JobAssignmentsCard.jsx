import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { withShop } from '@/lib/shopScope';
import { useAuth } from '@/lib/AuthContext';
import { UserPlus, X, Users } from 'lucide-react';

// Who is working on this job. An admin picks one or several technicians; a
// technician sees the same list read-only.
export default function JobAssignmentsCard({ jobId }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const page = await base44.entities.JobAssignment.filter(
      { job_id: jobId },
      { sort: 'created_date', limit: 100 }
    );
    setAssignments(Array.isArray(page) ? page : page?.items || []);
    if (isAdmin) {
      const staffPage = await base44.entities.Staff.filter(
        { status: 'active' },
        { sort: 'name', limit: 200 }
      ).catch(() => []);
      setStaff(Array.isArray(staffPage) ? staffPage : staffPage?.items || []);
    }
  };

  useEffect(() => {
    load();
  }, [jobId, isAdmin]);

  const assignedIds = new Set(assignments.map((a) => a.staff_id));
  const available = staff.filter((s) => !assignedIds.has(s.id));

  const assign = async (member) => {
    setSaving(true);
    try {
      await base44.entities.JobAssignment.create(
        withShop({
          job_id: jobId,
          staff_id: member.id,
          staff_name: member.name,
          staff_email: member.email || '',
          assigned_by: user?.full_name || '',
        })
      );
      await load();
    } finally {
      setSaving(false);
    }
  };

  const unassign = async (assignment) => {
    setSaving(true);
    try {
      await base44.entities.JobAssignment.delete(assignment.id);
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-600" /> Assigned Techs
        </h2>
        {isAdmin && (
          <button
            onClick={() => setPicking((v) => !v)}
            className="flex items-center gap-1 text-amber-600 text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" /> Assign
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-slate-400">
          {isAdmin ? 'No one assigned yet' : 'No one assigned yet'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {assignments.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium px-2.5 py-1 rounded-full"
            >
              {a.staff_name}
              {isAdmin && (
                <button
                  onClick={() => unassign(a)}
                  disabled={saving}
                  className="text-amber-500 hover:text-red-600 disabled:opacity-50"
                  aria-label={`Remove ${a.staff_name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {isAdmin && picking && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          {available.length === 0 ? (
            <p className="text-sm text-slate-400">
              {staff.length === 0
                ? 'Add employees in the Staff Directory first'
                : 'Everyone is already assigned'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {available.map((s) => (
                <button
                  key={s.id}
                  onClick={() => assign(s)}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-2.5 py-1 rounded-full active:bg-slate-50 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
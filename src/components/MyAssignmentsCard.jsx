import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

// The signed-in technician's own jobs, listed near the top of the board so they
// can jump straight into work assigned to them.
export default function MyAssignmentsCard({ staffName, jobs }) {
  const [open, setOpen] = useState(true);

  if (!jobs.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-3 text-left active:bg-slate-50"
      >
        <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 truncate">
            {staffName ? `${staffName}'s Assignments` : 'My Assignments'}
          </p>
          <p className="text-xs text-slate-500">
            {jobs.length} job{jobs.length === 1 ? '' : 's'} assigned to you
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {job.customer_name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {job.ticket_number ? `${job.ticket_number} · ` : ''}
                  {job.equipment_type}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
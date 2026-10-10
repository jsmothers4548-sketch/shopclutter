import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UserCheck, ChevronDown } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

// The signed-in user's own assigned jobs, sitting beside the status filter.
// Shows "None" when nothing is assigned to them.
export default function MyAssignmentsCard({ jobs }) {
  const [open, setOpen] = useState(false);
  const count = jobs.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">
          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
          My Assignments
          <span className="text-slate-500 font-medium">·</span>
          <span className={count ? 'text-amber-600' : 'text-slate-400'}>
            {count ? `${count} job${count === 1 ? '' : 's'}` : 'None'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-1" align="center">
        {count === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500 text-center">
            No jobs assigned to you.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-slate-100"
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
      </PopoverContent>
    </Popover>
  );
}
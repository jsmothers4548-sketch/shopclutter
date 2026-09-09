import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';

const ORDER = [
  'All',
  'Intake',
  'Diagnosed',
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
  'Closed',
];

const DOT = {
  All: 'bg-slate-800',
  Intake: 'bg-slate-400',
  Diagnosed: 'bg-indigo-500',
  'Estimate Sent': 'bg-purple-500',
  Approved: 'bg-cyan-500',
  'In Progress': 'bg-blue-500',
  'Waiting on Parts': 'bg-amber-500',
  'Ready for Pickup': 'bg-green-500',
  Closed: 'bg-slate-600',
};

export default function JobStatusDropdown({ jobs, filter, setFilter }) {
  const [open, setOpen] = useState(false);
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const counts = { All: safeJobs.length };
  for (const j of safeJobs) {
    counts[j.status] = (counts[j.status] || 0) + 1;
  }

  return (
    <div className="flex justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">
            Job Statuses
            <span className="text-slate-500 font-medium">·</span>
            <span className="text-amber-600">{filter}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-1" align="center">
          {ORDER.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT[s]}`} />
              <span className="flex-1 text-left">{s}</span>
              <span className="text-xs font-bold text-slate-400">
                {counts[s] || 0}
              </span>
              {filter === s && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
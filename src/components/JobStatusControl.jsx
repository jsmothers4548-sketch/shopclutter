import React from 'react';
import StatusBadge from '@/components/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';

export const JOB_STATUSES = [
  'Intake',
  'Diagnosed',
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
  'Closed',
];

export default function JobStatusControl({ status, disabled, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <StatusBadge status={status} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            disabled={disabled}
            className="flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg text-sm font-bold active:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change Status
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Set job status to
          </DropdownMenuLabel>
          {JOB_STATUSES.map((s) => (
            <DropdownMenuItem
              key={s}
              onSelect={() => s !== status && onChange(s)}
              className="justify-between gap-2 py-2"
            >
              <StatusBadge status={s} />
              {s === status && <Check className="w-4 h-4 text-amber-500" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
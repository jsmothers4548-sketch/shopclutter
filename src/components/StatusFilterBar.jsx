import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';

const PRIMARY_FILTERS = ['Active', 'Intake', 'Diagnosed'];
const SECONDARY_FILTERS = [
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
  'Closed',
  'All',
];

export default function StatusFilterBar({ filter, setFilter }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      {PRIMARY_FILTERS.map((s) => (
        <button
          key={s}
          onClick={() => setFilter(s)}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === s
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          {s}
        </button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              SECONDARY_FILTERS.includes(filter)
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {SECONDARY_FILTERS.includes(filter) ? filter : 'More'}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          {SECONDARY_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
            >
              {s}
              {filter === s && <Check className="w-4 h-4 text-amber-500" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
import React from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const PERIODS = [
  ['full', 'Full Year'],
  ['q1', 'Q1 (Jan–Mar)'],
  ['q2', 'Q2 (Apr–Jun)'],
  ['q3', 'Q3 (Jul–Sep)'],
  ['q4', 'Q4 (Oct–Dec)'],
  ['custom', 'Custom Range'],
];

export default function EarningsPeriodControls({
  periodKey,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomChange,
  query,
  onQueryChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Select value={periodKey} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {periodKey === 'custom' && (
        <>
          <Input
            type="date"
            value={customStart}
            onChange={(e) => onCustomChange('start', e.target.value)}
            className="w-[150px] bg-white"
          />
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomChange('end', e.target.value)}
            className="w-[150px] bg-white"
          />
        </>
      )}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search entries, customers, tickets…"
          className="pl-8 bg-white"
        />
      </div>
    </div>
  );
}
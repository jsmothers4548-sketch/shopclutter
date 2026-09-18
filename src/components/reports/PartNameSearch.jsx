import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PartNameSearch({
  value,
  onChange,
  placeholder = 'Search parts by name or number…',
}) {
  return (
    <div className="relative mb-3 print:hidden">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-9 bg-slate-50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
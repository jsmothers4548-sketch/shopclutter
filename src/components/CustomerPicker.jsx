import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const digits = (s) => (s || '').replace(/\D/g, '');

// Searchable customer picker — matches any part of the name (case-insensitive)
// or the phone number, so partial or last-name searches work.
export default function CustomerPicker({
  customers,
  value,
  onChange,
  emptyLabel,
  placeholder = 'Search by name or phone…',
  autoFocus,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = customers.find((c) => c.id === value) || null;

  const q = query.trim().toLowerCase();
  const dq = digits(query.trim());

  const suggestions = useMemo(() => {
    let list = customers;
    if (q) {
      list = customers.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (dq.length > 0 && digits(c.phone).includes(dq)) ||
          (c.email || '').toLowerCase().includes(q)
      );
    }
    return list.slice(0, 8);
  }, [customers, q, dq]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (c) => {
    onChange(c || null);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {selected && !open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setQuery('');
          }}
          className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm hover:bg-slate-50"
        >
          <span className="min-w-0 truncate">
            <span className="font-medium text-slate-900">{selected.name}</span>
            {selected.phone ? (
              <span className="text-slate-400"> — {selected.phone}</span>
            ) : null}
          </span>
          {emptyLabel ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                pick(null);
              }}
              className="shrink-0 p-1 -m-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </span>
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>
      ) : (
        <>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
                if (e.key === 'Enter' && suggestions.length > 0) {
                  e.preventDefault();
                  pick(suggestions[0]);
                }
              }}
              placeholder={placeholder}
              autoFocus={autoFocus}
              autoComplete="off"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {open && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
              {emptyLabel && (
                <button
                  type="button"
                  onClick={() => pick(null)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 border-b border-slate-100"
                >
                  {emptyLabel}
                </button>
              )}
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c)}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 border-b border-slate-100 last:border-0"
                >
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {c.name}
                  </p>
                  {c.phone && (
                    <p className="text-xs text-slate-400 truncate">{c.phone}</p>
                  )}
                </button>
              ))}
              {suggestions.length === 0 && (
                <p className="px-3 py-2 text-sm text-slate-400">
                  No customers match
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
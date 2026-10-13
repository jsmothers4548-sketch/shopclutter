import React, { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import useLateFees from '@/hooks/useLateFees';
import LateFeeDialog from '@/components/latefees/LateFeeDialog';

// The admin's at-a-glance entry point, sitting at the top of the job board.
export default function OverdueUnitsCard({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const { settings, units, loading } = useLateFees(!!isAdmin);

  if (!isAdmin || loading) return null;

  const count = units.length;
  const on = !!settings?.late_fee_enabled;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left shadow-sm active:bg-slate-50 ${
          count > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-slate-200'
        }`}
      >
        <AlertTriangle
          className={`w-4 h-4 shrink-0 ${
            count > 0 ? 'text-red-500' : 'text-slate-400'
          }`}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-bold ${
              count > 0 ? 'text-red-700' : 'text-slate-700'
            }`}
          >
            Late pickup fees
          </span>
          <span className="block text-xs text-slate-500">
            {!on
              ? 'Set up fees for units left past pickup'
              : count === 0
              ? 'No units past the pickup window'
              : `${count} unit${count === 1 ? '' : 's'} past the pickup window`}
          </span>
        </span>
        {count > 0 && (
          <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            {count}
          </span>
        )}
        <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
      </button>

      <LateFeeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
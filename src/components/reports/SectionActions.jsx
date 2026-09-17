import React from 'react';
import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';

// Compact per-section controls: print just this section, or open its
// dedicated full-page statement.
export default function SectionActions({ onPrint, fullPageTo }) {
  if (!onPrint && !fullPageTo) return null;
  return (
    <div className="flex items-center gap-1.5 print:hidden">
      {onPrint && (
        <button
          onClick={onPrint}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 active:bg-slate-300"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      )}
      {fullPageTo && (
        <Link
          to={fullPageTo}
          className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 active:bg-slate-300"
        >
          Full page
        </Link>
      )}
    </div>
  );
}
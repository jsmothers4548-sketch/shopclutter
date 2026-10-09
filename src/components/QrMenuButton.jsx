import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { QrCode, ScanLine, Printer } from 'lucide-react';

// Job Board QR action: opens a small menu to either scan an existing unit's
// code or print a fresh code for a new intake.
export default function QrMenuButton({ onScan, onPrint }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 bg-slate-900 text-white px-3 py-2 rounded-lg font-semibold text-sm active:bg-slate-700">
          <QrCode className="w-4 h-4" /> QR Code
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onScan} className="gap-2 cursor-pointer">
          <ScanLine className="w-4 h-4" /> Scan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint} className="gap-2 cursor-pointer">
          <Printer className="w-4 h-4" /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
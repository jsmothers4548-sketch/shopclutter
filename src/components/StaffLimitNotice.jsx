import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Shown on the staff screens while the shop is on Solo, the one-person plan.
export default function StaffLimitNotice() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Lock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900">Solo is a one-person plan</p>
          <p className="text-sm text-slate-500">
            Staff members and staff logins are added on Pro and up. Anyone
            already on your staff list stays exactly as they are.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="w-full">
        <Link to="/billing">Upgrade your plan</Link>
      </Button>
    </div>
  );
}
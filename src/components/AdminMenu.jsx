import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import ReimbursementsDialog from '@/components/ReimbursementsDialog';
import ShopSettingsForm from '@/components/ShopSettingsForm';
import BrandingForm from '@/components/BrandingForm';
import useShop from '@/hooks/useShop';
import { getPlan, hasFeature } from '@/lib/plans';
import { ShieldCheck, UserCog, BarChart3, Wallet, Percent, Palette, CreditCard, KeyRound, Lock, ListChecks } from 'lucide-react';

const itemClass =
  'flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700';

export default function AdminMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showReimbursements, setShowReimbursements] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const { shop } = useShop();
  const plan = getPlan(shop?.plan_id);
  const brandingLocked = !hasFeature(plan, 'branding');
  const reportsLocked = !hasFeature(plan, 'reports');
  const reimbursementsLocked = !hasFeature(plan, 'reimbursements');

  const isActive =
    pathname.startsWith('/staff') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/roadmap') ||
    pathname.startsWith('/billing');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-amber-500 text-slate-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className={itemClass}
            onClick={() => navigate('/staff')}
          >
            <UserCog className="w-4 h-4" /> Staff Directory
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() => navigate(reportsLocked ? '/billing' : '/reports')}
          >
            <BarChart3 className="w-4 h-4" /> Reports
            {reportsLocked && (
              <Lock className="w-3.5 h-3.5 ml-auto text-slate-400" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() =>
              reimbursementsLocked
                ? navigate('/billing')
                : setShowReimbursements(true)
            }
          >
            <Wallet className="w-4 h-4" /> Reimbursements
            {reimbursementsLocked && (
              <Lock className="w-3.5 h-3.5 ml-auto text-slate-400" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() => setShowRates(true)}
          >
            <Percent className="w-4 h-4" /> Default Rates
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() =>
              brandingLocked ? navigate('/billing') : setShowBranding(true)
            }
          >
            <Palette className="w-4 h-4" /> Branding
            {brandingLocked && (
              <Lock className="w-3.5 h-3.5 ml-auto text-slate-400" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() => navigate('/billing')}
          >
            <CreditCard className="w-4 h-4" /> Plan &amp; Billing
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() => navigate('/roadmap')}
          >
            <ListChecks className="w-4 h-4" /> Roadmap
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onClick={() => navigate('/beta-access')}
          >
            <KeyRound className="w-4 h-4" /> Beta access
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReimbursementsDialog
        open={showReimbursements}
        onOpenChange={setShowReimbursements}
      />

      <Dialog open={showRates} onOpenChange={setShowRates}>
        <DialogContent className="p-0 border-0 max-w-md overflow-hidden rounded-xl">
          <DialogTitle className="sr-only">Default Rates</DialogTitle>
          <ShopSettingsForm />
        </DialogContent>
      </Dialog>

      <Dialog open={showBranding} onOpenChange={setShowBranding}>
        <DialogContent className="p-0 border-0 max-w-md overflow-hidden rounded-xl">
          <DialogTitle className="sr-only">Branding</DialogTitle>
          <BrandingForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
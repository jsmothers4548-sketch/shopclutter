import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { FEATURES, planNameForFeature } from '@/lib/plans';

// The shared locked-tool card. Shown in place of a tool the plan doesn't include.
export default function UpgradePrompt({ feature, title, description }) {
  const meta = FEATURES[feature];
  const heading = title || `${meta?.label || 'This tool'} is a paid feature`;
  const planName = planNameForFeature(feature);

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <Lock className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="font-bold text-slate-900">{heading}</h2>
        <p className="text-sm text-slate-500">
          {description || meta?.blurb} Available on {planName} and up.
        </p>
        <Button asChild className="w-full">
          <Link to="/billing">Upgrade your plan</Link>
        </Button>
      </div>
    </div>
  );
}
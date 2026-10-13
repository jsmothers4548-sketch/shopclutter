import React from 'react';
import { MapPin } from 'lucide-react';
import DirectionsButton from '@/components/DirectionsButton';

// Off-site jobs only: the address saved at intake, with a button that hands it
// to the phone's map app as the destination.
export default function JobLocationCard({ job, customer }) {
  if (job?.job_location !== 'Off-site') return null;
  const address = job.offsite_address?.trim() || customer?.address?.trim();
  if (!address) return null;
  const fromCustomer = !job.offsite_address?.trim();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Off-site address
          </p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{address}</p>
          {fromCustomer && (
            <p className="text-xs text-slate-400 mt-0.5">Customer's address</p>
          )}
        </div>
      </div>
      <DirectionsButton address={address} />
    </div>
  );
}
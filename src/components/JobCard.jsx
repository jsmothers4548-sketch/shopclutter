import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import { Clock } from 'lucide-react';

const EQUIPMENT_ICONS = {
  'Lawn Mower': '🌿',
  'Motorcycle/ATV': '🏍️',
  'Generator': '⚡',
  'Compressor': '💨',
  'Chainsaw': '🪚',
  'Weed Eater': '🌾',
  'Other': '🔧'
};

export default function JobCard({ job, totalCost }) {
  const navigate = useNavigate();
  const daysInShop = Math.floor(
    (Date.now() - new Date(job.created_date).getTime()) / 86400000
  );
  const icon = EQUIPMENT_ICONS[job.equipment_type] || '🔧';

  return (
    <button
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 active:bg-slate-50 transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900 truncate">{job.customer_name}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
            <span>{icon}</span>
            <span className="truncate">
              {job.equipment_type}
              {job.make ? ` · ${job.make}` : ''}
              {job.model ? ` ${job.model}` : ''}
            </span>
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {daysInShop === 0 ? 'Today' : `${daysInShop}d in shop`}
        </span>
        {totalCost > 0 && (
          <span className="text-sm font-bold text-slate-900">
            ${totalCost.toFixed(2)}
          </span>
        )}
      </div>
    </button>
  );
}
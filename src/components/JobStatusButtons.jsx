import React from 'react';

const STATUS_CONFIG = {
  All: {
    active: 'bg-slate-900 text-white border-slate-900',
    inactive: 'bg-white text-slate-600 border-slate-200',
    badgeActive: 'bg-white text-slate-900',
    badgeInactive: 'bg-slate-200 text-slate-700',
  },
  Intake: {
    active: 'bg-slate-600 text-white border-slate-700',
    inactive: 'bg-slate-100 text-slate-700 border-slate-300',
    badgeActive: 'bg-white text-slate-700',
    badgeInactive: 'bg-slate-200 text-slate-600',
  },
  Diagnosed: {
    active: 'bg-indigo-600 text-white border-indigo-700',
    inactive: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    badgeActive: 'bg-white text-indigo-700',
    badgeInactive: 'bg-indigo-200 text-indigo-700',
  },
  'Estimate Sent': {
    active: 'bg-purple-600 text-white border-purple-700',
    inactive: 'bg-purple-100 text-purple-700 border-purple-300',
    badgeActive: 'bg-white text-purple-700',
    badgeInactive: 'bg-purple-200 text-purple-700',
  },
  Approved: {
    active: 'bg-cyan-600 text-white border-cyan-700',
    inactive: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    badgeActive: 'bg-white text-cyan-700',
    badgeInactive: 'bg-cyan-200 text-cyan-700',
  },
  'In Progress': {
    active: 'bg-blue-600 text-white border-blue-700',
    inactive: 'bg-blue-100 text-blue-700 border-blue-300',
    badgeActive: 'bg-white text-blue-700',
    badgeInactive: 'bg-blue-200 text-blue-700',
  },
  'Waiting on Parts': {
    active: 'bg-amber-500 text-white border-amber-600',
    inactive: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeActive: 'bg-white text-amber-800',
    badgeInactive: 'bg-amber-200 text-amber-800',
  },
  'Ready for Pickup': {
    active: 'bg-green-600 text-white border-green-700',
    inactive: 'bg-green-100 text-green-700 border-green-300',
    badgeActive: 'bg-white text-green-700',
    badgeInactive: 'bg-green-200 text-green-700',
  },
  Closed: {
    active: 'bg-slate-800 text-white border-slate-900',
    inactive: 'bg-slate-100 text-slate-700 border-slate-300',
    badgeActive: 'bg-white text-slate-800',
    badgeInactive: 'bg-slate-200 text-slate-600',
  },
};

const ORDER = [
  'All',
  'Intake',
  'Diagnosed',
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
  'Closed',
];

export default function JobStatusButtons({ jobs, filter, setFilter }) {
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const counts = { All: safeJobs.length };
  for (const j of safeJobs) {
    counts[j.status] = (counts[j.status] || 0) + 1;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 justify-items-center">
      {ORDER.map((status) => {
        const cfg = STATUS_CONFIG[status];
        const isActive = filter === status;
        const count = counts[status] || 0;
        return (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              isActive ? cfg.active : cfg.inactive
            }`}
          >
            {status}
            <span
              className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isActive ? cfg.badgeActive : cfg.badgeInactive
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
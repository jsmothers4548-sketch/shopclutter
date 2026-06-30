import React from 'react';

const STATUS_STYLES = {
  'Intake': 'bg-slate-100 text-slate-700 border-slate-300',
  'Diagnosed': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'Estimate Sent': 'bg-purple-100 text-purple-700 border-purple-300',
  'Approved': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-300',
  'Waiting on Parts': 'bg-amber-100 text-amber-800 border-amber-300',
  'Ready for Pickup': 'bg-green-100 text-green-700 border-green-300',
  'Closed': 'bg-slate-800 text-white border-slate-900'
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Intake'];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}
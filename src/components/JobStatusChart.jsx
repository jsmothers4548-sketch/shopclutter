import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';

const STATUSES = [
  'Intake',
  'Diagnosed',
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
  'Closed',
];

const STATUS_COLORS = {
  Intake: '#3b82f6',
  Diagnosed: '#8b5cf6',
  'Estimate Sent': '#f59e0b',
  Approved: '#10b981',
  'In Progress': '#06b6d4',
  'Waiting on Parts': '#ef4444',
  'Ready for Pickup': '#ec4899',
  Closed: '#64748b',
};

export default function JobStatusChart({ jobs }) {
  const data = STATUSES.map((status) => ({
    name: status,
    count: jobs.filter((j) => j.status === status).length,
  })).filter((d) => d.count > 0);

  if (data.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <h2 className="text-sm font-bold text-slate-700 mb-2">
        Jobs by Status
      </h2>
      <ResponsiveContainer width="100%" height={data.length * 36 + 8} debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              padding: '4px 8px',
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, i) => (
              <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { computeJobProfit } from '@/lib/billing';
import { Printer } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const [jobsData, partsData, laborData] = await Promise.all([
          base44.entities.Job.list('-created_date', 500),
          base44.entities.Part.list(),
          base44.entities.LaborEntry.list(),
        ]);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setParts(Array.isArray(partsData) ? partsData : []);
        setLabor(Array.isArray(laborData) ? laborData : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const years = useMemo(() => {
    const set = new Set(
      jobs.map((j) => new Date(j.created_date).getFullYear())
    );
    set.add(currentYear);
    return [...set].sort((a, b) => b - a);
  }, [jobs, currentYear]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (new Date(j.created_date).getFullYear() !== year) return false;
      if (statusFilter === 'closed' && j.status !== 'Closed') return false;
      return true;
    });
  }, [jobs, year, statusFilter]);

  const filteredJobIds = useMemo(
    () => new Set(filteredJobs.map((j) => j.id)),
    [filteredJobs]
  );

  const jobProfits = useMemo(() => {
    return filteredJobs.map((job) => {
      const jobParts = parts.filter((p) => p.job_id === job.id);
      const jobLabor = labor.filter((l) => l.job_id === job.id);
      return {
        job,
        ...computeJobProfit({ parts: jobParts, labor: jobLabor, job }),
      };
    });
  }, [filteredJobs, parts, labor]);

  const totals = useMemo(() => {
    let revenue = 0,
      partsCost = 0,
      laborCost = 0,
      taxCollected = 0;
    for (const jp of jobProfits) {
      revenue += jp.revenue;
      partsCost += jp.partsCost;
      laborCost += jp.laborCost;
      taxCollected += jp.taxAmount;
    }
    return {
      revenue,
      partsCost,
      laborCost,
      taxCollected,
      profit: revenue - partsCost - laborCost,
    };
  }, [jobProfits]);

  const employeeStats = useMemo(() => {
    const map = {};
    for (const l of labor) {
      if (!filteredJobIds.has(l.job_id)) continue;
      const tech = l.technician || 'Unassigned';
      if (!map[tech])
        map[tech] = { hours: 0, earned: 0, charged: 0, jobIds: new Set() };
      map[tech].hours += l.hours || 0;
      map[tech].earned += (l.hours || 0) * (l.pay_rate || 0);
      map[tech].charged += (l.hours || 0) * (l.hourly_rate || 0);
      map[tech].jobIds.add(l.job_id);
    }
    return Object.entries(map)
      .map(([name, stats]) => ({
        name,
        hours: stats.hours,
        earned: stats.earned,
        charged: stats.charged,
        jobCount: stats.jobIds.size,
      }))
      .sort((a, b) => b.earned - a.earned);
  }, [labor, filteredJobIds]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-2 print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 flex-1">
          Financial Reports
        </h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold active:bg-slate-800"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 print:hidden">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Jobs</option>
          <option value="closed">Closed Only</option>
        </select>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Shop Flow — Financial Report {year}</h1>
        <p className="text-sm text-slate-500">
          Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* P&L Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <h2 className="font-bold text-slate-900">Profit &amp; Loss — {year}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium">Gross Revenue</p>
            <p className="text-xl font-bold text-green-700">
              ${totals.revenue.toFixed(2)}
            </p>
          </div>
          <div
            className={`rounded-lg p-3 ${
              totals.profit >= 0 ? 'bg-blue-50' : 'bg-red-50'
            }`}
          >
            <p
              className={`text-xs font-medium ${
                totals.profit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              Net Profit
            </p>
            <p
              className={`text-xl font-bold ${
                totals.profit >= 0 ? 'text-blue-700' : 'text-red-700'
              }`}
            >
              ${totals.profit.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Parts Cost</span>
            <span className="font-medium">
              −${totals.partsCost.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Labor Cost (wages)</span>
            <span className="font-medium">
              −${totals.laborCost.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tax Collected</span>
            <span className="font-medium">
              ${totals.taxCollected.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total Billed to Customers</span>
            <span className="font-medium">
              ${(totals.revenue + totals.taxCollected).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Employee Earnings */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-bold text-slate-900 mb-3">
          Employee Earnings — {year}
        </h2>
        {employeeStats.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No labor data for this period
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                <th className="pb-2">Technician</th>
                <th className="pb-2 text-center">Jobs</th>
                <th className="pb-2 text-center">Hours</th>
                <th className="pb-2 text-right">Charged</th>
                <th className="pb-2 text-right">Earned</th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.map((emp) => (
                <tr key={emp.name} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-slate-900">
                    {emp.name}
                  </td>
                  <td className="py-2 text-center">{emp.jobCount}</td>
                  <td className="py-2 text-center">{emp.hours.toFixed(1)}</td>
                  <td className="py-2 text-right">
                    ${emp.charged.toFixed(2)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    ${emp.earned.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Job Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-bold text-slate-900 mb-3">
          Job Breakdown — {year}
        </h2>
        {jobProfits.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No jobs in this period
          </p>
        ) : (
          <div className="space-y-2">
            {jobProfits.map((jp) => (
              <div
                key={jp.job.id}
                className="flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {jp.job.customer_name || '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {jp.job.equipment_type} ·{' '}
                    {new Date(jp.job.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">
                    ${jp.revenue.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      jp.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {jp.profit >= 0 ? '+' : ''}
                    ${jp.profit.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
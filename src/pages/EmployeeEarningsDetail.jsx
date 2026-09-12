import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Printer, User } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export default function EmployeeEarningsDetail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = params.get('name') || 'Unassigned';
  const year = Number(params.get('year')) || new Date().getFullYear();

  const [data, setData] = useState(null);
  const [staffId, setStaffId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      const [laborData, jobsData, staffData] = await Promise.all([
        base44.entities.LaborEntry.list('-created_date', 2000),
        base44.entities.Job.list('-created_date', 500),
        base44.entities.Staff.list('-created_date'),
      ]);
      const labor = (Array.isArray(laborData) ? laborData : []).filter(
        (l) => (l.technician || 'Unassigned') === name
      );
      const rec = (Array.isArray(staffData) ? staffData : []).find(
        (s) =>
          (s.name || '').trim().toLowerCase() === name.trim().toLowerCase()
      );
      setStaffId(rec ? rec.id : null);
      setData({
        labor,
        jobs: Array.isArray(jobsData) ? jobsData : [],
      });
    })();
  }, [name]);

  const jobById = useMemo(
    () => Object.fromEntries(data?.jobs.map((j) => [j.id, j]) || []),
    [data]
  );

  const rows = useMemo(() => {
    if (!data) return [];
    return data.labor
      .map((l) => {
        const job = jobById[l.job_id];
        if (!job || new Date(job.created_date).getFullYear() !== year)
          return null;
        const hours = Number(l.hours) || 0;
        return {
          id: l.id,
          job,
          description: l.description,
          hours,
          charged: hours * (Number(l.hourly_rate) || 0),
          earned: hours * (Number(l.pay_rate) || 0),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => new Date(b.job.created_date) - new Date(a.job.created_date)
      );
  }, [data, jobById, year]);

  const totals = useMemo(
    () => ({
      jobs: new Set(rows.map((r) => r.job.id)).size,
      hours: rows.reduce((a, r) => a + r.hours, 0),
      charged: rows.reduce((a, r) => a + r.charged, 0),
      earned: rows.reduce((a, r) => a + r.earned, 0),
    }),
    [rows]
  );

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  const summary = [
    { label: 'Jobs', value: String(totals.jobs), tone: 'text-slate-900' },
    {
      label: 'Hours',
      value: totals.hours.toFixed(1),
      tone: 'text-slate-900',
    },
    {
      label: 'Charged',
      value: formatCurrency(totals.charged),
      tone: 'text-slate-900',
    },
    {
      label: 'Earned',
      value: formatCurrency(totals.earned),
      tone: 'text-green-600',
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Screen header */}
      <div className="flex items-center gap-2 flex-wrap print:hidden">
        <button onClick={() => navigate('/reports')} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">
            {name}
          </h1>
          <p className="text-xs text-slate-400">Earnings — {year}</p>
        </div>
        {staffId && (
          <button
            onClick={() => navigate(`/staff/${staffId}`)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold active:bg-slate-50"
          >
            <User className="w-4 h-4" /> Staff Profile
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold active:bg-slate-800"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* Print cover header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3">
        <p className="text-xs uppercase tracking-widest text-slate-600">
          ShopFlow Small Engine Repair
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Employee Earnings — {name}
        </h1>
        <p className="text-sm text-slate-600">Fiscal Year {year}</p>
        <p className="text-xs text-slate-400 mt-1">
          Prepared {new Date().toLocaleDateString()} · Confidential — For
          Owner Use Only
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {summary.map((it) => (
          <div
            key={it.label}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {it.label}
            </p>
            <p
              className={`text-lg md:text-xl font-bold mt-1 tabular-nums ${it.tone}`}
            >
              {it.value}
            </p>
          </div>
        ))}
      </div>

      {/* Labor entries */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
        <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm mb-3">
          Labor Entries — {year}
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No labor entries for {name} in {year}
          </p>
        ) : (
          <div className="space-y-1">
            {rows.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/jobs/${r.job.id}`)}
                className="w-full flex items-center justify-between gap-2 py-2 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {r.description || 'Labor'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {r.job.ticket_number ? `Ticket #${r.job.ticket_number} · ` : ''}
                    {r.job.customer_name || '—'} · {r.job.equipment_type} ·{' '}
                    {new Date(r.job.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(r.charged)}
                  </p>
                  <p className="text-xs text-slate-400 tabular-nums">
                    {r.hours} hrs · earned {formatCurrency(r.earned)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
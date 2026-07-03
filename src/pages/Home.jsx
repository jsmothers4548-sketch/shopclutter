import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import JobCard from '@/components/JobCard';
import JobQuickAdd from '@/components/JobQuickAdd';
import StatusFilterBar from '@/components/StatusFilterBar';
import JobStatusChart from '@/components/JobStatusChart';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

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
const ACTIVE_STATUSES = [
  'Intake',
  'Diagnosed',
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Active');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, partsData, laborData] = await Promise.all([
        base44.entities.Job.list('-created_date', 200),
        base44.entities.Part.list(),
        base44.entities.LaborEntry.list(),
      ]);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setParts(Array.isArray(partsData) ? partsData : []);
      setLabor(Array.isArray(laborData) ? laborData : []);
    } catch (err) {
      setError(err);
      setJobs([]);
      setParts([]);
      setLabor([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const costByJob = useMemo(() => {
    const map = {};
    const safeParts = Array.isArray(parts) ? parts : [];
    const safeLabor = Array.isArray(labor) ? labor : [];
    for (let i = 0; i < safeParts.length; i++) {
      const p = safeParts[i];
      const qty = Number(p.quantity) || 0;
      const cost = Number(p.unit_cost) || 0;
      map[p.job_id] = (map[p.job_id] || 0) + qty * cost;
    }
    for (let i = 0; i < safeLabor.length; i++) {
      const l = safeLabor[i];
      const hrs = Number(l.hours) || 0;
      const rate = Number(l.hourly_rate) || 0;
      map[l.job_id] = (map[l.job_id] || 0) + hrs * rate;
    }
    return map;
  }, [parts, labor]);

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const filteredJobs =
    filter === 'Active'
      ? safeJobs.filter((j) => ACTIVE_STATUSES.includes(j.status))
      : filter === 'All'
      ? safeJobs
      : safeJobs.filter((j) => j.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-slate-500">Couldn't load jobs.</p>
          <button
            onClick={() => loadData()}
            className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Job Board</h1>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>
      <JobStatusChart jobs={safeJobs} />
      <StatusFilterBar filter={filter} setFilter={setFilter} />
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">No jobs in this view</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} totalCost={costByJob[job.id] || 0} />
          ))}
        </div>
      )}
      {showQuickAdd && (
        <JobQuickAdd
          onClose={() => setShowQuickAdd(false)}
          onSaved={(job) => {
            setShowQuickAdd(false);
            navigate(`/jobs/${job.id}`);
          }}
        />
      )}
    </div>
  );
}
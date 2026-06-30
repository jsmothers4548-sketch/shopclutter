import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import JobCard from '@/components/JobCard';
import JobQuickAdd from '@/components/JobQuickAdd';
import StatusFilterBar from '@/components/StatusFilterBar';
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
  const [filter, setFilter] = useState('Active');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, partsData, laborData] = await Promise.all([
        base44.entities.Job.list('-created_date', 200),
        base44.entities.Part.list(),
        base44.entities.LaborEntry.list(),
      ]);
      setJobs(jobsData);
      setParts(partsData);
      setLabor(laborData);
    } finally {
      setLoading(false);
    }
  };

  const getJobCost = (jobId) => {
    const partsTotal = parts
      .filter((p) => p.job_id === jobId)
      .reduce((s, p) => s + p.quantity * p.unit_cost, 0);
    const laborTotal = labor
      .filter((l) => l.job_id === jobId)
      .reduce((s, l) => s + l.hours * l.hourly_rate, 0);
    return partsTotal + laborTotal;
  };

  const filteredJobs =
    filter === 'Active'
      ? jobs.filter((j) => ACTIVE_STATUSES.includes(j.status))
      : filter === 'All'
      ? jobs
      : jobs.filter((j) => j.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
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
      <StatusFilterBar filter={filter} setFilter={setFilter} />
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">No jobs in this view</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} totalCost={getJobCost(job.id)} />
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
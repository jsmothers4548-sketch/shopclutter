import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import JobCard from '@/components/JobCard';
import JobQuickAdd from '@/components/JobQuickAdd';
import JobStatusDropdown from '@/components/JobStatusDropdown';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Bell, Calendar, MapPin, ScanLine, Search } from 'lucide-react';
import QrScanner from '@/components/QrScanner';
import { normalizeTicketInput } from '@/lib/ticketNumbers';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, partsData, laborData, remindersData] = await Promise.all([
      base44.entities.Job.list('-created_date', 200),
      base44.entities.Part.list(),
      base44.entities.LaborEntry.list(),
      base44.entities.Reminder.list('due_date', 200)]
      );
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setParts(Array.isArray(partsData) ? partsData : []);
      setLabor(Array.isArray(laborData) ? laborData : []);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
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

  const todayStr = new Date().toISOString().split('T')[0];
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const dueToday = safeReminders.filter(
    (r) => r.status === 'pending' && r.due_date <= todayStr
  );
  const todaysSchedule = safeReminders.
  filter((r) => r.status === 'pending' && r.due_date === todayStr).
  sort((a, b) => (a.appointment_type || '').localeCompare(b.appointment_type || ''));

  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const handleScanResult = async (text) => {
    setShowScanner(false);
    const raw = text.trim();
    const candidates = [raw];
    const digits = (raw.match(/\d+/) || [])[0];
    if (digits) candidates.push(digits);
    for (const c of candidates) {
      const res = await base44.entities.Equipment.filter({
        label_number: c,
      });
      const units = Array.isArray(res) ? res : res?.items || [];
      if (units.length) {
        const unit = units[0];
        const unitJobs = await base44.entities.Job.filter(
          { unit_id: unit.id, status: { $ne: 'Closed' } },
          { sort: '-created_date', limit: 1 }
        );
        const openJob = (Array.isArray(unitJobs) ? unitJobs : unitJobs?.items || [])[0];
        navigate(openJob ? `/jobs/${openJob.id}` : `/units/${unit.id}`);
        return;
      }
    }
    const ticket = normalizeTicketInput(raw);
    if (ticket) {
      const jobs = await base44.entities.Job.filter({ ticket_number: ticket });
      if (Array.isArray(jobs) && jobs.length) {
        navigate(`/jobs/${jobs[0].id}`);
        return;
      }
    }
    window.alert(
      `No unit or ticket found for "${raw}". Enter the unit label at job intake first, or find it on the Units page.`
    );
  };

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (j) => {
    if (!searchLower) return true;
    return [
      j.ticket_number,
      j.customer_name,
      j.equipment_type,
      j.make,
      j.model,
      j.serial_number,
      j.problem_description,
    ].some((v) => (v || '').toLowerCase().includes(searchLower));
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const ticket = normalizeTicketInput(search);
    if (!ticket) return;
    const jobs = await base44.entities.Job.filter({ ticket_number: ticket });
    if (Array.isArray(jobs) && jobs.length) {
      setSearch('');
      navigate(`/jobs/${jobs[0].id}`);
    }
  };

  const filteredJobs = (filter === 'All' ? safeJobs : safeJobs.filter((j) => j.status === filter))
    .filter(matchesSearch);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>);

  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-slate-500">Couldn't load jobs.</p>
          <button
            onClick={() => loadData()}
            className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm active:bg-amber-600">
            
            Try again
          </button>
        </div>
      </div>);

  }

  return (
    <div className="p-4 space-y-4 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Job Board</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/reminders')}
            className="relative flex items-center gap-1 text-white px-3 py-2 rounded-lg font-semibold text-sm active:bg-red-600 bg-[#e60505]">
            
            <Bell className="w-4 h-4" /> Reminders
            {dueToday.length > 0 &&
            <span className="absolute -top-2 -right-2 bg-white text-red-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-red-500">
                {dueToday.length}
              </span>
            }
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1 bg-slate-900 text-white px-3 py-2 rounded-lg font-semibold text-sm active:bg-slate-700">
            
            <ScanLine className="w-4 h-4" /> Scan QR Code
          </button>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600">
            
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>
      </div>
      {todaysSchedule.length > 0 &&
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-red-500" /> Today's Schedule
          </h2>
          <div className="space-y-2">
            {todaysSchedule.map((r) =>
          <Link
            key={r.id}
            to="/reminders"
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 active:bg-slate-100">
            
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
            r.appointment_type === 'On-site' ? 'bg-blue-100 text-blue-700' :
            r.appointment_type === 'Off-site' ? 'bg-green-100 text-green-700' :
            'bg-slate-100 text-slate-600'}`
            }>
                  {r.appointment_type}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{r.title}</p>
                  {r.customer_name &&
              <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> {r.customer_address || r.customer_name}
                    </p>
              }
                </div>
              </Link>
          )}
          </div>
        </div>
      }
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ticket #, customer, or unit..."
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm"
        />
      </form>
      <JobStatusDropdown jobs={safeJobs} filter={filter} setFilter={setFilter} />
      {filteredJobs.length === 0 ?
      <div className="text-center py-20 text-white">
           <p className="text-sm">{search ? 'No jobs match your search' : 'No jobs in this view'}</p>
         </div> :

      <div className="space-y-2">
          {filteredJobs.map((job) =>
        <JobCard key={job.id} job={job} totalCost={costByJob[job.id] || 0} />
        )}
        </div>
      }
      {showQuickAdd &&
      <JobQuickAdd
        onClose={() => setShowQuickAdd(false)}
        onSaved={(job) => {
          setShowQuickAdd(false);
          navigate(`/jobs/${job.id}`);
        }} />

      }
      {showScanner &&
      <QrScanner
        onClose={() => setShowScanner(false)}
        onResult={handleScanResult} />
      }
    </div>);

}
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import JobCard from '@/components/JobCard';
import CustomerMatchLinks from '@/components/CustomerMatchLinks';
import MyAssignmentsCard from '@/components/MyAssignmentsCard';
import JobQuickAdd from '@/components/JobQuickAdd';
import JobStatusDropdown from '@/components/JobStatusDropdown';
import UnitsInShopCard from '@/components/UnitsInShopCard';
import ActiveJobClock from '@/components/ActiveJobClock';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Bell, Calendar, MapPin, Search, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import QrScanner from '@/components/QrScanner';
import QrMenuButton from '@/components/QrMenuButton';
import UnitLabel from '@/components/UnitLabel';
import LoyaltyRemindersCard from '@/components/LoyaltyRemindersCard';
import useLoyalty from '@/hooks/useLoyalty';
import usePlanFeature from '@/hooks/usePlanFeature';
import { normalizeTicketInput } from '@/lib/ticketNumbers';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // The board opens on Intake so new work is the first thing a technician sees.
  const [filter, setFilter] = useState('Intake');
  const [locationFilter, setLocationFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [printAfterSave, setPrintAfterSave] = useState(false);
  const [printLabel, setPrintLabel] = useState('');
  const [reminders, setReminders] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Loyalty milestones are a Team-and-up tool, so nothing is earned or shown
  // below that. The visit counts themselves stay available to every plan.
  const { locked: loyaltyLocked } = usePlanFeature('loyalty');

  // How many times each customer has been in the shop, and — for an
  // administrator — the milestone reminders those visits have earned.
  const {
    visitCounts,
    reminders: loyaltyReminders,
    reload: reloadLoyalty,
  } = useLoyalty(user?.role === 'admin' && !loyaltyLocked);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, partsData, laborData, remindersData, assignmentsData] = await Promise.all([
      base44.entities.Job.list('-created_date', 200),
      base44.entities.Part.list(),
      base44.entities.LaborEntry.list(),
      base44.entities.Reminder.list('due_date', 200),
      base44.entities.JobAssignment.list('-created_date', 500)]
      );
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setParts(Array.isArray(partsData) ? partsData : []);
      setLabor(Array.isArray(laborData) ? laborData : []);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
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

  // The signed-in user's own jobs, matched to a staff record by email.
  const myEmail = (user?.email || '').toLowerCase();
  const myJobIds = useMemo(() => {
    const set = new Set();
    for (const a of assignments) {
      if (myEmail && (a.staff_email || '').toLowerCase() === myEmail) {
        set.add(a.job_id);
      }
    }
    return set;
  }, [assignments, myEmail]);

  const myAssignedJobs = safeJobs.filter((j) => myJobIds.has(j.id));

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

  // After an intake started from the QR "Print" option, show the new unit's
  // label for printing instead of opening the job.
  const handleJobSaved = async (job) => {
    setShowQuickAdd(false);
    const wantsPrint = printAfterSave;
    setPrintAfterSave(false);
    if (wantsPrint && job?.unit_id) {
      const unit = await base44.entities.Equipment.get(job.unit_id).catch(() => null);
      if (unit?.label_number) {
        setPrintLabel(String(unit.label_number));
        return;
      }
    }
    navigate(`/jobs/${job.id}`);
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

  const inShopView = ['In shop', 'On-site', 'Off-site'].includes(locationFilter);
  const filteredJobs = (filter === 'All' ? safeJobs : safeJobs.filter((j) => j.status === filter))
    .filter((j) => {
      if (!inShopView) return true;
      if (j.status === 'Closed') return false;
      if (locationFilter === 'In shop') return true;
      return j.job_location === locationFilter;
    })
    .filter((j) => !assignedOnly || myJobIds.has(j.id))
    .filter(matchesSearch);

  // Customers whose name matches the search, so the name itself can open their
  // full record alongside their tickets.
  const matchingCustomers = (() => {
    if (!searchLower) return [];
    const found = new Map();
    for (const j of safeJobs) {
      if (!j.customer_id || found.has(j.customer_id)) continue;
      if ((j.customer_name || '').toLowerCase().includes(searchLower)) {
        found.set(j.customer_id, { id: j.customer_id, name: j.customer_name });
      }
    }
    return Array.from(found.values());
  })();

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
          <QrMenuButton
            onScan={() => setShowScanner(true)}
            onPrint={() => { setPrintAfterSave(true); setShowQuickAdd(true); }} />
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600">
            
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>
      </div>
      <ActiveJobClock />
      {!loyaltyLocked && (
        <LoyaltyRemindersCard
          reminders={loyaltyReminders}
          onChanged={reloadLoyalty} />
      )}
      <UnitsInShopCard
        locationFilter={locationFilter}
        onSelect={(value) => {
          setLocationFilter(value);
          setFilter('All');
        }} />
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
      <div className="flex flex-wrap items-center justify-center gap-2">
        <JobStatusDropdown
          jobs={safeJobs}
          filter={filter}
          setFilter={(value) => {
            setFilter(value);
            setLocationFilter('All');
          }} />
        <MyAssignmentsCard jobs={myAssignedJobs} />
      </div>
      {myJobIds.size > 0 &&
      <button
        onClick={() => setAssignedOnly((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
        assignedOnly ?
        'bg-amber-500 text-slate-900' :
        'bg-white text-slate-600 border border-slate-200'}`
        }>
        
          <UserCheck className="w-4 h-4" /> Assigned to me
        </button>
      }
      <CustomerMatchLinks customers={matchingCustomers} />
      {filteredJobs.length === 0 ?
      <div className="text-center py-20 text-white">
           <p className="text-sm">{search ? 'No jobs match your search' : 'No jobs in this view'}</p>
         </div> :

      <div className="space-y-2">
          {filteredJobs.map((job) =>
        <JobCard
          key={job.id}
          job={job}
          totalCost={costByJob[job.id] || 0}
          visits={visitCounts[job.customer_id] || 0} />
        )}
        </div>
      }
      {showQuickAdd &&
      <JobQuickAdd
        onClose={() => { setShowQuickAdd(false); setPrintAfterSave(false); }}
        onSaved={handleJobSaved} />

      }
      {showScanner &&
      <QrScanner
        onClose={() => setShowScanner(false)}
        onResult={handleScanResult} />
      }
      {printLabel &&
      <UnitLabel
        labelNumber={printLabel}
        closeLabel="Done"
        onClose={() => setPrintLabel('')} />
      }
    </div>);

}
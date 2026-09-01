import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Printer, Phone, Mail, MapPin } from 'lucide-react';
import {
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  isWithinInterval,
  subWeeks,
  startOfDay,
  endOfDay,
} from 'date-fns';

function buildShifts(clocks) {
  const sorted = [...clocks].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const shifts = [];
  let inTs = null;
  for (const c of sorted) {
    if (c.action === 'clock_in') inTs = new Date(c.timestamp);
    else if (c.action === 'clock_out' && inTs) {
      const out = new Date(c.timestamp);
      shifts.push({ in: inTs, out, duration: (out - inTs) / 3600000 });
      inTs = null;
    }
  }
  return shifts;
}

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staff, setStaff] = useState(null);
  const [labor, setLabor] = useState([]);
  const [clocks, setClocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('personal');

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [staffData, laborData, clockData] = await Promise.all([
        base44.entities.Staff.get(id),
        base44.entities.LaborEntry.list(),
        base44.entities.TimeClock.list('-timestamp', 500),
      ]);
      setStaff(staffData);
      setLabor(Array.isArray(laborData) ? laborData : []);
      setClocks(Array.isArray(clockData) ? clockData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const payRate = staff?.pay_rate || 0;

  const billedLabor = useMemo(
    () => labor.filter((l) => l.technician === staff?.name),
    [labor, staff]
  );

  const shifts = useMemo(
    () =>
      buildShifts(
        clocks.filter((c) => c.employee_id && c.employee_id === staff?.employee_id)
      ),
    [clocks, staff]
  );

  const ranges = useMemo(() => {
    const now = new Date();
    return {
      today: { start: startOfDay(now), end: endOfDay(now) },
      thisWeek: {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      },
      lastWeek: {
        start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      },
      year: { start: startOfYear(now), end: endOfYear(now) },
    };
  }, []);

  const inRange = (d, r) => isWithinInterval(new Date(d), r);

  const billed = useMemo(() => {
    const sum = (arr) => arr.reduce((s, l) => s + (l.hours || 0), 0);
    return {
      today: sum(billedLabor.filter((l) => inRange(l.created_date, ranges.today))),
      thisWeek: sum(
        billedLabor.filter((l) => inRange(l.created_date, ranges.thisWeek))
      ),
      lastWeek: sum(
        billedLabor.filter((l) => inRange(l.created_date, ranges.lastWeek))
      ),
      year: sum(billedLabor.filter((l) => inRange(l.created_date, ranges.year))),
    };
  }, [billedLabor, ranges]);

  const actual = useMemo(() => {
    const sum = (r) =>
      shifts.filter((s) => inRange(s.in, r)).reduce((t, s) => t + s.duration, 0);
    return {
      today: sum(ranges.today),
      thisWeek: sum(ranges.thisWeek),
      lastWeek: sum(ranges.lastWeek),
      year: sum(ranges.year),
    };
  }, [shifts, ranges]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!staff) {
    return <p className="text-center py-20 text-slate-400">Staff member not found</p>;
  }

  const tabs = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'wages', label: 'Wages' },
    { key: 'hours', label: 'Hours Worked' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1 truncate">{staff.name}</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="hidden print:block mb-2">
        <h1 className="text-xl font-bold">
          {staff.name} — Staff Report
        </h1>
        <p className="text-sm text-slate-500">
          Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`pb-2 text-sm font-semibold ${
              section === t.key
                ? 'text-amber-600 border-b-2 border-amber-500'
                : 'text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      <div
        className={
          section === 'personal'
            ? 'bg-white rounded-xl border border-slate-200 p-4 space-y-3'
            : 'hidden'
        }
      >
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-900 text-lg">{staff.name}</p>
          {staff.employee_id && (
            <span className="text-xs font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              ID: {staff.employee_id}
            </span>
          )}
          {staff.status === 'inactive' && (
            <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              Inactive
            </span>
          )}
        </div>
        {staff.role_title && (
          <p className="text-sm text-slate-500">{staff.role_title}</p>
        )}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-sm">
          {staff.phone && (
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              {staff.phone}
            </div>
          )}
          {staff.email && (
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-4 h-4 text-slate-400" />
              {staff.email}
            </div>
          )}
          {staff.address && (
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400" />
              {staff.address}
            </div>
          )}
          {staff.hire_date && (
            <p className="text-slate-500">
              Hired {new Date(staff.hire_date).toLocaleDateString()}
            </p>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Pay Rate</span>
            <span className="font-semibold">
              ${(staff.pay_rate || 0).toFixed(2)}/hr
            </span>
          </div>
          {staff.tax_notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-500 text-xs mb-1">Tax Notes</p>
              <p className="text-sm text-slate-700">{staff.tax_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Wages */}
      <div className={section === 'wages' ? 'space-y-3' : 'hidden'}>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-bold text-slate-900 mb-3">
            Wages (${payRate.toFixed(2)}/hr)
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                <th className="pb-2">Period</th>
                <th className="pb-2 text-center">Billed (LaborEntry)</th>
                <th className="pb-2 text-center">Actual (TimeClock)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Today', b: billed.today, a: actual.today },
                { label: 'This Week', b: billed.thisWeek, a: actual.thisWeek },
                { label: 'Year', b: billed.year, a: actual.year },
              ].map((r) => (
                <tr key={r.label} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-slate-900">{r.label}</td>
                  <td className="py-2 text-center">
                    <span className="font-semibold">
                      ${(r.b * payRate).toFixed(2)}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {r.b.toFixed(1)} hrs
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <span className="font-semibold">
                      ${(r.a * payRate).toFixed(2)}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {r.a.toFixed(1)} hrs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hours */}
      <div className={section === 'hours' ? 'space-y-3' : 'hidden'}>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="font-bold text-slate-900 mb-3">Hours Worked</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                <th className="pb-2">Period</th>
                <th className="pb-2 text-center">Billed (LaborEntry)</th>
                <th className="pb-2 text-center">Actual (TimeClock)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'This Week', b: billed.thisWeek, a: actual.thisWeek },
                { label: 'Last Week', b: billed.lastWeek, a: actual.lastWeek },
                { label: 'Year', b: billed.year, a: actual.year },
              ].map((r) => (
                <tr key={r.label} className="border-b border-slate-50">
                  <td className="py-2 font-medium text-slate-900">{r.label}</td>
                  <td className="py-2 text-center font-semibold">
                    {r.b.toFixed(1)} hrs
                  </td>
                  <td className="py-2 text-center font-semibold">
                    {r.a.toFixed(1)} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { computeJobProfit } from '@/lib/billing';
import ReportsHeader from '@/components/reports/ReportsHeader';
import SummaryCards from '@/components/reports/SummaryCards';
import ProfitLossStatement from '@/components/reports/ProfitLossStatement';
import EmployeeEarningsTable from '@/components/reports/EmployeeEarningsTable';
import BreakdownList from '@/components/reports/BreakdownList';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [sales, setSales] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [visibleSales, setVisibleSales] = useState(10);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const [jobsData, partsData, laborData, salesData, saleItemsData, staffData] = await Promise.all([
          base44.entities.Job.list('-created_date', 500),
          base44.entities.Part.list(),
          base44.entities.LaborEntry.list(),
          base44.entities.Sale.list('-sale_date', 500),
          base44.entities.SaleItem.list('-created_date', 2000),
          base44.entities.Staff.list('-created_date'),
        ]);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setParts(Array.isArray(partsData) ? partsData : []);
        setLabor(Array.isArray(laborData) ? laborData : []);
        setSales(Array.isArray(salesData) ? salesData : []);
        setSaleItems(Array.isArray(saleItemsData) ? saleItemsData : []);
        setStaff(Array.isArray(staffData) ? staffData : []);
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

  const filteredSales = useMemo(() => {
    return sales.filter(
      (s) => new Date(s.sale_date || s.created_date).getFullYear() === year
    );
  }, [sales, year]);

  const itemsBySale = useMemo(() => {
    const m = {};
    for (const it of saleItems) {
      (m[it.sale_id] = m[it.sale_id] || []).push(it);
    }
    return m;
  }, [saleItems]);

  const salesRows = useMemo(() => {
    return filteredSales.map((s) => {
      const lines = itemsBySale[s.id] || [];
      const qty = (l) => Number(l.quantity) || 1;
      const revenue = lines.length
        ? lines.reduce((a, l) => a + qty(l) * (Number(l.unit_price) || 0), 0)
        : Number(s.subtotal) || Number(s.total_price) || 0;
      const cost = lines.length
        ? lines.reduce((a, l) => a + qty(l) * (Number(l.unit_cost) || 0), 0)
        : Number(s.unit_cost) || 0;
      return {
        id: s.id,
        customer_name: s.customer_name || 'Walk-in',
        item_description: s.item_description,
        sale_date: s.sale_date,
        revenue,
        cost,
        tax: revenue * ((Number(s.tax_rate) || 0) / 100),
        profit: revenue - cost,
      };
    });
  }, [filteredSales, itemsBySale]);

  const salesTotals = useMemo(() => {
    let revenue = 0,
      cost = 0,
      tax = 0;
    for (const r of salesRows) {
      revenue += r.revenue;
      cost += r.cost;
      tax += r.tax;
    }
    return { revenue, cost, tax, profit: revenue - cost };
  }, [salesRows]);

  const combined = useMemo(
    () => ({
      revenue: totals.revenue + salesTotals.revenue,
      cost: totals.partsCost + totals.laborCost + salesTotals.cost,
      profit: totals.profit + salesTotals.profit,
    }),
    [totals, salesTotals]
  );

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

  const staffByName = useMemo(() => {
    const m = {};
    for (const s of staff) m[(s.name || '').trim().toLowerCase()] = s.id;
    return m;
  }, [staff]);

  const jobRows = useMemo(
    () =>
      jobProfits.map((jp) => ({
        id: jp.job.id,
        title: jp.job.customer_name || '—',
        subtitle: `${jp.job.equipment_type} · ${new Date(
          jp.job.created_date
        ).toLocaleDateString()}`,
        revenue: jp.revenue,
        profit: jp.profit,
      })),
    [jobProfits]
  );

  const saleRows = useMemo(
    () =>
      salesRows.map((r) => ({
        id: r.id,
        title: r.item_description || '—',
        subtitle: `${r.customer_name}${
          r.sale_date ? ` · ${new Date(r.sale_date).toLocaleDateString()}` : ''
        }`,
        revenue: r.revenue,
        profit: r.profit,
      })),
    [salesRows]
  );

  // Print the complete pack: expand lists first, then open the print dialog
  const handlePrint = () => {
    setVisibleJobs(jobRows.length);
    setVisibleSales(saleRows.length);
    setTimeout(() => window.print(), 100);
  };

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
      <ReportsHeader
        year={year}
        years={years}
        statusFilter={statusFilter}
        onYearChange={setYear}
        onStatusChange={setStatusFilter}
        onPrint={handlePrint}
      />

      <SummaryCards
        revenue={combined.revenue}
        cost={combined.cost}
        profit={combined.profit}
        tax={totals.taxCollected + salesTotals.tax}
      />

      <ProfitLossStatement
        year={year}
        totals={totals}
        salesTotals={salesTotals}
        combined={combined}
      />

      <EmployeeEarningsTable
        year={year}
        employeeStats={employeeStats}
        staffByName={staffByName}
        onSelect={(sid) => navigate(`/staff/${sid}`)}
      />

      <BreakdownList
        title={`Job Breakdown — ${year}`}
        rows={jobRows}
        visible={visibleJobs}
        onShowMore={() => setVisibleJobs((v) => v + 10)}
        onShowAll={() => setVisibleJobs(jobRows.length)}
        onSelect={(id) => navigate(`/jobs/${id}`)}
        emptyLabel="No jobs in this period"
      />

      <BreakdownList
        title={`Sales Breakdown — ${year}`}
        rows={saleRows}
        visible={visibleSales}
        onShowMore={() => setVisibleSales((v) => v + 10)}
        onShowAll={() => setVisibleSales(saleRows.length)}
        onSelect={(id) => navigate(`/sales/${id}`)}
        emptyLabel="No sales in this period"
      />
    </div>
  );
}
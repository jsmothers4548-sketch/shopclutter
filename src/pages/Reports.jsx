import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { computeJobProfit } from '@/lib/billing';
import { buildPeriod, inPeriod } from '@/lib/reportPeriod';
import ReportsHeader from '@/components/reports/ReportsHeader';
import SummaryCards from '@/components/reports/SummaryCards';
import ProfitLossStatement from '@/components/reports/ProfitLossStatement';
import EmployeeEarningsTable from '@/components/reports/EmployeeEarningsTable';
import BreakdownList from '@/components/reports/BreakdownList';
import PartsSpendingReport from '@/components/reports/PartsSpendingReport';
import AllPartsReport from '@/components/reports/AllPartsReport';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [sales, setSales] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [periodKey, setPeriodKey] = useState('full');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [visibleSales, setVisibleSales] = useState(10);
  const [visibleAllParts, setVisibleAllParts] = useState(10);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const [jobsData, partsData, laborData, salesData, saleItemsData, expensesData, paymentsData] = await Promise.all([
          base44.entities.Job.list('-created_date', 500),
          base44.entities.Part.list(),
          base44.entities.LaborEntry.list(),
          base44.entities.Sale.list('-sale_date', 500),
          base44.entities.SaleItem.list('-created_date', 2000),
          base44.entities.JobExpense.list(),
          base44.entities.Payment.list('-payment_date', 2000),
        ]);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setParts(Array.isArray(partsData) ? partsData : []);
        setLabor(Array.isArray(laborData) ? laborData : []);
        setSales(Array.isArray(salesData) ? salesData : []);
        setSaleItems(Array.isArray(saleItemsData) ? saleItemsData : []);
        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
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

  const period = useMemo(
    () => buildPeriod({ year, periodKey, customStart, customEnd }),
    [year, periodKey, customStart, customEnd]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (!inPeriod(j.created_date, period)) return false;
      if (statusFilter === 'closed' && j.status !== 'Closed') return false;
      return true;
    });
  }, [jobs, period, statusFilter]);

  const filteredJobIds = useMemo(
    () => new Set(filteredJobs.map((j) => j.id)),
    [filteredJobs]
  );

  const jobProfits = useMemo(() => {
    return filteredJobs.map((job) => {
      const jobParts = parts.filter((p) => p.job_id === job.id);
      const jobLabor = labor.filter((l) => l.job_id === job.id);
      const jobExpenses = expenses.filter((e) => e.job_id === job.id);
      return {
        job,
        ...computeJobProfit({
          parts: jobParts,
          labor: jobLabor,
          job,
          expenses: jobExpenses,
        }),
      };
    });
  }, [filteredJobs, parts, labor, expenses]);

  const totals = useMemo(() => {
    let revenue = 0,
      partsCost = 0,
      laborCost = 0,
      expenseCost = 0,
      taxCollected = 0;
    for (const jp of jobProfits) {
      revenue += jp.revenue;
      partsCost += jp.partsCost;
      laborCost += jp.laborCost;
      expenseCost += jp.expensesCost || 0;
      taxCollected += jp.taxAmount;
    }
    return {
      revenue,
      partsCost,
      laborCost,
      expenseCost,
      taxCollected,
      profit: revenue - partsCost - laborCost - expenseCost,
    };
  }, [jobProfits]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) =>
      inPeriod(s.sale_date || s.created_date, period)
    );
  }, [sales, period]);

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
      cost:
        totals.partsCost +
        totals.laborCost +
        (totals.expenseCost || 0) +
        salesTotals.cost,
      profit: totals.profit + salesTotals.profit,
    }),
    [totals, salesTotals]
  );

  const paymentsReceived = useMemo(() => {
    const jobPayments = payments
      .filter((p) => inPeriod(p.payment_date || p.created_date, period))
      .reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const salesCash = filteredSales.reduce(
      (a, s) => a + (Number(s.amount_paid) || 0),
      0
    );
    return {
      jobs: jobPayments,
      sales: salesCash,
      total: jobPayments + salesCash,
    };
  }, [payments, filteredSales, period]);

  const allPartsRows = useMemo(() => {
    const map = {};
    const add = (name, partNumber, qty, cost) => {
      const key = `${(name || '').trim().toLowerCase()}|${(
        partNumber || ''
      ).trim().toLowerCase()}`;
      if (!map[key]) {
        map[key] = {
          key,
          name: name || 'Unnamed part',
          partNumber: partNumber || '',
          qty: 0,
          totalCost: 0,
          lines: 0,
        };
      }
      map[key].qty += qty;
      map[key].totalCost += cost;
      map[key].lines += 1;
    };
    for (const p of parts) {
      if (!inPeriod(p.created_date, period)) continue;
      add(
        p.name,
        p.part_number,
        Number(p.quantity) || 0,
        (Number(p.quantity) || 0) * (Number(p.unit_cost) || 0)
      );
    }
    for (const it of saleItems) {
      if (!inPeriod(it.created_date, period)) continue;
      add(
        it.description,
        it.part_number,
        Number(it.quantity) || 0,
        (Number(it.quantity) || 0) * (Number(it.unit_cost) || 0)
      );
    }
    return Object.values(map).sort((a, b) => b.totalCost - a.totalCost);
  }, [parts, saleItems, period]);

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

  // Print the complete pack: expand all lists first, then open the print dialog
  const handlePrint = () => {
    setVisibleJobs(jobRows.length);
    setVisibleSales(saleRows.length);
    setVisibleAllParts(allPartsRows.length);
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
        periodKey={periodKey}
        periodLabel={period.label}
        customStart={customStart}
        customEnd={customEnd}
        statusFilter={statusFilter}
        onYearChange={setYear}
        onPeriodChange={setPeriodKey}
        onCustomStart={setCustomStart}
        onCustomEnd={setCustomEnd}
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
        periodLabel={period.label}
        totals={totals}
        salesTotals={salesTotals}
        combined={combined}
        payments={paymentsReceived}
      />

      <EmployeeEarningsTable
        periodLabel={period.label}
        employeeStats={employeeStats}
        onSelect={(emp) =>
          navigate(
            `/reports/employee-earnings?name=${encodeURIComponent(emp.name)}&year=${year}`
          )
        }
      />

      <BreakdownList
        title={`Job Breakdown — ${period.label}`}
        rows={jobRows}
        visible={visibleJobs}
        onShowMore={() => setVisibleJobs((v) => v + 10)}
        onShowAll={() => setVisibleJobs(jobRows.length)}
        onSelect={(id) => navigate(`/jobs/${id}`)}
        emptyLabel="No jobs in this period"
      />

      <BreakdownList
        title={`Sales Breakdown — ${period.label}`}
        rows={saleRows}
        visible={visibleSales}
        onShowMore={() => setVisibleSales((v) => v + 10)}
        onShowAll={() => setVisibleSales(saleRows.length)}
        onSelect={(id) => navigate(`/sales/${id}`)}
        emptyLabel="No sales in this period"
      />

      <AllPartsReport
        periodLabel={period.label}
        rows={allPartsRows}
        visible={visibleAllParts}
        onShowMore={() => setVisibleAllParts((v) => v + 10)}
        onShowAll={() => setVisibleAllParts(allPartsRows.length)}
      />

      <PartsSpendingReport
        period={period}
        parts={parts}
        saleItems={saleItems}
        jobs={jobs}
        sales={sales}
        onOpenJob={(id) => navigate(`/jobs/${id}`)}
        onOpenSale={(id) => navigate(`/sales/${id}`)}
      />
    </div>
  );
}
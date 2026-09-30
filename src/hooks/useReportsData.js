import { useEffect, useMemo, useState } from 'react';
import { gatedRead } from '@/lib/planApi';
import { computeJobProfit } from '@/lib/billing';
import { buildPeriod, inPeriod } from '@/lib/reportPeriod';

// Loads all reporting data once and derives every figure the Reports page
// and its standalone statement pages need for the selected period.
export default function useReportsData({
  year,
  periodKey,
  month,
  customStart,
  customEnd,
  statusFilter,
}) {
  const [data, setData] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    (async () => {
      // The reporting lists come from the server, which confirms the shop's
      // plan includes profit reports before returning anything.
      let lists = [];
      try {
        lists = await gatedRead('reports', [
          { entity: 'Job', sort: '-created_date', limit: 500 },
          { entity: 'Part', limit: 3000 },
          { entity: 'LaborEntry', limit: 3000 },
          { entity: 'Sale', sort: '-sale_date', limit: 500 },
          { entity: 'SaleItem', sort: '-created_date', limit: 2000 },
          { entity: 'JobExpense', limit: 3000 },
          { entity: 'Payment', sort: '-payment_date', limit: 2000 },
          { entity: 'PartPurchase', sort: '-purchase_date', limit: 2000 },
        ]);
      } catch (err) {
        setLocked(!!err?.locked);
      }
      const [
        jobsData,
        partsData,
        laborData,
        salesData,
        saleItemsData,
        expensesData,
        paymentsData,
        purchasesData,
      ] = lists;
      setData({
        jobs: Array.isArray(jobsData) ? jobsData : [],
        parts: Array.isArray(partsData) ? partsData : [],
        labor: Array.isArray(laborData) ? laborData : [],
        sales: Array.isArray(salesData) ? salesData : [],
        saleItems: Array.isArray(saleItemsData) ? saleItemsData : [],
        expenses: Array.isArray(expensesData) ? expensesData : [],
        payments: Array.isArray(paymentsData) ? paymentsData : [],
        purchases: Array.isArray(purchasesData) ? purchasesData : [],
      });
    })();
  }, []);

  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const set = new Set(
      (data?.jobs || []).map((j) => new Date(j.created_date).getFullYear())
    );
    set.add(currentYear);
    return [...set].sort((a, b) => b - a);
  }, [data, currentYear]);

  const period = useMemo(
    () => buildPeriod({ year, periodKey, month, customStart, customEnd }),
    [year, periodKey, month, customStart, customEnd]
  );

  const jobById = useMemo(
    () => Object.fromEntries((data?.jobs || []).map((j) => [j.id, j])),
    [data]
  );

  const saleById = useMemo(
    () => Object.fromEntries((data?.sales || []).map((s) => [s.id, s])),
    [data]
  );

  const filteredJobs = useMemo(() => {
    return (data?.jobs || []).filter((j) => {
      if (!inPeriod(j.created_date, period)) return false;
      if (statusFilter === 'closed' && j.status !== 'Closed') return false;
      return true;
    });
  }, [data, period, statusFilter]);

  const filteredJobIds = useMemo(
    () => new Set(filteredJobs.map((j) => j.id)),
    [filteredJobs]
  );

  const jobProfits = useMemo(() => {
    if (!data) return [];
    return filteredJobs.map((job) => ({
      job,
      ...computeJobProfit({
        parts: data.parts.filter((p) => p.job_id === job.id),
        labor: data.labor.filter((l) => l.job_id === job.id),
        job,
        expenses: data.expenses.filter((e) => e.job_id === job.id),
      }),
    }));
  }, [filteredJobs, data]);

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
    return (data?.sales || []).filter((s) =>
      inPeriod(s.sale_date || s.created_date, period)
    );
  }, [data, period]);

  const itemsBySale = useMemo(() => {
    const m = {};
    for (const it of data?.saleItems || []) {
      (m[it.sale_id] = m[it.sale_id] || []).push(it);
    }
    return m;
  }, [data]);

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
    const jobPayments = (data?.payments || [])
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
  }, [data, filteredSales, period]);

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
    for (const p of data?.parts || []) {
      if (!inPeriod(p.created_date, period)) continue;
      add(
        p.name,
        p.part_number,
        Number(p.quantity) || 0,
        (Number(p.quantity) || 0) * (Number(p.unit_cost) || 0)
      );
    }
    for (const it of data?.saleItems || []) {
      if (!inPeriod(it.created_date, period)) continue;
      add(
        it.description,
        it.part_number,
        Number(it.quantity) || 0,
        (Number(it.quantity) || 0) * (Number(it.unit_cost) || 0)
      );
    }
    return Object.values(map).sort((a, b) => b.totalCost - a.totalCost);
  }, [data, period]);

  const employeeStats = useMemo(() => {
    const map = {};
    for (const l of data?.labor || []) {
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
  }, [data, filteredJobIds]);

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

  // Every money-out line for the period: purchases, job parts,
  // counter-sale items, and out-of-pocket job expenses.
  const expenditureRows = useMemo(() => {
    if (!data) return [];
    const rows = [];
    const jobLabel = (jobId) => {
      const job = jobById[jobId];
      if (!job) return '';
      return `${job.customer_name || '—'}${
        job.ticket_number ? ` · #${job.ticket_number}` : ''
      }`;
    };
    for (const p of data.purchases) {
      if (!inPeriod(p.purchase_date || p.created_date, period)) continue;
      const qty = Number(p.quantity) || 0;
      const unitCost = Number(p.unit_cost) || 0;
      rows.push({
        id: `purchase-${p.id}`,
        date: p.purchase_date || p.created_date,
        type: 'Purchase',
        description: p.part_name || 'Part',
        source: p.supplier || '',
        qty,
        unitCost,
        amount: qty * unitCost,
        link: null,
      });
    }
    for (const p of data.parts) {
      if (!inPeriod(p.created_date, period)) continue;
      const qty = Number(p.quantity) || 0;
      const unitCost = Number(p.unit_cost) || 0;
      rows.push({
        id: `part-${p.id}`,
        date: p.created_date,
        type: 'Job Part',
        description: p.name || 'Part',
        source: jobLabel(p.job_id),
        qty,
        unitCost,
        amount: qty * unitCost,
        link: `/jobs/${p.job_id}`,
      });
    }
    for (const it of data.saleItems) {
      if (!inPeriod(it.created_date, period)) continue;
      const qty = Number(it.quantity) || 0;
      const unitCost = Number(it.unit_cost) || 0;
      rows.push({
        id: `saleitem-${it.id}`,
        date: it.created_date,
        type: 'Counter Sale',
        description: it.description || 'Item',
        source: saleById[it.sale_id]?.customer_name || '',
        qty,
        unitCost,
        amount: qty * unitCost,
        link: `/sales/${it.sale_id}`,
      });
    }
    for (const e of data.expenses) {
      if (!inPeriod(e.expense_date || e.created_date, period)) continue;
      rows.push({
        id: `expense-${e.id}`,
        date: e.expense_date || e.created_date,
        type: 'Expense',
        description: e.description || 'Expense',
        source: `${jobLabel(e.job_id)}${
          e.paid_by ? ` · paid by ${e.paid_by}` : ''
        }`,
        qty: null,
        unitCost: null,
        amount: Number(e.amount) || 0,
        link: `/jobs/${e.job_id}`,
      });
    }
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data, period, jobById, saleById]);

  const expenditureTotals = useMemo(() => {
    const byType = {};
    let total = 0;
    for (const r of expenditureRows) {
      byType[r.type] = (byType[r.type] || 0) + r.amount;
      total += r.amount;
    }
    return { byType, total };
  }, [expenditureRows]);

  return {
    loading: !data,
    locked,
    years,
    period,
    jobs: data?.jobs || [],
    parts: data?.parts || [],
    saleItems: data?.saleItems || [],
    sales: data?.sales || [],
    jobRows,
    saleRows,
    allPartsRows,
    totals,
    salesTotals,
    combined,
    payments: paymentsReceived,
    employeeStats,
    expenditureRows,
    expenditureTotals,
  };
}
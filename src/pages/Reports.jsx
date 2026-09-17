import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import useReportsData from '@/hooks/useReportsData';
import ReportsHeader from '@/components/reports/ReportsHeader';
import SummaryCards from '@/components/reports/SummaryCards';
import ProfitLossStatement from '@/components/reports/ProfitLossStatement';
import EmployeeEarningsTable from '@/components/reports/EmployeeEarningsTable';
import BreakdownList from '@/components/reports/BreakdownList';
import PartsSpendingReport from '@/components/reports/PartsSpendingReport';
import AllPartsReport from '@/components/reports/AllPartsReport';
import ExpenditureReport from '@/components/reports/ExpenditureReport';
import SectionActions from '@/components/reports/SectionActions';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [periodKey, setPeriodKey] = useState('full');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [visibleSales, setVisibleSales] = useState(10);
  const [visibleAllParts, setVisibleAllParts] = useState(10);
  const [visibleExpenditures, setVisibleExpenditures] = useState(10);
  // null = print the full pack; otherwise print only the matching section
  const [printSection, setPrintSection] = useState(null);

  const report = useReportsData({
    year,
    periodKey,
    customStart,
    customEnd,
    statusFilter,
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Print the complete pack: expand all lists first, then open the print dialog
  const handlePrint = () => {
    setVisibleJobs(report.jobRows.length);
    setVisibleSales(report.saleRows.length);
    setVisibleAllParts(report.allPartsRows.length);
    setVisibleExpenditures(report.expenditureRows.length);
    setTimeout(() => window.print(), 100);
  };

  // Print only one section: expand its list, hide everything else in print
  const printOnly = (key) => {
    if (key === 'sales') setVisibleSales(report.saleRows.length);
    if (key === 'parts') setVisibleAllParts(report.allPartsRows.length);
    if (key === 'expenditures')
      setVisibleExpenditures(report.expenditureRows.length);
    setPrintSection(key);
    setTimeout(() => {
      window.print();
      setPrintSection(null);
    }, 60);
  };

  const hideInPrint = (key) =>
    printSection && printSection !== key ? 'print:hidden' : '';

  const openPartHistory = (r) =>
    navigate(
      `/reports/part-history?name=${encodeURIComponent(r.name)}&number=${encodeURIComponent(r.partNumber || '')}`
    );

  if (report.loading) {
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
      <div className={printSection ? 'print:hidden' : ''}>
        <ReportsHeader
          year={year}
          years={report.years}
          periodKey={periodKey}
          periodLabel={report.period.label}
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
      </div>

      <div className={hideInPrint('summary')}>
        <SummaryCards
          revenue={report.combined.revenue}
          cost={report.combined.cost}
          profit={report.combined.profit}
          tax={report.totals.taxCollected + report.salesTotals.tax}
        />
      </div>

      <div className={hideInPrint('pl')}>
        <ProfitLossStatement
          periodLabel={report.period.label}
          totals={report.totals}
          salesTotals={report.salesTotals}
          combined={report.combined}
          payments={report.payments}
          actions={
            <SectionActions
              onPrint={() => printOnly('pl')}
              fullPageTo="/reports/statement/pl"
            />
          }
        />
      </div>

      <div className={hideInPrint('earnings')}>
        <EmployeeEarningsTable
          periodLabel={report.period.label}
          employeeStats={report.employeeStats}
          onSelect={(emp) =>
            navigate(
              `/reports/employee-earnings?name=${encodeURIComponent(emp.name)}&year=${year}`
            )
          }
        />
      </div>

      <div className={hideInPrint('jobs')}>
        <BreakdownList
          title={`Job Breakdown — ${report.period.label}`}
          rows={report.jobRows}
          visible={visibleJobs}
          onShowMore={() => setVisibleJobs((v) => v + 10)}
          onShowAll={() => setVisibleJobs(report.jobRows.length)}
          onSelect={(id) => navigate(`/jobs/${id}`)}
          emptyLabel="No jobs in this period"
        />
      </div>

      <div className={hideInPrint('sales')}>
        <BreakdownList
          title={`Sales Breakdown — ${report.period.label}`}
          rows={report.saleRows}
          visible={visibleSales}
          onShowMore={() => setVisibleSales((v) => v + 10)}
          onShowAll={() => setVisibleSales(report.saleRows.length)}
          onSelect={(id) => navigate(`/sales/${id}`)}
          emptyLabel="No sales in this period"
          actions={
            <SectionActions
              onPrint={() => printOnly('sales')}
              fullPageTo="/reports/statement/sales"
            />
          }
        />
      </div>

      <div className={hideInPrint('parts')}>
        <AllPartsReport
          periodLabel={report.period.label}
          rows={report.allPartsRows}
          visible={visibleAllParts}
          onShowMore={() => setVisibleAllParts((v) => v + 10)}
          onShowAll={() => setVisibleAllParts(report.allPartsRows.length)}
          onSelect={openPartHistory}
          actions={
            <SectionActions
              onPrint={() => printOnly('parts')}
              fullPageTo="/reports/statement/parts"
            />
          }
        />
      </div>

      <div className={hideInPrint('expenditures')}>
        <ExpenditureReport
          periodLabel={report.period.label}
          rows={report.expenditureRows}
          totals={report.expenditureTotals}
          visible={visibleExpenditures}
          onShowMore={() => setVisibleExpenditures((v) => v + 10)}
          onShowAll={() => setVisibleExpenditures(report.expenditureRows.length)}
          onOpen={(r) => navigate(r.link)}
          actions={
            <SectionActions
              onPrint={() => printOnly('expenditures')}
              fullPageTo="/reports/statement/expenditures"
            />
          }
        />
      </div>

      <div className={hideInPrint('spending')}>
        <PartsSpendingReport
          period={report.period}
          parts={report.parts}
          saleItems={report.saleItems}
          jobs={report.jobs}
          sales={report.sales}
          onOpenJob={(id) => navigate(`/jobs/${id}`)}
          onOpenSale={(id) => navigate(`/sales/${id}`)}
        />
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
import SectionChooser from '@/components/reports/SectionChooser';

const SECTION_META = {
  pl: { title: 'Profit & Loss', fullPageTo: '/reports/statement/pl' },
  earnings: { title: 'Employee Earnings' },
  jobs: { title: 'Job Breakdown' },
  sales: { title: 'Sales Breakdown', fullPageTo: '/reports/statement/sales' },
  parts: { title: 'Parts Report', fullPageTo: '/reports/statement/parts' },
  expenditures: {
    title: 'Expenditures',
    fullPageTo: '/reports/statement/expenditures',
  },
  spending: { title: 'Parts Spending' },
};

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
  // null = landing summary view; otherwise the open report section
  const [section, setSection] = useState(null);

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

  // Print only the open section — it is the only one on screen
  const printOnly = (key) => {
    if (key === 'jobs') setVisibleJobs(report.jobRows.length);
    if (key === 'sales') setVisibleSales(report.saleRows.length);
    if (key === 'parts') setVisibleAllParts(report.allPartsRows.length);
    if (key === 'expenditures')
      setVisibleExpenditures(report.expenditureRows.length);
    setTimeout(() => window.print(), 60);
  };

  // Landing view: sections stay printable (full pack) but hidden on screen;
  // when one is open, it is the only section on screen and in print
  const sectionClass = (key) =>
    section === key ? '' : section ? 'hidden' : 'hidden print:block';

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
      <div className={section ? 'print:hidden' : ''}>
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

      <div className={section ? 'hidden' : ''}>
        <SummaryCards
          revenue={report.combined.revenue}
          cost={report.combined.cost}
          profit={report.combined.profit}
          tax={report.totals.taxCollected + report.salesTotals.tax}
        />
      </div>

      <div className={section ? 'hidden' : ''}>
        <SectionChooser onSelect={setSection} />
      </div>

      {section && (
        <div className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSection(null)}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back to summary
            </button>
            <span className="hidden sm:inline text-sm font-bold text-slate-800">
              {SECTION_META[section].title}
            </span>
          </div>
          <SectionActions
            onPrint={() => printOnly(section)}
            fullPageTo={SECTION_META[section].fullPageTo}
          />
        </div>
      )}

      <div className={sectionClass('pl')}>
        <ProfitLossStatement
          periodLabel={report.period.label}
          totals={report.totals}
          salesTotals={report.salesTotals}
          combined={report.combined}
          payments={report.payments}
        />
      </div>

      <div className={sectionClass('earnings')}>
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

      <div className={sectionClass('jobs')}>
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

      <div className={sectionClass('sales')}>
        <BreakdownList
          title={`Sales Breakdown — ${report.period.label}`}
          rows={report.saleRows}
          visible={visibleSales}
          onShowMore={() => setVisibleSales((v) => v + 10)}
          onShowAll={() => setVisibleSales(report.saleRows.length)}
          onSelect={(id) => navigate(`/sales/${id}`)}
          emptyLabel="No sales in this period"
        />
      </div>

      <div className={sectionClass('parts')}>
        <AllPartsReport
          periodLabel={report.period.label}
          rows={report.allPartsRows}
          visible={visibleAllParts}
          onShowMore={() => setVisibleAllParts((v) => v + 10)}
          onShowAll={() => setVisibleAllParts(report.allPartsRows.length)}
          onSelect={openPartHistory}
        />
      </div>

      <div className={sectionClass('expenditures')}>
        <ExpenditureReport
          periodLabel={report.period.label}
          rows={report.expenditureRows}
          totals={report.expenditureTotals}
          visible={visibleExpenditures}
          onShowMore={() => setVisibleExpenditures((v) => v + 10)}
          onShowAll={() => setVisibleExpenditures(report.expenditureRows.length)}
          onOpen={(r) => navigate(r.link)}
        />
      </div>

      <div className={sectionClass('spending')}>
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
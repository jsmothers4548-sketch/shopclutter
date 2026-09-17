import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import useReportsData from '@/hooks/useReportsData';
import ReportsHeader from '@/components/reports/ReportsHeader';
import ProfitLossStatement from '@/components/reports/ProfitLossStatement';
import BreakdownList from '@/components/reports/BreakdownList';
import AllPartsReport from '@/components/reports/AllPartsReport';
import ExpenditureReport from '@/components/reports/ExpenditureReport';

const STATEMENTS = {
  pl: { label: 'Statement of Profit & Loss' },
  sales: { label: 'Sales Statement' },
  parts: { label: 'Parts Statement' },
  expenditures: { label: 'Itemized Expenditures' },
};

export default function ReportStatement() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const st = STATEMENTS[type];
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [periodKey, setPeriodKey] = useState('full');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const report = useReportsData({
    year,
    periodKey,
    customStart,
    customEnd,
    statusFilter,
  });

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  if (!st) {
    return (
      <div className="p-4 space-y-3">
        <button
          onClick={() => navigate('/reports')}
          className="text-sm font-semibold text-slate-600"
        >
          ← Back to Reports
        </button>
        <p className="text-sm text-slate-400">Unknown statement type.</p>
      </div>
    );
  }

  if (report.loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  return (
    <div className="p-4 space-y-4">
      <ReportsHeader
        title={st.label}
        printTitle={st.label}
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
        onPrint={() => window.print()}
      />

      {type === 'pl' && (
        <ProfitLossStatement
          periodLabel={report.period.label}
          totals={report.totals}
          salesTotals={report.salesTotals}
          combined={report.combined}
          payments={report.payments}
        />
      )}

      {type === 'sales' && (
        <BreakdownList
          title={`Sales Breakdown — ${report.period.label}`}
          rows={report.saleRows}
          visible={report.saleRows.length}
          onSelect={(id) => navigate(`/sales/${id}`)}
          emptyLabel="No sales in this period"
        />
      )}

      {type === 'parts' && (
        <AllPartsReport
          periodLabel={report.period.label}
          rows={report.allPartsRows}
          visible={report.allPartsRows.length}
          onSelect={(r) =>
            navigate(
              `/reports/part-history?name=${encodeURIComponent(r.name)}&number=${encodeURIComponent(r.partNumber || '')}`
            )
          }
        />
      )}

      {type === 'expenditures' && (
        <ExpenditureReport
          periodLabel={report.period.label}
          rows={report.expenditureRows}
          totals={report.expenditureTotals}
          visible={report.expenditureRows.length}
          onOpen={(r) => navigate(r.link)}
        />
      )}
    </div>
  );
}
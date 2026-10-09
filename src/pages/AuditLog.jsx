import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import AuditFilters from '@/components/audit/AuditFilters';
import AuditEntryRow from '@/components/audit/AuditEntryRow';

const PERIOD_DAYS = { all: null, '7': 7, '30': 30, '365': 365 };

export default function AuditLog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [action, setAction] = useState('all');
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user && !isAdmin) navigate('/');
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(
      async () => {
        const query = {};
        if (category !== 'all') query.category = category;
        if (action !== 'all') query.action = action;

        const days = PERIOD_DAYS[period];
        if (days) {
          const since = new Date();
          since.setDate(since.getDate() - days);
          query.occurred_at = { $gte: since.toISOString() };
        }

        const term = search.trim();
        if (term) {
          query.$or = [
            { target: { $regex: term, $options: 'i' } },
            { summary: { $regex: term, $options: 'i' } },
          ];
        }

        try {
          const page = await base44.entities.AuditLog.filter(query, {
            sort: '-occurred_at',
            limit: 100,
          });
          if (!cancelled) setEntries(page?.items || []);
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      search ? 300 : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAdmin, category, action, period, search]);

  if (!isAdmin) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-amber-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change History</h1>
          <p className="text-xs text-slate-400">
            Who changed time clocks, pay rates, default rates, and reimbursements
          </p>
        </div>
      </div>

      <AuditFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        action={action}
        onAction={setAction}
        period={period}
        onPeriod={setPeriod}
      />

      <div className="bg-white rounded-xl border border-slate-200 px-4 py-1">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">
            No recorded changes match these filters
          </p>
        ) : (
          entries.map((entry) => (
            <AuditEntryRow key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
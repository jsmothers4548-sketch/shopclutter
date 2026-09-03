import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Phone, Wrench } from 'lucide-react';
import CustomerForm from '@/components/CustomerForm';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, jobsData] = await Promise.all([
        base44.entities.Customer.list('-created_date', 200),
        base44.entities.Job.list(),
      ]);
      setCustomers(customersData);
      setJobs(jobsData);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers
    .filter(
      (c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const getJobCount = (customerId) =>
    jobs.filter((j) => j.customer_id === customerId).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or phone..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div className="space-y-2">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/customers/${c.id}`)}
            className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{c.name}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {c.phone}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                <Wrench className="w-3 h-3" /> {getJobCount(c.id)}
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-10">
            No customers found
          </p>
        )}
      </div>
      {showForm && (
        <CustomerForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
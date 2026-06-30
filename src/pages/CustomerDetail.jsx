import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import ContactButtons from '@/components/ContactButtons';
import CustomerForm from '@/components/CustomerForm';
import StatusBadge from '@/components/StatusBadge';
import JobForm from '@/components/JobForm';
import { ArrowLeft, Edit, Plus, MapPin, StickyNote } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

  const loadData = async () => {
    try {
      const [cust, allJobs] = await Promise.all([
        base44.entities.Customer.get(id),
        base44.entities.Job.filter({ customer_id: id }, '-created_date'),
      ]);
      setCustomer(cust);
      setJobs(allJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!customer) {
    return (
      <p className="text-center py-20 text-slate-400">Customer not found</p>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1 truncate">{customer.name}</h1>
        <button onClick={() => setShowEdit(true)} className="p-2 text-slate-500">
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <ContactButtons phone={customer.phone} email={customer.email} />
        {customer.address && (
          <p className="text-sm text-slate-500 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {customer.address}
          </p>
        )}
        {customer.notes && (
          <p className="text-sm text-slate-600 flex items-start gap-1.5 bg-amber-50 p-2 rounded-lg">
            <StickyNote className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />{' '}
            {customer.notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Job History</h2>
        <button
          onClick={() => setShowJobForm(true)}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="space-y-2">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="w-full text-left bg-white rounded-xl border border-slate-200 p-3 active:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900">
                  {job.equipment_type}
                  {job.make ? ` · ${job.make}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(job.created_date).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
          </button>
        ))}
        {jobs.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-6">No jobs yet</p>
        )}
      </div>

      {showEdit && (
        <CustomerForm
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            loadData();
          }}
        />
      )}
      {showJobForm && (
        <JobForm
          customer={customer}
          onClose={() => setShowJobForm(false)}
          onSaved={(job) => {
            setShowJobForm(false);
            navigate(`/jobs/${job.id}`);
          }}
        />
      )}
    </div>
  );
}
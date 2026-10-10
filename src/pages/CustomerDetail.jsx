import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import ContactButtons from '@/components/ContactButtons';
import CustomerForm from '@/components/CustomerForm';
import StatusBadge from '@/components/StatusBadge';
import JobForm from '@/components/JobForm';
import { ArrowLeft, Edit, Plus, MapPin, AlertTriangle, Trash2, Repeat } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [visits, setVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.Customer.delete(id);
    navigate('/customers');
  };

  const loadData = async () => {
    try {
      const [cust, allJobs, visitCount] = await Promise.all([
        base44.entities.Customer.get(id),
        base44.entities.Job.filter({ customer_id: id }, '-created_date'),
        base44.entities.Job.count({ customer_id: id }),
      ]);
      setCustomer(cust);
      setJobs(allJobs);
      setVisits(visitCount || 0);
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
        <button onClick={() => setShowDelete(true)} className="p-2 text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 shrink-0 text-amber-600" />
          <p className="text-sm font-semibold text-slate-800">
            {visits} visit{visits === 1 ? '' : 's'}
          </p>
          <span className="text-xs text-slate-400">
            Every job ticket counts
          </span>
        </div>
        <ContactButtons phone={customer.phone} email={customer.email} />
        {customer.address && (
          <p className="text-sm text-slate-500 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {customer.address}
          </p>
        )}
        {customer.notes && (
          <div className="flex items-start gap-2 bg-red-50 border-2 border-red-500 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                Customer Instructions
              </p>
              <p className="text-sm font-semibold text-red-700 whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          </div>
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
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {customer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the customer.
              {jobs.length > 0 &&
                ` Their ${jobs.length} job${jobs.length === 1 ? '' : 's'} will stay in your records.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
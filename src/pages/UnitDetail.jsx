import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import ContactButtons from '@/components/ContactButtons';
import JobForm from '@/components/JobForm';
import StatusBadge from '@/components/StatusBadge';
import UnitLabel from '@/components/UnitLabel';
import { ArrowLeft, Plus, Wrench, Printer, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function UnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const deleteUnit = async () => {
    setDeleting(true);
    try {
      await base44.entities.Equipment.delete(id);
      navigate('/units');
    } finally {
      setDeleting(false);
    }
  };

  const loadData = async () => {
    try {
      const unitData = await base44.entities.Equipment.get(id);
      setUnit(unitData);
      const jobsData = await base44.entities.Job.filter(
        { unit_id: id },
        '-created_date'
      );
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      if (unitData.customer_id) {
        try {
          setCustomer(
            await base44.entities.Customer.get(unitData.customer_id)
          );
        } catch {}
      }
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

  if (!unit) {
    return <p className="text-center py-20 text-slate-400">Unit not found</p>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-tight truncate">
            Unit #{unit.label_number}
          </h1>
          <p className="text-sm font-semibold text-amber-600 truncate">
            {unit.customer_name || 'No customer linked'}
          </p>
        </div>
        <button
          onClick={() => setShowJobForm(true)}
          className="flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg text-sm font-semibold active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-600" />
          <p className="font-bold text-slate-900">
            {unit.equipment_type || 'Equipment'}
            {unit.make ? ` · ${unit.make}` : ''}
            {unit.model ? ` ${unit.model}` : ''}
          </p>
        </div>
        {unit.serial_number && (
          <p className="text-xs text-slate-400">SN: {unit.serial_number}</p>
        )}
        {unit.notes && (
          <p className="text-sm text-slate-600">{unit.notes}</p>
        )}
        {customer && (
          <div className="pt-3 border-t border-slate-100">
            <ContactButtons
              phone={customer.phone}
              email={customer.email}
            />
          </div>
        )}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowLabel(true)}
            className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-semibold active:bg-slate-50"
          >
            <Printer className="w-4 h-4" /> Print QR Code
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-bold text-slate-900 mb-3">
          Maintenance History
        </h2>
        <div className="space-y-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="w-full text-left flex items-center justify-between gap-2 p-3 rounded-lg border border-slate-100 active:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {job.problem_description}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(job.created_date).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </button>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No jobs recorded for this unit yet
            </p>
          )}
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-semibold active:bg-red-50"
        >
          <Trash2 className="w-4 h-4" /> Delete Unit
        </button>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Delete this unit?</h3>
            </div>
            <p className="text-sm text-slate-500">
              This removes Unit #{unit.label_number} from your list. Its jobs and
              all of their parts, labor, payments and history are kept.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={deleteUnit}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLabel && (
        <UnitLabel
          labelNumber={unit.label_number}
          onClose={() => setShowLabel(false)}
        />
      )}

      {showJobForm && (
        <JobForm
          customer={customer}
          unit={unit}
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
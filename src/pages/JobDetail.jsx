import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import ContactButtons from '@/components/ContactButtons';
import JobForm from '@/components/JobForm';
import PartForm from '@/components/PartForm';
import LaborForm from '@/components/LaborForm';
import TimelineForm from '@/components/TimelineForm';
import PaymentForm from '@/components/PaymentForm';
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  FileText,
  Receipt,
  Clock,
  Printer,
} from 'lucide-react';
import { computeBilling, computeJobProfit, sumPayments } from '@/lib/billing';
import { useAuth } from '@/lib/AuthContext';

const STATUSES = [
  'Intake',
  'Diagnosed',
  'Estimate Sent',
  'Approved',
  'In Progress',
  'Waiting on Parts',
  'Ready for Pickup',
  'Closed',
];

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [parts, setParts] = useState([]);
  const [labor, setLabor] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showPartForm, setShowPartForm] = useState(false);
  const [activePart, setActivePart] = useState(null);
  const [showLaborForm, setShowLaborForm] = useState(false);
  const [activeLabor, setActiveLabor] = useState(null);
  const [showTimelineForm, setShowTimelineForm] = useState(false);
  const [payments, setPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  const loadData = async () => {
    try {
      const [jobData, partsData, laborData, timelineData, paymentsData] = await Promise.all([
        base44.entities.Job.get(id),
        base44.entities.Part.filter({ job_id: id }),
        base44.entities.LaborEntry.filter({ job_id: id }),
        base44.entities.JobTimeline.filter({ job_id: id }, '-created_date'),
        base44.entities.Payment.filter({ job_id: id }, '-payment_date'),
      ]);
      setJob(jobData);
      setParts(partsData);
      setLabor(laborData);
      setTimeline(timelineData);
      setPayments(paymentsData);
      if (jobData.customer_id) {
        try {
          setCustomer(
            await base44.entities.Customer.get(jobData.customer_id)
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

  const billing = computeBilling({ parts, labor, job });
  const {
    partsTotal,
    laborTotal,
    partsDiscount,
    laborDiscount,
    serviceCallFee,
    subtotal,
    taxAmount,
    grandTotal,
  } = billing;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isClosed = job?.status === 'Closed';
  const canEdit = isAdmin || !isClosed;
  const profitData = computeJobProfit({ parts, labor, job });
  const paidAmount = sumPayments(payments);
  const balanceDue = Math.max(grandTotal - paidAmount, 0);

  const updateStatus = async (newStatus) => {
    await base44.entities.Job.update(job.id, { status: newStatus });
    await Promise.all([
      base44.entities.Part.updateMany(
        { job_id: id },
        { $set: { job_status: newStatus } }
      ),
      base44.entities.LaborEntry.updateMany(
        { job_id: id },
        { $set: { job_status: newStatus } }
      ),
      base44.entities.Payment.updateMany(
        { job_id: id },
        { $set: { job_status: newStatus } }
      ),
    ]);
    await base44.entities.JobTimeline.create({
      job_id: id,
      stage: newStatus,
      notes: `Status changed to ${newStatus}`,
      photo_urls: [],
    });
    loadData();
  };

  const deletePart = async (partId) => {
    await base44.entities.Part.delete(partId);
    setParts(parts.filter((p) => p.id !== partId));
  };

  const deleteLabor = async (laborId) => {
    await base44.entities.LaborEntry.delete(laborId);
    setLabor(labor.filter((l) => l.id !== laborId));
  };

  const deletePayment = async (paymentId) => {
    await base44.entities.Payment.delete(paymentId);
    setPayments(payments.filter((p) => p.id !== paymentId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!job) {
    return <p className="text-center py-20 text-slate-400">Job not found</p>;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">Job Details</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        {canEdit && (
          <button onClick={() => setShowJobForm(true)} className="p-2 text-slate-500">
            <Edit className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status control */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={job.status} />
          <select
            value={job.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={!canEdit}
            className="text-sm rounded-lg border border-slate-200 px-2 py-1.5 bg-white disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer + Equipment info */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        {customer && (
          <ContactButtons phone={customer.phone} email={customer.email} />
        )}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <p className="font-bold text-slate-900">
            {job.equipment_type}
            {job.make ? ` · ${job.make}` : ''}
            {job.model ? ` ${job.model}` : ''}
          </p>
          {job.serial_number && (
            <p className="text-xs text-slate-400">SN: {job.serial_number}</p>
          )}
          <p className="text-sm text-slate-600 mt-2">
            {job.problem_description}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate(`/jobs/${id}/estimate`)}
          className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-slate-50"
        >
          <FileText className="w-4 h-4" /> Estimate
        </button>
        <button
          onClick={() => navigate(`/jobs/${id}/invoice`)}
          className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-slate-50"
        >
          <Receipt className="w-4 h-4" /> Invoice
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Timeline &amp; Photos</h2>
          <button
            onClick={() => setShowTimelineForm(true)}
            className="flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-1.5 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            <Plus className="w-4 h-4" /> Add Note / Photos
          </button>
        </div>
        <div className="space-y-3">
          {timeline.map((entry) => (
            <div key={entry.id} className="border-l-2 border-amber-300 pl-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  {entry.stage || 'Note'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(entry.created_date).toLocaleString()}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
              )}
              {entry.photo_urls?.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {entry.photo_urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      className="w-20 h-20 object-cover rounded-lg shrink-0"
                      alt=""
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {timeline.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No entries yet
            </p>
          )}
        </div>
      </div>

      {/* Parts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center! justify-between mb-3">
          <h2 className="font-bold text-slate-900">Parts</h2>
          {canEdit && (
            <button
              onClick={() => {
                setActivePart(null);
                setShowPartForm(true);
              }}
              className="flex items-center gap-1 text-amber-600 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
        <div className="space-y-2">
          {parts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
            >
              <div
                className={`min-w-0 flex-1 ${canEdit ? 'cursor-pointer' : ''}`}
                onClick={canEdit ? () => {
                  setActivePart(p);
                  setShowPartForm(true);
                } : undefined}
              >
                <p className="text-sm font-medium text-slate-900 truncate">
                  {p.name}
                </p>
                <p className="text-xs text-slate-400">
                  {p.quantity} × ${p.unit_cost.toFixed(2)}
                  {p.part_number ? ` · ${p.part_number}` : ''}
                </p>
              </div>
              <span className="text-sm font-semibold">
                ${(p.quantity * p.unit_cost).toFixed(2)}
              </span>
              {canEdit && (
                <button
                  onClick={() => {
                    setActivePart(p);
                    setShowPartForm(true);
                  }}
                  className="text-slate-400 hover:text-amber-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => deletePart(p.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {parts.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No parts added
            </p>
          )}
        </div>
        {parts.length > 0 && (
          <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
            <span className="text-sm text-slate-500">Parts Total</span>
            <span className="font-bold">${partsTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Labor */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Labor</h2>
          {canEdit && (
            <button
              onClick={() => {
                setActiveLabor(null);
                setShowLaborForm(true);
              }}
              className="flex items-center gap-1 text-amber-600 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
        <div className="space-y-2">
          {labor.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
            >
              <div
                className={`min-w-0 flex-1 ${canEdit ? 'cursor-pointer' : ''}`}
                onClick={canEdit ? () => {
                  setActiveLabor(l);
                  setShowLaborForm(true);
                } : undefined}
              >
                <p className="text-sm font-medium text-slate-900 truncate">
                  {l.description}
                </p>
                <p className="text-xs text-slate-400">
                  {l.hours} hrs × ${l.hourly_rate.toFixed(2)}/hr
                </p>
              </div>
              <span className="text-sm font-semibold">
                ${(l.hours * l.hourly_rate).toFixed(2)}
              </span>
              {canEdit && (
                <button
                  onClick={() => {
                    setActiveLabor(l);
                    setShowLaborForm(true);
                  }}
                  className="text-slate-400 hover:text-amber-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => deleteLabor(l.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {labor.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No labor added
            </p>
          )}
        </div>
        {labor.length > 0 && (
          <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
            <span className="text-sm text-slate-500">Labor Total</span>
            <span className="font-bold">${laborTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Payments */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Payments</h2>
          {canEdit && (
            <button
              onClick={() => {
                setActivePayment(null);
                setShowPaymentForm(true);
              }}
              className="flex items-center gap-1 text-amber-600 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {p.payment_type}
                  {p.method ? ` · ${p.method}` : ''}
                </p>
                <p className="text-xs text-slate-400">
                  {p.payment_date
                    ? new Date(p.payment_date).toLocaleDateString()
                    : ''}
                  {p.notes ? ` · ${p.notes}` : ''}
                </p>
              </div>
              <span className="text-sm font-semibold text-green-600">
                ${p.amount.toFixed(2)}
              </span>
              {canEdit && (
                <button
                  onClick={() => {
                    setActivePayment(p);
                    setShowPaymentForm(true);
                  }}
                  className="text-slate-400 hover:text-amber-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => deletePayment(p.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {payments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No payments recorded
            </p>
          )}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-300">
          <span>Parts</span>
          <span>${partsTotal.toFixed(2)}</span>
        </div>
        {partsDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-400">
            <span>Parts Discount</span>
            <span>−${partsDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-slate-300">
          <span>Labor</span>
          <span>${laborTotal.toFixed(2)}</span>
        </div>
        {laborDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-400">
            <span>Labor Discount</span>
            <span>−${laborDiscount.toFixed(2)}</span>
          </div>
        )}
        {serviceCallFee > 0 && (
          <div className="flex justify-between text-sm text-slate-300">
            <span>Service Call Fee</span>
            <span>${serviceCallFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-300">
          <span>Tax ({job.tax_rate || 0}%)</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
        {paidAmount > 0 && (
          <div className="flex justify-between text-sm text-green-400">
            <span>Payments Received</span>
            <span>−${paidAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
          <span>Balance Due</span>
          <span>${balanceDue.toFixed(2)}</span>
        </div>
      </div>

      {/* Profit Analysis (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <h2 className="font-bold text-slate-900">Profit Analysis</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Revenue</span>
            <span className="font-medium">
              ${profitData.revenue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Parts Cost</span>
            <span className="font-medium text-red-600">
              −${profitData.partsCost.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Labor Cost (wages)</span>
            <span className="font-medium text-red-600">
              −${profitData.laborCost.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
            <span>Net Profit</span>
            <span
              className={
                profitData.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              ${profitData.profit.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showJobForm && (
        <JobForm
          job={job}
          onClose={() => setShowJobForm(false)}
          onSaved={() => {
            setShowJobForm(false);
            loadData();
          }}
        />
      )}
      {showPartForm && (
        <PartForm
          jobId={id}
          jobStatus={job.status}
          part={activePart}
          onClose={() => {
            setShowPartForm(false);
            setActivePart(null);
          }}
          onSaved={() => {
            setShowPartForm(false);
            setActivePart(null);
            loadData();
          }}
        />
      )}
      {showLaborForm && (
        <LaborForm
          jobId={id}
          jobStatus={job.status}
          defaultRate={job.default_labor_rate}
          labor={activeLabor}
          onClose={() => {
            setShowLaborForm(false);
            setActiveLabor(null);
          }}
          onSaved={() => {
            setShowLaborForm(false);
            setActiveLabor(null);
            loadData();
          }}
        />
      )}
      {showPaymentForm && (
        <PaymentForm
          jobId={id}
          jobStatus={job.status}
          payment={activePayment}
          onClose={() => {
            setShowPaymentForm(false);
            setActivePayment(null);
          }}
          onSaved={() => {
            setShowPaymentForm(false);
            setActivePayment(null);
            loadData();
          }}
        />
      )}
      {showTimelineForm && (
        <TimelineForm
          jobId={id}
          stage={job.status}
          onClose={() => setShowTimelineForm(false)}
          onSaved={() => {
            setShowTimelineForm(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
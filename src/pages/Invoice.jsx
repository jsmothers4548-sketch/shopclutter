import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, MessageSquare } from 'lucide-react';
import { computeBilling, sumPayments } from '@/lib/billing';
import { getShopSettings } from '@/lib/shopSettings';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [brand, setBrand] = useState({ name: 'Shop Clutter', logo: '' });

  useEffect(() => {
    getShopSettings()
      .then((s) =>
        setBrand({
          name: s.brand_name || 'Shop Clutter',
          logo: s.brand_logo_url || '',
        })
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      const job = await base44.entities.Job.get(id);
      const [customer, parts, labor, payments, expenses] = await Promise.all([
      base44.entities.Customer.get(job.customer_id),
      base44.entities.Part.filter({ job_id: id }),
      base44.entities.LaborEntry.filter({ job_id: id }),
      base44.entities.Payment.filter({ job_id: id }),
      base44.entities.JobExpense.filter({ job_id: id })]
      );
      setData({ job, customer, parts, labor, payments: Array.isArray(payments) ? payments : [], expenses: Array.isArray(expenses) ? expenses : [] });
    })();
  }, [id]);

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>);

  }

  const { job, customer, parts, labor, payments, expenses } = data;
  const {
    partsTotal,
    laborTotal,
    partsDiscount,
    laborDiscount,
    serviceCallFee,
    subtotal,
    taxAmount,
    grandTotal,
    expensesTotal
  } = computeBilling({ parts, labor, job, expenses });
  const billableExpenses = (expenses || []).filter((e) => e.billable);
  const paymentsTotal = sumPayments(payments);
  const balanceDue = grandTotal - paymentsTotal;

  const handleText = () => {
    const discountTotal = partsDiscount + laborDiscount;
    const msg = `Invoice for ${job.equipment_type} ${job.make || ''} ${job.model || ''}: Parts $${partsTotal.toFixed(2)}, Labor $${laborTotal.toFixed(2)}${discountTotal > 0 ? `, Discount -$${discountTotal.toFixed(2)}` : ''}, Tax $${taxAmount.toFixed(2)}${paymentsTotal > 0 ? `, Paid $${paymentsTotal.toFixed(2)}` : ''}, ${paymentsTotal > 0 ? 'Balance Due' : 'Amount Due'} $${balanceDue.toFixed(2)}. Thank you for your business!`;
    window.location.href = `sms:${customer.phone?.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="p-4 print:p-0">
      <div className="flex items-center gap-2 mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Invoice</h1>
        <button
          onClick={handleText}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
          
          <MessageSquare className="w-4 h-4" /> Text
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold">
          
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto print:max-w-none print:w-full print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            {brand.logo && (
              <img src={brand.logo} alt="Logo" className="h-12 w-12 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">{brand.name}</h1>
              <p className="text-xs text-[hsl(var(--ring))]">Small Engine Repair</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-[hsl(var(--primary))]">INVOICE</h2>
            {job.ticket_number && (
              <p className="text-xs font-semibold text-slate-600">
                Ticket #{job.ticket_number}
              </p>
            )}
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
              Bill To
            </p>
            <p className="font-bold text-slate-900">{customer?.name}</p>
            <p className="text-sm text-slate-500">{customer?.phone}</p>
            {customer?.address &&
            <p className="text-sm text-slate-500">{customer.address}</p>
            }
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
              Equipment
            </p>
            <p className="font-bold text-slate-900">
              {job.equipment_type}
              {job.make ? ` · ${job.make}` : ''}
              {job.model ? ` ${job.model}` : ''}
            </p>
            {job.serial_number &&
            <p className="text-sm text-slate-500">SN: {job.serial_number}</p>
            }
          </div>
        </div>

        {parts.length > 0 &&
        <div className="py-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Parts
            </p>
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-32" />
              </colgroup>
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                  <th className="pb-2 px-2">Part</th>
                  <th className="pb-2 px-2 text-center">Qty</th>
                  <th className="pb-2 px-2 text-right">Unit</th>
                  <th className="pb-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) =>
              <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-3 px-2">
                      {p.name}
                      {p.part_number &&
                  <span className="text-xs text-slate-400 ml-1">
                          ({p.part_number})
                        </span>
                  }
                    </td>
                    <td className="py-3 px-2 text-center">{p.quantity}</td>
                    <td className="py-3 px-2 text-right">
                      ${p.unit_cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      ${(p.quantity * p.unit_cost).toFixed(2)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }

        {labor.length > 0 &&
        <div className="py-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Labor
            </p>
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col />
                <col className="w-20" />
                <col className="w-28" />
                <col className="w-32" />
              </colgroup>
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                  <th className="pb-2 px-2">Description</th>
                  <th className="pb-2 px-2 text-center">Hours</th>
                  <th className="pb-2 px-2 text-right">Rate</th>
                  <th className="pb-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {labor.map((l) =>
              <tr key={l.id} className="border-b border-slate-50">
                    <td className="py-3 px-2">{l.description}</td>
                    <td className="py-3 px-2 text-center">{l.hours}</td>
                    <td className="py-3 px-2 text-right">
                      ${l.hourly_rate.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      ${(l.hours * l.hourly_rate).toFixed(2)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }

        {billableExpenses.length > 0 &&
        <div className="py-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Expenses
            </p>
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                  <th className="pb-2 px-2">Description</th>
                  <th className="pb-2 px-2 w-20 text-right">Markup</th>
                  <th className="pb-2 px-2 w-32 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {billableExpenses.map((e) =>
              <tr key={e.id} className="border-b border-slate-50">
                    <td className="py-3 px-2">{e.description}</td>
                    <td className="py-3 px-2 text-right text-slate-400">
                      {e.markup_percent ? `+${e.markup_percent}%` : '—'}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      ${((e.amount || 0) * (1 + (e.markup_percent || 0) / 100)).toFixed(2)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }

        {payments.length > 0 &&
        <div className="py-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
              Payments
            </p>
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
                  <th className="pb-2 px-2">Date</th>
                  <th className="pb-2 px-2">Type</th>
                  <th className="pb-2 px-2">Method</th>
                  <th className="pb-2 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) =>
              <tr key={p.id} className="border-b border-slate-50">
                    <td className="py-3 px-2">
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3 px-2">{p.payment_type}</td>
                    <td className="py-3 px-2">{p.method}</td>
                    <td className="py-3 px-2 text-right font-medium">
                      ${(p.amount || 0).toFixed(2)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }

        <div className="py-4 space-y-1 ml-auto max-w-[220px]">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Parts</span>
            <span>${partsTotal.toFixed(2)}</span>
          </div>
          {partsDiscount > 0 &&
          <div className="flex justify-between text-sm text-green-600">
              <span>Parts Discount</span>
              <span>−${partsDiscount.toFixed(2)}</span>
            </div>
          }
          <div className="flex justify-between text-sm text-slate-500">
            <span>Labor</span>
            <span>${laborTotal.toFixed(2)}</span>
          </div>
          {laborDiscount > 0 &&
          <div className="flex justify-between text-sm text-green-600">
              <span>Labor Discount</span>
              <span>−${laborDiscount.toFixed(2)}</span>
            </div>
          }
          {serviceCallFee > 0 &&
          <div className="flex justify-between text-sm text-slate-500">
            <span>Service Call Fee</span>
            <span>${serviceCallFee.toFixed(2)}</span>
          </div>
          }
          {expensesTotal > 0 &&
          <div className="flex justify-between text-sm text-slate-500">
            <span>Expenses</span>
            <span>${expensesTotal.toFixed(2)}</span>
          </div>
          }
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Tax ({job.tax_rate || 0}%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          {paymentsTotal > 0 ? (
            <>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Payments Received</span>
                <span>−${paymentsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-1 border-t border-slate-300">
                <span>Balance Due</span>
                <span>${balanceDue.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-1 border-t border-slate-300">
              <span>Amount Due</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          )}
        </div>

        <p className="text-slate-400 mt-4 pt-4 border-t border-slate-100 text-sm">
          Thank you for your business! Payment is due upon pickup.
        </p>
      </div>
    </div>);

}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import SaleForm from '@/components/SaleForm';

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      const [s, its] = await Promise.all([
        base44.entities.Sale.get(id),
        base44.entities.SaleItem.filter({ sale_id: id }),
      ]);
      setSale(s);
      setItems(its);
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
  if (!sale) {
    return <p className="text-center py-20 text-slate-400">Sale not found</p>;
  }

  const lines = items.length
    ? items
    : sale.item_description
      ? [
          {
            description: sale.item_description,
            part_number: sale.part_number,
            quantity: 1,
            unit_price: sale.total_price,
            unit_cost: sale.unit_cost,
          },
        ];

  const qty = (l) => Number(l.quantity) || 1;
  const subtotal = lines.reduce(
    (a, l) => a + qty(l) * (Number(l.unit_price) || 0),
    0
  );
  const taxRate = Number(sale.tax_rate) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = sale.total_price || subtotal + tax;
  const paid = sale.amount_paid || 0;
  const balance = Math.max(total - paid, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 print:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">Sale Details</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="p-2 text-slate-500 print:hidden"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="hidden print:block mb-2">
        <h1 className="text-xl font-bold">Sale — {sale.item_description}</h1>
        <p className="text-sm text-slate-500">
          Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Customer</span>
          <span>{sale.customer_name || 'Walk-in'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Sale Date</span>
          <span>
            {sale.sale_date
              ? new Date(sale.sale_date).toLocaleDateString()
              : '—'}
          </span>
        </div>

        {/* Line items */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-2">Items</p>
          {lines.length > 0 ? (
            <div className="space-y-1.5">
              {lines.map((l, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {l.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {qty(l)} × ${(Number(l.unit_price) || 0).toFixed(2)}
                      {l.part_number ? ` · ${l.part_number}` : ''}
                    </p>
                  </div>
                  <span className="font-semibold shrink-0">
                    ${(qty(l) * (Number(l.unit_price) || 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No items</p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tax ({taxRate}%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Paid</span>
            <span className="text-green-600 font-medium">
              ${paid.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-bold pt-1.5 border-t border-slate-100">
            <span>Balance Due</span>
            <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Status</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              sale.status === 'Paid'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {sale.status}
          </span>
        </div>
        {sale.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Notes</p>
            <p className="text-sm text-slate-700">{sale.notes}</p>
          </div>
        )}
      </div>

      {showForm && (
        <SaleForm
          sale={sale}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            setLoading(true);
            loadData();
          }}
        />
      )}
    </div>
  );
}
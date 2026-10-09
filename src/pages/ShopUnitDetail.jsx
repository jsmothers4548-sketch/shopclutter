import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  AlertTriangle,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import ShopUnitForm from '@/components/ShopUnitForm';
import RecordSaleDialog from '@/components/RecordSaleDialog';
import { useAuth } from '@/lib/AuthContext';

export default function ShopUnitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.ShopUnit.get(id)
      .then(setUnit)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    try {
      await base44.entities.ShopUnit.delete(id);
      navigate('/units');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!unit) {
    return (
      <p className="text-center py-20 text-slate-400">Shop unit not found</p>
    );
  }

  const cost = Number(unit.cost) || 0;
  const price = Number(unit.price) || 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-tight truncate">
            {unit.name}
          </h1>
          <p className="text-sm font-semibold text-amber-600 truncate">
            Shop owned
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold active:bg-slate-50"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
            {unit.condition || 'Used'}
          </span>
          {unit.sold ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              Sold
            </span>
          ) : unit.for_sale ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
              <Tag className="w-3 h-3" /> For sale
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              Not for sale
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">Make / Model</p>
            <p className="font-medium text-slate-900">
              {[unit.make, unit.model].filter(Boolean).join(' ') || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Serial Number</p>
            <p className="font-medium text-slate-900">
              {unit.serial_number || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Your Cost</p>
            <p className="font-medium text-slate-900">${cost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Asking Price</p>
            <p className="font-medium text-slate-900">${price.toFixed(2)}</p>
          </div>
        </div>

        {unit.sold_date && (
          <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
            Sold on {new Date(unit.sold_date).toLocaleDateString()}
          </p>
        )}
        {unit.notes && (
          <p className="text-sm text-slate-600 border-t border-slate-100 pt-3">
            {unit.notes}
          </p>
        )}
      </div>

      {!unit.sold && unit.for_sale && (
        <button
          onClick={() => setShowSale(true)}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 py-3 rounded-lg text-sm font-bold active:bg-amber-600"
        >
          <ShoppingCart className="w-4 h-4" /> Record Sale
        </button>
      )}

      {isAdmin && (
        <button
          onClick={() => setShowDelete(true)}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-semibold active:bg-red-50"
        >
          <Trash2 className="w-4 h-4" /> Delete Unit
        </button>
      )}

      {showForm && (
        <ShopUnitForm
          unit={unit}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {showSale && (
        <RecordSaleDialog
          kind="unit"
          item={unit}
          onClose={() => setShowSale(false)}
          onSaved={() => {
            setShowSale(false);
            load();
          }}
        />
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Delete this unit?</h3>
            </div>
            <p className="text-sm text-slate-500">
              This removes {unit.name} from your shop units. Any sale already
              recorded stays in your sales.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={remove}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
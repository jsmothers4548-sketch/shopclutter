import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tag, Package, ShoppingCart } from 'lucide-react';
import RecordSaleDialog from '@/components/RecordSaleDialog';

export default function ForSalePanel() {
  const [units, setUnits] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [u, i] = await Promise.all([
        base44.entities.ShopUnit.filter({ for_sale: true }, '-created_date', 200),
        base44.entities.ShopItem.filter({ for_sale: true }, '-created_date', 200),
      ]);
      setUnits((Array.isArray(u) ? u : []).filter((x) => !x.sold));
      setItems(
        (Array.isArray(i) ? i : []).filter(
          (x) => (Number(x.stock_quantity) || 0) > 0
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const empty = units.length === 0 && items.length === 0;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Shop-owned equipment and stock marked available for sale.
      </p>

      {empty ? (
        <div className="text-center py-16 text-slate-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            Nothing for sale yet — add a shop unit or mark inventory as for sale
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {units.map((u) => (
            <ForSaleRow
              key={`unit-${u.id}`}
              icon={Package}
              title={[u.name, u.make, u.model].filter(Boolean).join(' · ')}
              subtitle={[u.condition, u.serial_number]
                .filter(Boolean)
                .join(' · ')}
              meta="Shop unit"
              price={Number(u.price) || 0}
              onSell={() => setTarget({ kind: 'unit', item: u })}
            />
          ))}
          {items.map((i) => (
            <ForSaleRow
              key={`item-${i.id}`}
              icon={ShoppingCart}
              title={i.name}
              subtitle={i.part_number ? `#${i.part_number}` : ''}
              meta={`${Number(i.stock_quantity) || 0} in stock`}
              price={Number(i.sale_price) || 0}
              onSell={() => setTarget({ kind: 'stock', item: i })}
            />
          ))}
        </div>
      )}

      {target && (
        <RecordSaleDialog
          kind={target.kind}
          item={target.item}
          onClose={() => setTarget(null)}
          onSaved={() => {
            setTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ForSaleRow({ icon: Icon, title, subtitle, meta, price, onSell }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
      <Icon className="w-5 h-5 text-amber-600 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900 truncate">{title}</p>
        <p className="text-xs text-slate-500 truncate">
          {[subtitle, meta].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-slate-900">${price.toFixed(2)}</p>
        <button
          onClick={onSell}
          className="mt-1 bg-amber-500 text-slate-900 px-2.5 py-1 rounded-lg text-xs font-semibold active:bg-amber-600"
        >
          Record Sale
        </button>
      </div>
    </div>
  );
}
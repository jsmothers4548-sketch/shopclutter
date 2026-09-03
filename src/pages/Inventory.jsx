import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import ShopItemForm from '@/components/ShopItemForm';
import RestockDialog from '@/components/RestockDialog';
import { Plus, Package, AlertTriangle, Trash2, Pencil, PackagePlus, Search } from 'lucide-react';

const CATEGORY_COLORS = {
  'Spark Plugs': 'bg-orange-100 text-orange-700',
  'Filters': 'bg-blue-100 text-blue-700',
  'Oil & Fluids': 'bg-amber-100 text-amber-800',
  'Belts': 'bg-purple-100 text-purple-700',
  'Blades': 'bg-green-100 text-green-700',
  'Hardware': 'bg-slate-100 text-slate-600',
  'Other': 'bg-slate-100 text-slate-600',
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await base44.entities.ShopItem.list('-created_date', 200);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const totalValue = useMemo(() => {
    return items.reduce(
      (sum, i) => sum + (Number(i.stock_quantity) || 0) * (Number(i.unit_cost) || 0),
      0
    );
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(
      (i) =>
        (Number(i.reorder_threshold) || 0) > 0 &&
        (Number(i.stock_quantity) || 0) <= (Number(i.reorder_threshold) || 0)
    ).length;
  }, [items]);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))].sort(),
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => {
      const matchesSearch =
        !q ||
        i.name?.toLowerCase().includes(q) ||
        i.part_number?.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === 'All' || i.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from inventory?`)) return;
    try {
      await base44.entities.ShopItem.delete(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      window.alert('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-20 space-y-3">
          <p className="text-sm text-slate-500">Couldn't load inventory.</p>
          <button
            onClick={() => loadItems()}
            className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Shop Inventory</h1>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-1 bg-amber-500 text-slate-900 px-3 py-2 rounded-lg font-semibold text-sm active:bg-amber-600"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Total Value</p>
          <p className="text-lg font-bold text-slate-900">${totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500">Low Stock</p>
          <p className={`text-lg font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {lowStockCount} {lowStockCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No inventory items yet</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or part number..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? 'All' : cat)
                  }
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-slate-900 border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {filteredItems.map((item) => {
            const stock = Number(item.stock_quantity) || 0;
            const threshold = Number(item.reorder_threshold) || 0;
            const isLow = threshold > 0 && stock <= threshold;
            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {item.part_number && <p className="text-xs text-slate-400">#{item.part_number}</p>}
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other']}`}>
                      {item.category || 'Other'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>{stock}</p>
                    <p className="text-xs text-slate-400">in stock</p>
                  </div>
                </div>
                {isLow && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600 font-medium">
                    <AlertTriangle className="w-3 h-3" /> Low stock — reorder
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">
                    ${(Number(item.unit_cost) || 0).toFixed(2)}/ea
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRestockItem(item)}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold active:bg-green-200"
                    >
                      <PackagePlus className="w-3.5 h-3.5" /> Restock
                    </button>
                    <button
                      onClick={() => { setEditItem(item); setShowForm(true); }}
                      className="p-1.5 rounded-lg text-slate-400 active:bg-slate-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-red-400 active:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          {filteredItems.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-10">
              No items found
            </p>
          )}
        </>
      )}

      {showForm && (
        <ShopItemForm
          item={editItem}
          categories={categories}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); loadItems(); }}
        />
      )}
      {restockItem && (
        <RestockDialog
          item={restockItem}
          onClose={() => setRestockItem(null)}
          onSaved={() => { setRestockItem(null); loadItems(); }}
        />
      )}
    </div>
  );
}
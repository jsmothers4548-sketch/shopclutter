import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Trash2 } from 'lucide-react';

export default function SaleLineEditor({ lines, shopItems, onChange }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matches =
    q &&
    shopItems
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.part_number?.toLowerCase().includes(q)
      )
      .slice(0, 8);

  const setLine = (i, patch) =>
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const addManual = () =>
    onChange([
      ...lines,
      {
        description: '',
        part_number: '',
        quantity: 1,
        unit_price: '',
        unit_cost: '',
        shop_item_id: null,
      },
    ]);

  const addFromInventory = (item) => {
    onChange([
      ...lines,
      {
        description: item.name || '',
        part_number: item.part_number || '',
        quantity: 1,
        unit_price: item.unit_cost ?? '',
        unit_cost: item.unit_cost ?? 0,
        shop_item_id: item.id,
      },
    ]);
    setQuery('');
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="inv-search">Add from inventory</Label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="inv-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts or units in stock…"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {matches && matches.length > 0 && (
          <div className="mt-1.5 border border-slate-200 rounded-md bg-white divide-y divide-slate-100 max-h-44 overflow-y-auto">
            {matches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addFromInventory(item)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-amber-50"
              >
                <span className="min-w-0">
                  <span className="font-medium text-slate-900 truncate block">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.part_number ? `${item.part_number} · ` : ''}
                    {item.stock_quantity ?? 0} in stock
                  </span>
                </span>
                <Plus className="w-4 h-4 text-amber-600 shrink-0" />
              </button>
            ))}
          </div>
        )}
        {query && matches && matches.length === 0 && (
          <p className="text-xs text-slate-400 mt-1.5">
            No inventory match — add it as a manual line below.
          </p>
        )}
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => {
          const lineTotal =
            (Number(line.quantity) || 1) * (Number(line.unit_price) || 0);
          return (
            <div
              key={i}
              className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-2"
            >
              <div className="flex gap-2">
                <Input
                  value={line.description}
                  onChange={(e) => setLine(i, { description: e.target.value })}
                  placeholder={i === 0 ? 'e.g. Used chainsaw, new unit, part…' : 'Description'}
                  required
                />
                <button
                  type="button"
                  onClick={() => onChange(lines.filter((_, idx) => idx !== i))}
                  className="p-2 text-slate-400 hover:text-red-500 shrink-0"
                  aria-label="Remove line"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-slate-500" htmlFor={`qty-${i}`}>
                    Qty
                  </Label>
                  <Input
                    id={`qty-${i}`}
                    type="number"
                    step="1"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => setLine(i, { quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500" htmlFor={`price-${i}`}>
                    Unit Price
                  </Label>
                  <Input
                    id={`price-${i}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.unit_price}
                    onChange={(e) => setLine(i, { unit_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500" htmlFor={`cost-${i}`}>
                    Unit Cost
                  </Label>
                  <Input
                    id={`cost-${i}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.unit_cost}
                    onChange={(e) => setLine(i, { unit_cost: e.target.value })}
                    placeholder="Your cost"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                {line.shop_item_id ? (
                  <span className="text-green-600 font-medium">
                    From inventory — stock deducts on save
                  </span>
                ) : (
                  <span className="text-slate-400">Manual line</span>
                )}
                <span className="font-semibold text-slate-700">
                  ${lineTotal.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addManual}
        className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full justify-center hover:bg-amber-100"
      >
        <Plus className="w-4 h-4" /> Add Manual Line
      </button>
    </div>
  );
}
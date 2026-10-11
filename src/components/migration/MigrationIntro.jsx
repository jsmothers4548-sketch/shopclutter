import React from 'react';
import { CATEGORIES, getCategory } from '@/lib/migration';
import { Users, Boxes, Wrench, Package, ShoppingBag, ChevronRight } from 'lucide-react';

const ICONS = {
  customers: Users,
  equipment: Boxes,
  jobs: Wrench,
  inventory: Package,
  sales: ShoppingBag,
};

export default function MigrationIntro({ onChoose }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">
        Bring your existing records in from a spreadsheet. Pick what you want to
        move over.
      </p>
      {CATEGORIES.map((category) => {
        const Icon = ICONS[category.key] || Package;
        return (
          <button
            key={category.key}
            onClick={() => onChoose(category.key)}
            className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 text-left active:bg-slate-50"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{category.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
              {category.dependsOn?.length > 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  Import {category.dependsOn.map((k) => getCategory(k).label.toLowerCase()).join(', ')} first
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
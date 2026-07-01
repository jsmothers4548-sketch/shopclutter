import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Search, UserPlus, Check, LayoutTemplate, ArrowLeft } from 'lucide-react';
import JobForm from '@/components/JobForm';
import CustomerForm from '@/components/CustomerForm';

export default function JobQuickAdd({ onClose, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [mode, setMode] = useState('customer');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      const data = await base44.entities.Customer.list('name', 200);
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await base44.entities.JobTemplate.list('name', 200);
      setTemplates(data);
    } catch {
      // entity might not be ready yet
    }
  };

  useEffect(() => {
    loadCustomers();
    loadTemplates();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  if (showCustomerForm) {
    return (
      <CustomerForm
        onClose={() => setShowCustomerForm(false)}
        onSaved={async () => {
          setShowCustomerForm(false);
          await loadCustomers();
        }}
      />
    );
  }

  if (showJobForm && selected) {
    return (
      <JobForm
        customer={selected}
        template={selectedTemplate}
        onClose={() => setShowJobForm(false)}
        onSaved={(job) => onSaved(job)}
      />
    );
  }

  // Template selection mode
  if (mode === 'template') {
    return (
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button
                onClick={() => setMode('customer')}
                className="text-slate-400 hover:text-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              Select Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t);
                  setMode('customer');
                }}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.equipment_type}
                  </p>
                </div>
                {selectedTemplate?.id === t.id && (
                  <Check className="w-4 h-4 text-amber-500" />
                )}
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">
                No templates yet — create some in the Templates tab
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Job — Select Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {selectedTemplate && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <LayoutTemplate className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Template: {selectedTemplate.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-amber-400 text-xs hover:text-amber-600"
              >
                Remove
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('template')}
              className="flex items-center justify-center gap-1.5 bg-slate-100 border border-slate-300 text-slate-700 px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-slate-200"
            >
              <LayoutTemplate className="w-4 h-4" /> Template
            </button>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="flex items-center justify-center gap-1.5 bg-amber-50 border border-dashed border-amber-300 text-amber-700 px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-amber-100"
            >
              <UserPlus className="w-4 h-4" /> New Customer
            </button>
          </div>
          <div className="space-y-1 max-h-[40vh] overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(c);
                  setShowJobForm(true);
                }}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 border border-slate-100"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-400">{c.phone}</p>
                </div>
                <Check className="w-4 h-4 text-slate-300" />
              </button>
            ))}
            {filtered.length === 0 && !loading && (
              <p className="text-center text-slate-400 text-sm py-4">
                No customers found
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
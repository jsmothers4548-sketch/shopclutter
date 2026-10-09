import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { withShop } from '@/lib/shopScope';
import { recordAudit, AUDIT_CATEGORIES } from '@/lib/auditLog';

const generateId = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

export default function StaffForm({ staff, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: staff?.name || '',
    employee_id: staff?.employee_id || generateId(),
    phone: staff?.phone || '',
    email: staff?.email || '',
    address: staff?.address || '',
    role_title: staff?.role_title || '',
    pay_rate: staff?.pay_rate ?? 0,
    hire_date: staff?.hire_date || '',
    tax_notes: staff?.tax_notes || '',
    status: staff?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (staff) {
        await base44.entities.Staff.update(staff.id, form);
        const before = Number(staff.pay_rate) || 0;
        const after = Number(form.pay_rate) || 0;
        if (before !== after) {
          await recordAudit({
            category: AUDIT_CATEGORIES.EMPLOYEE_PAY,
            action: 'update',
            target: form.name,
            summary: `Changed pay rate for ${form.name}`,
            details: `$${before.toFixed(2)}/hr → $${after.toFixed(2)}/hr`,
          });
        }
      } else {
        await base44.entities.Staff.create(withShop(form));
        await recordAudit({
          category: AUDIT_CATEGORIES.EMPLOYEE_PAY,
          action: 'create',
          target: form.name,
          summary: `Added employee ${form.name}`,
          details: `Starting pay rate $${(
            Number(form.pay_rate) || 0
          ).toFixed(2)}/hr`,
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {staff ? 'Edit Staff Member' : 'Add Staff Member'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label>Employee ID (for clock-in)</Label>
            <Input
              value={form.employee_id}
              onChange={(e) =>
                setForm({ ...form, employee_id: e.target.value })
              }
              placeholder="4-digit PIN"
            />
          </div>
          <div>
            <Label>Role / Title</Label>
            <Input
              value={form.role_title}
              onChange={(e) =>
                setForm({ ...form, role_title: e.target.value })
              }
              placeholder="Lead Technician"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="john@shop.com"
              />
            </div>
          </div>
          <div>
            <Label>Address (for tax filing)</Label>
            <Input
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              placeholder="123 Main St, City, ST 12345"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Hourly Pay Rate ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.pay_rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pay_rate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Hire Date</Label>
              <Input
                type="date"
                value={form.hire_date}
                onChange={(e) =>
                  setForm({ ...form, hire_date: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Tax Notes</Label>
            <Input
              value={form.tax_notes}
              onChange={(e) =>
                setForm({ ...form, tax_notes: e.target.value })
              }
              placeholder="W-2, 1099, withholding info, etc."
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
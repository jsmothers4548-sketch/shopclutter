import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
import { recordAudit, AUDIT_CATEGORIES } from '@/lib/auditLog';

const describe = (act, ts) =>
  `${act === 'clock_in' ? 'Clock In' : 'Clock Out'} · ${new Date(
    ts
  ).toLocaleString()}`;

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm md:text-sm';

// Date-time-local <-> ISO helpers (local clock time, no timezone suffix).
function toLocalInput(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function TimeClockEntryForm({ entry, onClose, onSaved }) {
  const [action, setAction] = useState(entry.action);
  const [when, setWhen] = useState(toLocalInput(entry.timestamp));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const iso = new Date(when).toISOString();
      await base44.entities.TimeClock.update(entry.id, {
        action,
        timestamp: iso,
        shift_date: when.slice(0, 10),
      });
      const who = entry.staff_name || `employee ${entry.employee_id}`;
      await recordAudit({
        category: AUDIT_CATEGORIES.TIME_CLOCK,
        action: 'update',
        target: entry.staff_name || entry.employee_id || '',
        summary: `Edited clock record for ${who}`,
        details: `${describe(entry.action, entry.timestamp)} → ${describe(
          action,
          iso
        )}`,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Clock Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Action</Label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className={selectClass}
            >
              <option value="clock_in">Clock In</option>
              <option value="clock_out">Clock Out</option>
            </select>
          </div>
          <div>
            <Label>Date &amp; Time</Label>
            <Input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !when}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
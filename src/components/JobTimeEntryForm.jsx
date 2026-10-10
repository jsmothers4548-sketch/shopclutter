import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toLocalInput } from '@/lib/jobTime';
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
import { Textarea } from '@/components/ui/textarea';

// An admin correcting one recorded time entry. The timestamps are edited
// directly, so a missed clock-out or an unrecorded lunch is fixed by moving
// the clock-in and clock-out times.
export default function JobTimeEntryForm({ entry, onClose, onSaved }) {
  const [clockIn, setClockIn] = useState(() => toLocalInput(entry?.clock_in));
  const [clockOut, setClockOut] = useState(() => toLocalInput(entry?.clock_out));
  const [staffName, setStaffName] = useState(entry?.staff_name || '');
  const [note, setNote] = useState(entry?.correction_note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!clockIn) {
      setError('Enter the clock-in time.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await base44.functions.invoke('jobTimeClock', {
        action: 'update_entry',
        entry_id: entry.id,
        clock_in: new Date(clockIn).toISOString(),
        clock_out: clockOut ? new Date(clockOut).toISOString() : '',
        staff_name: staffName.trim(),
        correction_note: note.trim(),
      });
      onSaved();
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || 'That change did not save.'
      );
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="clock-in">Clock In</Label>
            <Input
              id="clock-in"
              type="datetime-local"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clock-out">Clock Out</Label>
            <Input
              id="clock-out"
              type="datetime-local"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              Leave this empty if the timer is still running.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="technician">Technician</Label>
            <Input
              id="technician"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Technician"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Correction Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Why this was changed"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
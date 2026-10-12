import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// The owner's own support details, shared with a user when chat is escalated.
export default function OwnerSupportSettings({ open, onOpenChange }) {
  const [form, setForm] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setSaved(false);
    setError('');
    base44.functions
      .invoke('supportHelp', { action: 'settings_get' })
      .then((res) => {
        if (!active) return;
        const s = res.data?.settings || {};
        setForm({
          contact_name: s.contact_name || '',
          contact_email: s.contact_email || '',
          contact_phone: s.contact_phone || '',
          contact_notes: s.contact_notes || '',
        });
      })
      .catch((e) => active && setError(e.message || 'Could not load your details.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await base44.functions.invoke('supportHelp', { action: 'settings_save', ...form });
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Could not save your details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Support contact details</DialogTitle>
          <DialogDescription>
            Shared with a user when you escalate a chat to direct help.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Name</label>
              <Input value={form.contact_name} onChange={set('contact_name')} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <Input value={form.contact_email} onChange={set('contact_email')} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Phone</label>
              <Input value={form.contact_phone} onChange={set('contact_phone')} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Notes</label>
              <Textarea
                value={form.contact_notes}
                onChange={set('contact_notes')}
                rows={3}
                placeholder="e.g. Best times to call, or how to reach you."
                className="mt-1"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            {saved && <p className="text-xs text-green-600">Saved.</p>}
            <Button onClick={save} disabled={saving} className="w-full">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
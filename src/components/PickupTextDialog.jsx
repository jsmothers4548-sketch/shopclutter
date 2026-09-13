import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildPickupMessage, buildSmsLink } from '@/lib/pickupMessage';

export default function PickupTextDialog({ job, onClose }) {
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [partsData, laborData, paymentsData, expensesData] = await Promise.all([
          base44.entities.Part.filter({ job_id: job.id }),
          base44.entities.LaborEntry.filter({ job_id: job.id }),
          base44.entities.Payment.filter({ job_id: job.id }),
          base44.entities.JobExpense.filter({ job_id: job.id }),
        ]);
        let customerData = null;
        if (job.customer_id) {
          try {
            customerData = await base44.entities.Customer.get(job.customer_id);
          } catch {}
        }
        if (cancelled) return;
        setPhone(customerData?.phone || '');
        setMessage(
          buildPickupMessage({
            job,
            customer: customerData,
            parts: partsData,
            labor: laborData,
            payments: paymentsData,
            expenses: expensesData,
          })
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [job.id]);

  const send = () => {
    window.location.href = buildSmsLink(phone, message);
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" /> Text Customer
          </DialogTitle>
          <DialogDescription>
            Edit the message if needed, then send it from your messaging app.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">To</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Customer phone number"
                inputMode="tel"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Message
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="text-sm"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={send}
            disabled={loading || !phone.trim()}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <MessageSquare className="w-4 h-4" /> Open Messages
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
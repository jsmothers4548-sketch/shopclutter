import React, { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { withShop } from '@/lib/shopScope';

export default function StaffInviteDialog({ onClose, onInvited }) {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const address = email.trim().toLowerCase();
    if (!address) return;
    setSaving(true);
    setError('');
    try {
      await base44.entities.StaffInvite.create(
        withShop({ email: address, status: 'pending' })
      );
      try {
        await base44.users.inviteUser(address, 'user');
      } catch (err) {
        // They may already have an account — the invite still links them to
        // this shop the next time they sign in.
      }
      onInvited();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not send the invitation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Staff Member</DialogTitle>
          <DialogDescription>
            They'll get an email invitation and see this shop's jobs, customers
            and inventory — nothing from any other shop.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tech@yourshop.com"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !email.trim()}>
              {saving ? 'Sending…' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
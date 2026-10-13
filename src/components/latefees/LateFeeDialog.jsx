import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import LateFeePanel from '@/components/latefees/LateFeePanel';

export default function LateFeeDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 max-w-md overflow-hidden rounded-xl">
        <DialogTitle className="sr-only">Late Pickup Fees</DialogTitle>
        <LateFeePanel />
      </DialogContent>
    </Dialog>
  );
}
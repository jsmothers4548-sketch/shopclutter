import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SupportChatDialog from '@/components/support/SupportChatDialog';

// Plainly labeled Live Support entry point shown on the Help Center page.
export default function LiveHelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Live Support</span>
      </button>
      <SupportChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
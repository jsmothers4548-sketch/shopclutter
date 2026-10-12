import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SupportChatDialog from '@/components/support/SupportChatDialog';

// Plainly labeled Live Help entry point shown in the app header.
export default function LiveHelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Live Help</span>
      </button>
      <SupportChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
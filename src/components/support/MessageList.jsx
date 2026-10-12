import React from 'react';
import moment from 'moment';
import { cn } from '@/lib/utils';
import { Bot, Info } from 'lucide-react';

// Shared chat bubbles for the user's Live Help window and the owner's inbox.
// AI replies, owner replies, and system notices are each visually distinct so
// it is always clear who is speaking.
export default function MessageList({ messages, selfRole = 'user' }) {
  if (!messages || messages.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        if (m.sender_role === 'system') {
          return (
            <div key={m.id} className="flex justify-center">
              <div className="max-w-[92%] flex items-start gap-1.5 text-[11px] text-slate-500 bg-white/70 rounded-2xl px-3 py-1.5">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap break-words">{m.body}</span>
              </div>
            </div>
          );
        }

        const mine = m.sender_role === selfRole;
        const isAi = m.sender_role === 'ai';

        return (
          <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                mine
                  ? 'bg-amber-500 text-slate-900'
                  : isAi
                    ? 'bg-white text-slate-800 ring-1 ring-indigo-100'
                    : 'bg-white text-slate-800'
              )}
            >
              {!mine && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-semibold mb-0.5',
                    isAi ? 'text-indigo-600' : 'text-slate-500'
                  )}
                >
                  {isAi && <Bot className="w-3 h-3" />}
                  {m.sender_name || (m.sender_role === 'owner' ? 'Support' : 'User')}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words leading-snug">{m.body}</div>
              <div
                className={cn(
                  'text-[10px] mt-1',
                  mine ? 'text-slate-800/60' : 'text-slate-400'
                )}
              >
                {moment(m.created_date).format('MMM D, h:mm a')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
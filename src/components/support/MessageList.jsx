import React from 'react';
import moment from 'moment';
import { cn } from '@/lib/utils';

// Shared chat bubbles for the user's Live Help window and the owner's inbox.
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
        const mine = m.sender_role === selfRole;
        return (
          <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                mine ? 'bg-amber-500 text-slate-900' : 'bg-white text-slate-800'
              )}
            >
              {!mine && (
                <div className="text-[11px] font-semibold text-slate-500 mb-0.5">
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
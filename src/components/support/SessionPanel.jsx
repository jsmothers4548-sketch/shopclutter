import React from 'react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { CalendarClock, Loader2, CheckCircle2, UserRound } from 'lucide-react';

// The user's side of the human-session flow: request a live session, see the
// earliest it can start, confirm the proposed time, or see it scheduled.
export default function SessionPanel({ conversation, onRequest, onConfirm, busy }) {
  if (!conversation) return null;
  const status = conversation.session_status || 'none';

  const requestedAt = conversation.session_requested_at;
  const earliest = requestedAt
    ? moment(requestedAt).add(24, 'hours')
    : null;

  if (status === 'scheduled' && conversation.session_scheduled_at) {
    return (
      <div className="px-4 py-2.5 bg-green-50 border-t border-green-200 flex items-start gap-2.5">
        <CalendarClock className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
        <div className="text-xs text-green-900">
          Live session scheduled for{' '}
          <span className="font-semibold">
            {moment(conversation.session_scheduled_at).format('ddd, MMM D [at] h:mm a')}
          </span>
          . Be at your computer then and we'll pick up right here.
        </div>
      </div>
    );
  }

  if (status === 'requested' && conversation.session_proposed_at) {
    return (
      <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 flex flex-wrap items-center gap-2">
        <CalendarClock className="w-4 h-4 text-amber-700 shrink-0" />
        <div className="flex-1 text-xs text-amber-900 min-w-[12rem]">
          A live session is proposed for{' '}
          <span className="font-semibold">
            {moment(conversation.session_proposed_at).format('ddd, MMM D [at] h:mm a')}
          </span>
          . Does that work?
        </div>
        <Button size="sm" onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Confirm time
        </Button>
      </div>
    );
  }

  if (status === 'requested') {
    return (
      <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 flex items-start gap-2.5">
        <CalendarClock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          Live session requested. We'll propose a time. The earliest a session can
          start is{' '}
          <span className="font-semibold">
            {earliest ? earliest.format('ddd, MMM D [at] h:mm a') : 'about 24 hours from now'}
          </span>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-t bg-slate-50 flex items-center gap-2">
      <UserRound className="w-4 h-4 text-slate-500 shrink-0" />
      <div className="flex-1 text-[11px] text-slate-600">
        Need a person? Request a live session with a ShopClutter associate.
      </div>
      <Button size="sm" variant="outline" className="bg-white" onClick={onRequest} disabled={busy}>
        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Request session
      </Button>
    </div>
  );
}
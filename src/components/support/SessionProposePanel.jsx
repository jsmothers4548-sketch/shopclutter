import React, { useState } from 'react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarClock, Loader2, CheckCircle2 } from 'lucide-react';

// Owner's side: propose a time for a requested live session. The platform
// enforces a 24-hour minimum lead time from the original request, and so does
// this control.
const toLocalInput = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function SessionProposePanel({ conversation, onPropose, busy }) {
  const [value, setValue] = useState('');

  if (!conversation?.session_requested_at) return null;

  const earliest = moment(conversation.session_requested_at).add(24, 'hours');

  if (conversation.session_status === 'scheduled' && conversation.session_scheduled_at) {
    return (
      <div className="px-4 py-2.5 bg-green-50 border-b border-green-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
        <div className="text-xs text-green-900">
          Live session scheduled for{' '}
          <span className="font-semibold">
            {moment(conversation.session_scheduled_at).format('ddd, MMM D [at] h:mm a')}
          </span>
          .
        </div>
      </div>
    );
  }

  const minValue = toLocalInput(earliest.toDate());

  return (
    <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 space-y-2">
      <div className="flex items-center gap-2 text-xs text-amber-900">
        <CalendarClock className="w-4 h-4 shrink-0" />
        <span>
          Live session requested{' '}
          {moment(conversation.session_requested_at).format('MMM D, h:mm a')}. Earliest
          start:{' '}
          <span className="font-semibold">{earliest.format('ddd, MMM D [at] h:mm a')}</span>.
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="datetime-local"
          value={value}
          min={minValue}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 max-w-[15rem] bg-white"
        />
        <Button
          size="sm"
          disabled={busy || !value}
          onClick={() => onPropose(new Date(value).toISOString())}
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Propose time
        </Button>
      </div>
    </div>
  );
}
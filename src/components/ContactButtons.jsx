import React from 'react';
import { Phone, MessageSquare, Mail } from 'lucide-react';

export default function ContactButtons({ phone, email }) {
  const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
  return (
    <div className="flex gap-2">
      {phone && (
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-green-700 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
      )}
      {phone && (
        <a
          href={`sms:${cleanPhone}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Text
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 text-white px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-slate-800 transition-colors"
        >
          <Mail className="w-4 h-4" />
          Email
        </a>
      )}
    </div>
  );
}
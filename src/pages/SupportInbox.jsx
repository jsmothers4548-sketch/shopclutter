import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import useIsAppOwner from '@/hooks/useIsAppOwner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  ArrowLeft,
  MonitorUp,
  Phone,
  CheckCircle2,
  RefreshCw,
  Settings,
  MessageCircle,
} from 'lucide-react';
import moment from 'moment';
import MessageList from '@/components/support/MessageList';
import OwnerSupportSettings from '@/components/support/OwnerSupportSettings';

export default function SupportInbox() {
  const isOwner = useIsAppOwner();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const loadList = useCallback(async () => {
    const res = await base44.functions.invoke('supportHelp', { action: 'list' });
    setConversations(res.data?.conversations || []);
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    setLoading(true);
    loadList()
      .catch((e) => setError(e.message || 'Could not load conversations.'))
      .finally(() => setLoading(false));
  }, [isOwner, loadList]);

  const openThread = async (conv) => {
    setSelected(conv);
    setThreadLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('supportHelp', {
        action: 'thread',
        conversation_id: conv.id,
      });
      setMessages(res.data?.messages || []);
      setConversations((list) =>
        list.map((c) => (c.id === conv.id ? { ...c, unread_for_owner: false } : c))
      );
    } catch (e) {
      setError(e.message || 'Could not open that conversation.');
    } finally {
      setThreadLoading(false);
    }
  };

  const refreshThread = async () => {
    if (!selected) return;
    const res = await base44.functions.invoke('supportHelp', {
      action: 'thread',
      conversation_id: selected.id,
    });
    setMessages(res.data?.messages || []);
  };

  useEffect(() => {
    if (!selected) return;
    const id = setInterval(() => {
      refreshThread().catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [selected]);

  const act = async (payload, successMsg) => {
    setSending(true);
    setError('');
    try {
      await base44.functions.invoke('supportHelp', payload);
      await refreshThread();
      await loadList();
      return true;
    } catch (e) {
      setError(e.message || 'Could not complete that.');
      return false;
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text || !selected) return;
    const ok = await act({ action: 'reply', conversation_id: selected.id, body: text });
    if (ok) setReply('');
  };

  if (!isOwner) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-sm p-6 text-center">
          <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h1 className="font-semibold text-slate-800">Live Help inbox</h1>
          <p className="text-sm text-slate-500 mt-1">
            This screen is only available to the app owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-600" /> Live Help inbox
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" /> Contact details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadList().catch(() => {})}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : selected ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <button
                onClick={() => {
                  setSelected(null);
                  setMessages([]);
                }}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-800 truncate">
                  {selected.subject}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {selected.user_name || selected.user_email}
                </div>
              </div>
              <span
                className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  selected.status === 'resolved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {selected.status}
              </span>
            </div>

            <div className="max-h-[45vh] overflow-y-auto px-4 py-4 bg-slate-100">
              {threadLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <MessageList messages={messages} selfRole="owner" />
              )}
            </div>

            <div className="px-4 py-3 border-t space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sending}
                  onClick={() =>
                    act({
                      action: 'escalate',
                      conversation_id: selected.id,
                      kind: 'screen_share',
                    })
                  }
                >
                  <MonitorUp className="w-4 h-4" /> Offer screen share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sending}
                  onClick={() =>
                    act({
                      action: 'escalate',
                      conversation_id: selected.id,
                      kind: 'contact',
                    })
                  }
                >
                  <Phone className="w-4 h-4" /> Share contact details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sending}
                  onClick={() =>
                    act({ action: 'resolve', conversation_id: selected.id })
                  }
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark resolved
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="flex-1 resize-none"
                />
                <Button onClick={sendReply} disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-slate-500">
            No live help conversations yet.
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openThread(c)}
                className="w-full text-left bg-white rounded-xl shadow-sm px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800 truncate">
                    {c.subject}
                  </span>
                  {c.unread_for_owner && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                  <span
                    className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      c.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {c.user_name || c.user_email}
                  {c.last_message_at
                    ? ` · ${moment(c.last_message_at).format('MMM D, h:mm a')}`
                    : ''}
                </div>
                {c.last_message_preview && (
                  <div className="text-xs text-slate-600 mt-1 truncate">
                    {c.last_message_preview}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <OwnerSupportSettings open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, MonitorUp, CheckCircle2, Bot } from 'lucide-react';
import MessageList from '@/components/support/MessageList';
import AiActionPrompt from '@/components/support/AiActionPrompt';
import SessionPanel from '@/components/support/SessionPanel';

export default function SupportChatDialog({ open, onOpenChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shopId = user?.shop_id || user?.data?.shop_id;
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [actionBusy, setActionBusy] = useState(null);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const loadThread = useCallback(async (conv) => {
    const page = await base44.entities.SupportMessage.filter(
      { conversation_id: conv.id },
      { sort: 'created_date', limit: 300 }
    );
    setMessages(page.items || []);
    const convPage = await base44.entities.SupportConversation.filter(
      { id: conv.id },
      { limit: 1 }
    );
    const fresh = (convPage.items || [])[0];
    if (fresh) setConversation(fresh);
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const page = await base44.entities.SupportConversation.filter(
          {},
          { sort: '-last_message_at', limit: 1 }
        );
        const conv = (page.items || [])[0] || null;
        if (!active) return;
        setConversation(conv);
        if (conv) await loadThread(conv);
      } catch (e) {
        if (active) setError(e.message || 'Could not load your chat.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, loadThread]);

  useEffect(() => {
    if (!open || !conversation) return;
    const id = setInterval(() => {
      loadThread(conversation).catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, [open, conversation, loadThread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const ask = async (text, withSubject = false) => {
    const body = text.trim();
    if (!body) {
      setError('Type your question first.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('supportHelp', {
        action: 'ask',
        conversation_id: conversation?.id,
        message: body,
        subject: withSubject ? subject.trim() : undefined,
      });
      const conv = res.data?.conversation || conversation;
      if (conv) setConversation(conv);
      setDraft('');
      if (conv) await loadThread(conv);
    } catch (e) {
      setError(e.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  const requestSession = async () => {
    if (!conversation) return;
    setSending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('supportHelp', {
        action: 'request_session',
        conversation_id: conversation.id,
      });
      if (res.data?.conversation) setConversation(res.data.conversation);
      await loadThread(conversation);
    } catch (e) {
      setError(e.message || 'Could not request a session.');
    } finally {
      setSending(false);
    }
  };

  const confirmSession = async () => {
    if (!conversation) return;
    setSending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('supportHelp', {
        action: 'confirm_session',
        conversation_id: conversation.id,
      });
      if (res.data?.conversation) setConversation(res.data.conversation);
      await loadThread(conversation);
    } catch (e) {
      setError(e.message || 'Could not confirm that time.');
    } finally {
      setSending(false);
    }
  };

  const runAction = async (message, action) => {
    if (!conversation) return;
    if (action.type === 'open_page') {
      onOpenChange(false);
      navigate(action.path);
      return;
    }
    setActionBusy(message.id);
    setError('');
    try {
      await base44.functions.invoke('supportHelp', {
        action: 'run_action',
        conversation_id: conversation.id,
        message_id: message.id,
        action_type: action.type,
        title: action.title,
        due_date: action.due_date,
        task_id: action.task_id,
      });
      await loadThread(conversation);
    } catch (e) {
      setError(e.message || 'Could not complete that.');
    } finally {
      setActionBusy(null);
    }
  };

  const acceptScreenShare = async () => {
    if (!conversation) return;
    setSending(true);
    setError('');
    try {
      const patch = { screen_share_status: 'accepted' };
      await base44.entities.SupportConversation.update(conversation.id, patch);
      await base44.entities.SupportMessage.create({
        shop_id: shopId,
        conversation_id: conversation.id,
        user_id: user.id,
        sender_role: 'user',
        sender_name: user.full_name || user.email,
        body: "Yes, I'd like to do a screen-share session. Let me know a good time.",
      });
      setConversation({ ...conversation, ...patch });
      await loadThread(conversation);
    } catch (e) {
      setError(e.message || 'Could not send that.');
    } finally {
      setSending(false);
    }
  };

  const markResolved = async () => {
    if (!conversation) return;
    setSending(true);
    setError('');
    try {
      const patch = { status: 'resolved' };
      await base44.entities.SupportConversation.update(conversation.id, patch);
      await base44.entities.SupportMessage.create({
        shop_id: shopId,
        conversation_id: conversation.id,
        user_id: user.id,
        sender_role: 'user',
        sender_name: user.full_name || user.email,
        body: 'This is resolved now, thank you.',
      });
      setConversation({ ...conversation, ...patch });
      await loadThread(conversation);
    } catch (e) {
      setError(e.message || 'Could not update this chat.');
    } finally {
      setSending(false);
    }
  };

  const showScreenShareOffer =
    conversation &&
    conversation.screen_share_status === 'offered' &&
    conversation.status === 'open';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MonitorUp className="w-4 h-4 text-amber-600" /> Live Help
          </DialogTitle>
          <DialogDescription className="text-xs">
            Our assistant answers right away, and you can request a live session with us
            when you need a person.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : !conversation ? (
          <div className="px-5 py-4 space-y-3 overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-slate-600">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Your message</label>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a question and the assistant will answer."
                rows={5}
                className="mt-1"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button onClick={() => ask(draft, true)} disabled={sending} className="w-full">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 bg-slate-100"
            >
              <MessageList messages={messages} selfRole="user" />
              {messages
                .filter((m) => m.sender_role === 'ai' && m.action_json)
                .slice(-1)
                .map((m) => (
                  <div key={`action-${m.id}`} className="flex justify-start">
                    <div className="max-w-[82%]">
                      <AiActionPrompt
                        message={m}
                        onRun={runAction}
                        running={actionBusy === m.id}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {showScreenShareOffer && (
              <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-center gap-3">
                <MonitorUp className="w-5 h-5 text-amber-700 shrink-0" />
                <div className="flex-1 text-xs text-amber-900">
                  We'd like to set up a screen-share session to help hands-on.
                </div>
                <Button size="sm" onClick={acceptScreenShare} disabled={sending}>
                  Accept
                </Button>
              </div>
            )}

            <SessionPanel
              conversation={conversation}
              onRequest={requestSession}
              onConfirm={confirmSession}
              busy={sending}
            />

            <div className="px-4 py-3 border-t bg-white space-y-2">
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      ask(draft);
                    }
                  }}
                />
                <Button onClick={() => ask(draft)} disabled={sending} size="icon">
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" /> Answers come from our help guides.
                </p>
                {conversation.status === 'resolved' ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Marked resolved
                  </span>
                ) : (
                  <button
                    onClick={markResolved}
                    disabled={sending}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Mark as resolved
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// App-owner-only side of Live Help. Users chat with the owner through the
// SupportConversation / SupportMessage entities (guarded by RLS); this function
// lets the owner read every conversation and escalate with a screen-share offer
// or direct support details. The owner address is a secret, so ownership is
// decided here, never on the client.

async function getSettings(sr: any) {
  const rows = await sr.entities.SupportSettings.list('-created_date', 1);
  return (
    (rows || [])[0] || {
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      contact_notes: '',
    }
  );
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }
    if (!user) {
      return Response.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const ownerEmail = String(secrets.get('APP_OWNER_EMAIL') || '').trim().toLowerCase();
    const callerEmail = String(user.email || '').trim().toLowerCase();
    const isOwner = !!ownerEmail && callerEmail === ownerEmail;

    const body = await req.json().catch(() => ({}));
    const action = body?.action || 'check';

    if (action === 'check') {
      return Response.json({ isOwner });
    }

    if (!isOwner) {
      return Response.json(
        { error: 'This screen is only available to the app owner.' },
        { status: 403 }
      );
    }

    const sr = base44.asServiceRole;
    const now = new Date().toISOString();

    if (action === 'list') {
      const conversations = await sr.entities.SupportConversation.list('-last_message_at', 200);
      return Response.json({ conversations: conversations || [] });
    }

    if (action === 'thread') {
      const id = body?.conversation_id;
      if (!id) return Response.json({ error: 'Missing conversation.' }, { status: 400 });
      const conversation = await sr.entities.SupportConversation.get(id).catch(() => null);
      if (!conversation) {
        return Response.json({ error: 'That conversation no longer exists.' }, { status: 404 });
      }
      const page = await sr.entities.SupportMessage.filter(
        { conversation_id: id },
        { sort: 'created_date', limit: 300 }
      );
      await sr.entities.SupportConversation.update(id, { unread_for_owner: false });
      return Response.json({
        conversation: { ...conversation, unread_for_owner: false },
        messages: page?.items || [],
      });
    }

    if (action === 'reply') {
      const id = body?.conversation_id;
      const text = String(body?.body || '').trim();
      if (!id || !text) return Response.json({ error: 'Missing message.' }, { status: 400 });
      await sr.entities.SupportMessage.create({
        conversation_id: id,
        sender_role: 'owner',
        sender_name: 'Shop Clutter Support',
        body: text,
      });
      await sr.entities.SupportConversation.update(id, {
        last_message_at: now,
        last_message_preview: text.slice(0, 120),
        unread_for_user: true,
        unread_for_owner: false,
        status: 'open',
      });
      return Response.json({ ok: true });
    }

    if (action === 'escalate') {
      const id = body?.conversation_id;
      const kind = body?.kind;
      if (!id) return Response.json({ error: 'Missing conversation.' }, { status: 400 });

      if (kind === 'screen_share') {
        const note = String(body?.note || '').trim();
        const text =
          note ||
          "It looks like we should look at this together. May we set up a screen-share session? If you accept, we'll arrange a time where you share your screen with us. You stay in control and can stop sharing at any time.";
        await sr.entities.SupportConversation.update(id, {
          screen_share_status: 'offered',
          last_message_at: now,
          last_message_preview: text.slice(0, 120),
          unread_for_user: true,
          status: 'open',
        });
        await sr.entities.SupportMessage.create({
          conversation_id: id,
          sender_role: 'owner',
          sender_name: 'Shop Clutter Support',
          body: text,
        });
        return Response.json({ ok: true });
      }

      if (kind === 'contact') {
        const settings = await getSettings(sr);
        const lines = [
          'Here are our direct support details so we can help you hands-on:',
          settings.contact_name ? `Name: ${settings.contact_name}` : null,
          settings.contact_email ? `Email: ${settings.contact_email}` : null,
          settings.contact_phone ? `Phone: ${settings.contact_phone}` : null,
          settings.contact_notes ? String(settings.contact_notes) : null,
        ].filter(Boolean);
        const text = lines.join('\n');
        await sr.entities.SupportConversation.update(id, {
          contact_shared: true,
          last_message_at: now,
          last_message_preview: text.slice(0, 120),
          unread_for_user: true,
          status: 'open',
        });
        await sr.entities.SupportMessage.create({
          conversation_id: id,
          sender_role: 'owner',
          sender_name: 'Shop Clutter Support',
          body: text,
        });
        return Response.json({ ok: true });
      }

      return Response.json({ error: 'Unknown escalation.' }, { status: 400 });
    }

    if (action === 'resolve') {
      const id = body?.conversation_id;
      if (!id) return Response.json({ error: 'Missing conversation.' }, { status: 400 });
      await sr.entities.SupportConversation.update(id, { status: 'resolved' });
      return Response.json({ ok: true });
    }

    if (action === 'settings_get') {
      const settings = await getSettings(sr);
      return Response.json({ settings });
    }

    if (action === 'settings_save') {
      const patch = {
        contact_name: String(body?.contact_name || '').trim(),
        contact_email: String(body?.contact_email || '').trim(),
        contact_phone: String(body?.contact_phone || '').trim(),
        contact_notes: String(body?.contact_notes || '').trim(),
      };
      const existing = (await sr.entities.SupportSettings.list('-created_date', 1))[0];
      if (existing) {
        await sr.entities.SupportSettings.update(existing.id, patch);
      } else {
        await sr.entities.SupportSettings.create(patch);
      }
      return Response.json({ settings: patch });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    console.error('supportHelp failed', error?.message);
    return Response.json(
      { error: error?.message || 'Could not complete that request.' },
      { status: 500 }
    );
  }
}
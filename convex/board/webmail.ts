// Webmail module for the board's /inbox page. Powers the 3-pane
// reader (folder | list | reader) + compose/reply/send + folder
// ops (star, archive, trash). Unifies email_inbox (Purelymail
// inbound) and email_sends (Resend outbound) into a single
// WebmailMessage shape.
//
// Per-message operator state (folder, starred, lastReadAt) lives in
// email_message_state (key=`${type}:${id}`). Default folder is
// 'inbox' for email_inbox rows and 'sent' for email_sends rows.
//
// Send goes through Resend directly (api.resend.com/emails) using
// RESEND_API_KEY from server env, FROM_ADDRESS_BOARD (Jake) to keep
// a clear operator/persona split from Blando's mass-mail FROM.
//
// Per ADR-007, this file is the single source of truth; the website
// repo mirrors it under emvy-website-v2/convex/board/webmail.ts
// and deploys.

import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from '../_generated/server';
import { api, internal } from '../_generated/api';
import { v } from 'convex/values';

const RESEND_API = 'https://api.resend.com/emails';
const FROM_ADDRESS = process.env.OUTREACH_FROM_EMAIL_BOARD ?? 'jake@emvyai.com';
const REPLY_TO = process.env.OUTREACH_REPLY_TO ?? 'hello@emvyai.com';
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;

export const FOLDERS = ['inbox', 'sent', 'starred', 'archive', 'trash', 'drafts'] as const;
export type Folder = (typeof FOLDERS)[number];

const folderLiteral = v.union(
  v.literal('inbox'),
  v.literal('sent'),
  v.literal('starred'),
  v.literal('archive'),
  v.literal('trash'),
  v.literal('drafts'),
);

export type WebmailMessage = {
  id: string;                // `${type}:${rowId}`
  type: 'inbox' | 'sent';
  rowId: string;
  from: string;
  fromAddress: string;
  to: string;
  subject: string;
  body: string;
  htmlBody: string | null;
  receivedAt: number;
  folder: Folder;
  starred: boolean;
  lastReadAt: number | null;
  isUnread: boolean;
  resendId?: string;
  status?: string;
  leadId?: string;
};

export function makeKey(type: 'inbox' | 'sent', id: string) {
  return `${type}:${id}`;
}

function parseKey(id: string): { type: 'inbox' | 'sent'; id: string } | null {
  const idx = id.indexOf(':');
  if (idx <= 0) return null;
  const type = id.slice(0, idx);
  const rest = id.slice(idx + 1);
  if ((type === 'inbox' || type === 'sent') && rest.length > 0) {
    return { type, id: rest };
  }
  return null;
}

function defaultFolderFor(type: 'inbox' | 'sent'): Folder {
  return type === 'inbox' ? 'inbox' : 'sent';
}

function toMessage(
  type: 'inbox' | 'sent',
  row: any,
  folder: Folder,
  starred: boolean,
  lastReadAt: number | null,
): WebmailMessage {
  if (type === 'inbox') {
    return {
      id: makeKey('inbox', row._id),
      type: 'inbox',
      rowId: row._id,
      from: row.from ?? row.fromAddress ?? '',
      fromAddress: row.fromAddress ?? '',
      to: row.to ?? '',
      subject: row.subject ?? '(no subject)',
      body: row.body ?? '',
      htmlBody: row.htmlBody ?? null,
      receivedAt: row.receivedAt,
      folder,
      starred,
      lastReadAt,
      isUnread: !lastReadAt,
      status: row.status,
      leadId: row.leadId,
    };
  }
  return {
    id: makeKey('sent', row._id),
    type: 'sent',
    rowId: row._id,
    from: FROM_ADDRESS,
    fromAddress: FROM_ADDRESS,
    to: row.to ?? '',
    subject: row.subject ?? '(no subject)',
    body: row.body ?? '',
    htmlBody: null,
    receivedAt: row.sentAt,
    folder,
    starred,
    lastReadAt,
    isUnread: !lastReadAt,
    resendId: row.resendId,
    status: row.status,
    leadId: row.leadId,
  };
}

// ---------- queries ----------

export const folderCounts = query({
  args: {},
  handler: async (ctx) => {
    const stateRows = await ctx.db.query('email_message_state').collect();
    const stateByKey = new Map(stateRows.map((r) => [r.key, r]));

    const inbox = await ctx.db.query('email_inbox').order('desc').take(1000);
    const sent = await ctx.db.query('email_sends').order('desc').take(1000);

    const counts: Record<Folder, { total: number; unread: number }> = {
      inbox: { total: 0, unread: 0 },
      sent: { total: 0, unread: 0 },
      starred: { total: 0, unread: 0 },
      archive: { total: 0, unread: 0 },
      trash: { total: 0, unread: 0 },
      drafts: { total: 0, unread: 0 },
    };

    for (const row of inbox) {
      const key = makeKey('inbox', row._id);
      const state = stateByKey.get(key);
      const folder: Folder = ((state?.folder as Folder) || defaultFolderFor('inbox')) as Folder;
      const unread = !state?.lastReadAt;
      if (counts[folder]) {
        counts[folder].total++;
        if (unread) counts[folder].unread++;
      }
      if (state?.starred) {
        counts.starred.total++;
        if (unread) counts.starred.unread++;
      }
    }
    for (const row of sent) {
      const key = makeKey('sent', row._id);
      const state = stateByKey.get(key);
      const folder: Folder = ((state?.folder as Folder) || defaultFolderFor('sent')) as Folder;
      const unread = !state?.lastReadAt;
      if (counts[folder]) {
        counts[folder].total++;
        if (unread) counts[folder].unread++;
      }
      if (state?.starred) {
        counts.starred.total++;
        if (unread) counts.starred.unread++;
      }
    }
    return counts;
  },
});

export const list = query({
  args: {
    folder: folderLiteral,
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, { folder, search, limit, before }) => {
    const take = Math.min(limit ?? DEFAULT_LIST_LIMIT, MAX_LIST_LIMIT);
    const stateRows = await ctx.db.query('email_message_state').collect();
    const stateByKey = new Map(stateRows.map((r) => [r.key, r]));

    const includeInbox = folder !== 'sent' && folder !== 'drafts';
    const includeSent = folder !== 'inbox' && folder !== 'drafts';

    const inboxRows = includeInbox
      ? await ctx.db.query('email_inbox').order('desc').take(1000)
      : [];
    const sentRows = includeSent
      ? await ctx.db.query('email_sends').order('desc').take(1000)
      : [];

    const messages: WebmailMessage[] = [];
    for (const row of inboxRows) {
      const key = makeKey('inbox', row._id);
      const state = stateByKey.get(key);
      const rowFolder: Folder = ((state?.folder as Folder) || defaultFolderFor('inbox')) as Folder;
      if (folder === 'starred') {
        if (!state?.starred) continue;
      } else if (rowFolder !== folder) {
        continue;
      }
      if (before && row.receivedAt >= before) continue;
      messages.push(toMessage('inbox', row, rowFolder, state?.starred ?? false, state?.lastReadAt ?? null));
    }
    for (const row of sentRows) {
      const key = makeKey('sent', row._id);
      const state = stateByKey.get(key);
      const rowFolder: Folder = ((state?.folder as Folder) || defaultFolderFor('sent')) as Folder;
      if (folder === 'starred') {
        if (!state?.starred) continue;
      } else if (rowFolder !== folder) {
        continue;
      }
      if (before && row.sentAt >= before) continue;
      messages.push(toMessage('sent', row, rowFolder, state?.starred ?? false, state?.lastReadAt ?? null));
    }
    messages.sort((a, b) => b.receivedAt - a.receivedAt);

    const filtered = search
      ? messages.filter((m) => {
          const q = search.toLowerCase();
          return (
            m.subject.toLowerCase().includes(q) ||
            m.from.toLowerCase().includes(q) ||
            m.fromAddress.toLowerCase().includes(q) ||
            m.body.toLowerCase().includes(q)
          );
        })
      : messages;

    return filtered.slice(0, take);
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const parsed = parseKey(id);
    if (!parsed) return null;
    const state = await ctx.db
      .query('email_message_state')
      .withIndex('by_key', (q) => q.eq('key', id))
      .first();
    const row = await ctx.db.get(parsed.id as any);
    if (!row) return null;
    return toMessage(parsed.type, row, (state?.folder as Folder) || defaultFolderFor(parsed.type), state?.starred ?? false, state?.lastReadAt ?? null);
  },
});

// ---------- mutations ----------

export const markRead = mutation({
  args: { id: v.string(), read: v.optional(v.boolean()) },
  handler: async (ctx, { id, read }) => {
    const parsed = parseKey(id);
    if (!parsed) throw new Error(`Invalid id: ${id}`);
    const now = Date.now();
    const lastReadAt = read === false ? undefined : now;
    const existing = await ctx.db
      .query('email_message_state')
      .withIndex('by_key', (q) => q.eq('key', id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { lastReadAt, updatedAt: now });
    } else {
      await ctx.db.insert('email_message_state', {
        key: id,
        folder: defaultFolderFor(parsed.type),
        starred: false,
        lastReadAt,
        updatedAt: now,
      });
    }
  },
});

export const toggleStar = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const parsed = parseKey(id);
    if (!parsed) throw new Error(`Invalid id: ${id}`);
    const now = Date.now();
    const existing = await ctx.db
      .query('email_message_state')
      .withIndex('by_key', (q) => q.eq('key', id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { starred: !existing.starred, updatedAt: now });
      return !existing.starred;
    }
    await ctx.db.insert('email_message_state', {
      key: id,
      folder: defaultFolderFor(parsed.type),
      starred: true,
      updatedAt: now,
    });
    return true;
  },
});

export const moveTo = mutation({
  args: { id: v.string(), folder: folderLiteral },
  handler: async (ctx, { id, folder }) => {
    const parsed = parseKey(id);
    if (!parsed) throw new Error(`Invalid id: ${id}`);
    const now = Date.now();
    const existing = await ctx.db
      .query('email_message_state')
      .withIndex('by_key', (q) => q.eq('key', id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { folder, updatedAt: now });
    } else {
      await ctx.db.insert('email_message_state', {
        key: id,
        folder,
        starred: false,
        updatedAt: now,
      });
    }
  },
});

// ---------- internals ----------

export const findLeadByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const row = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
    return row?._id ?? null;
  },
});

export const getRawMessage = internalQuery({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const parsed = parseKey(id);
    if (!parsed) return null;
    if (parsed.type === 'inbox') {
      const row = await ctx.db.get(parsed.id as any) as any;
      if (!row) return null;
      return {
        type: 'inbox' as const,
        from: row.from,
        fromAddress: row.fromAddress,
        to: row.to,
        subject: row.subject ?? '',
        body: row.body ?? '',
        messageId: row.messageId,
      };
    }
    const row = await ctx.db.get(parsed.id as any) as any;
    if (!row) return null;
    return {
      type: 'sent' as const,
      from: FROM_ADDRESS,
      fromAddress: FROM_ADDRESS,
      to: row.to,
      subject: row.subject ?? '',
      body: row.body ?? '',
      messageId: row.resendId,
    };
  },
});

export const markReadRaw = internalMutation({
  args: { id: v.string(), read: v.boolean() },
  handler: async (ctx, { id, read }) => {
    const parsed = parseKey(id);
    if (!parsed) return;
    const now = Date.now();
    const lastReadAt = read ? now : undefined;
    const existing = await ctx.db
      .query('email_message_state')
      .withIndex('by_key', (q) => q.eq('key', id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { lastReadAt, updatedAt: now });
    } else {
      await ctx.db.insert('email_message_state', {
        key: id,
        folder: defaultFolderFor(parsed.type),
        starred: false,
        lastReadAt,
        updatedAt: now,
      });
    }
  },
});

export const upsertState = internalMutation({
  args: {
    key: v.string(),
    folder: v.string(),
    starred: v.boolean(),
    lastReadAt: v.optional(v.number()),
  },
  handler: async (ctx, { key, folder, starred, lastReadAt }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('email_message_state')
      .withIndex('by_key', (q) => q.eq('key', key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { folder, starred, lastReadAt, updatedAt: now });
    } else {
      await ctx.db.insert('email_message_state', { key, folder, starred, lastReadAt, updatedAt: now });
    }
  },
});

// Record an outbound send. Only succeeds if we can link to a lead —
// operator ad-hoc sends without a matching lead are intentionally
// not persisted to email_sends (which has a non-nullable leadId FK).
// Falls back to logging the activity only.
export const recordOperatorSend = internalMutation({
  args: {
    leadId: v.union(v.id('leads'), v.null()),
    subject: v.string(),
    sentAt: v.number(),
    resendId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, { leadId, subject, sentAt, resendId, status }) => {
    if (!leadId) {
      // No matching lead — skip the FK-bound row. Return empty id.
      return null;
    }
    const id = await ctx.db.insert('email_sends', {
      leadId,
      subject,
      status,
      sentAt,
      resendId,
    });
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'operator_send',
      details: subject,
      timestamp: sentAt,
    });
    return id;
  },
});

export const markSendFailed = internalMutation({
  args: { sendId: v.union(v.id('email_sends'), v.null()), error: v.string() },
  handler: async (ctx, { sendId, error }) => {
    if (sendId) await ctx.db.patch(sendId, { status: 'failed', lastError: error });
  },
});

export const markSendSent = internalMutation({
  args: { sendId: v.union(v.id('email_sends'), v.null()), resendId: v.optional(v.string()) },
  handler: async (ctx, { sendId, resendId }) => {
    if (sendId && resendId) await ctx.db.patch(sendId, { resendId });
  },
});

// ---------- actions (public — called from the UI) ----------

function wrapHtml(body: string): string {
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const paras = escaped.split(/\n{2,}/).map((p) =>
    `<p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;">${p.replace(/\n/g, '<br/>')}</p>`,
  );
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#ffffff;">${paras.join('')}</body></html>`;
}

// Public send: operator-to-anyone. Goes via Resend, records to
// email_sends if a matching lead exists, otherwise just activity_log.
export const send = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    inReplyTo: v.optional(v.string()),
  },
  handler: async (ctx, { to, subject, body, inReplyTo }): Promise<{ ok: boolean; sendId: string | null; resendId?: string; error?: string }> => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return { ok: false, sendId: null, error: 'RESEND_API_KEY not configured' };
    }
    const now = Date.now();
    const leadMatch = await ctx.runQuery(internal.board.webmail.findLeadByEmail, { email: to });
    const sendId = await ctx.runMutation(internal.board.webmail.recordOperatorSend, {
      leadId: leadMatch,
      subject,
      sentAt: now,
      status: 'pending',
    });

    const html = wrapHtml(body);
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to,
        reply_to: REPLY_TO,
        subject,
        text: body,
        html,
        headers: {
          'X-Operator-Send': '1',
          'X-Webmail-Send': '1',
          ...(inReplyTo ? { 'In-Reply-To': inReplyTo } : {}),
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown');
      await ctx.runMutation(internal.board.webmail.markSendFailed, { sendId, error: errText });
      return { ok: false, sendId, error: `Resend ${res.status}: ${errText.slice(0, 200)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    await ctx.runMutation(internal.board.webmail.markSendSent, { sendId, resendId: json.id });

    if (sendId) {
      const key = makeKey('sent', sendId);
      await ctx.runMutation(internal.board.webmail.upsertState, {
        key,
        folder: 'sent',
        starred: false,
        lastReadAt: now,
      });
    }
    return { ok: true, sendId, resendId: json.id };
  },
});

// Reply: load original, prefill to/subject/quoted body, send via Resend.
export const reply = action({
  args: {
    messageId: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { messageId, body }): Promise<{ ok: boolean; sendId: string | null; resendId?: string; error?: string }> => {
    const original = await ctx.runQuery(internal.board.webmail.getRawMessage, { id: messageId });
    if (!original) return { ok: false, sendId: null, error: 'message not found' };

    await ctx.runMutation(internal.board.webmail.markReadRaw, { id: messageId, read: true });

    const subject = original.subject.startsWith('Re: ') ? original.subject : `Re: ${original.subject || '(no subject)'}`;
    const to = original.type === 'inbox' ? original.fromAddress : original.to;
    const quoted = body + (body.endsWith('\n') ? '' : '\n') + `\n\nOn ${new Date().toISOString()}, ${original.from} wrote:\n> ${original.body.replace(/\n/g, '\n> ')}`;

    // Call public send via the api surface to avoid self-reference.
    return await ctx.runAction(api.board.webmail.send, {
      to,
      subject,
      body: quoted,
      inReplyTo: original.type === 'inbox' ? original.messageId : undefined,
    });
  },
});
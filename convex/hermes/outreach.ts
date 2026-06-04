// Hermes function surface for outreach (email_drafts + email_sends).
//
// Public surface (requires Bearer token):
// - createDraft — Hermes writes a draft
// - approveDraft — operator approves (operator actor)
// - logSend — operator logs a manual send
// - autoSend — Hermes fires Resend + logs + schedules follow-ups (NEW for 40/day)
// - cancelFollowups — stops the sequence on reply/bounce/unsubscribe
//
// Internal mutations (no token, called from autoSend / webhooks / runner):
// - recordAutoSend — writes email_sends + activity_log
// - scheduleFollowups — creates outreach_followups rows for touch 2/3
// - markQueueItem — updates outreach_queue status
// - suppressForReply — flips queue + followups to suppressed on inbound reply
//
// All Hermes writes carry `actor: 'hermes'` (or 'operator' for human-gated
// actions like approveDraft and logSend, which the operator triggers after
// Dusk reviews/sends). See Glossary + data flow doc for the manual gates.

import { action, internalMutation, internalQuery, mutation } from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { requireHermes } from '../hermesAuth'

const RESEND_API = 'https://api.resend.com/emails'
const FROM_ADDRESS =
  process.env.OUTREACH_FROM_EMAIL ??
  process.env.BREVO_SENDER_EMAIL ??
  'hello@emvyai.com'
const REPLY_TO = process.env.OUTREACH_REPLY_TO ?? 'hello@emvyai.com'
const TOUCH_GAP_MS = (days: number) => days * 24 * 60 * 60 * 1000

export const createDraft = mutation({
  args: {
    token: v.string(),
    leadId: v.id('leads'),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, leadId, subject, body } = args
    const now = Date.now()
    const id = await ctx.db.insert('email_drafts', {
      leadId,
      subject,
      body,
      status: 'draft',
      createdAt: now,
    })
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'draft_created',
      actor: 'hermes',
      details: subject,
      timestamp: now,
    })
    return id
  },
})

export const approveDraft = mutation({
  args: {
    token: v.string(),
    id: v.id('email_drafts'),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, id } = args
    const draft = await ctx.db.get(id)
    if (!draft) throw new Error('Draft not found')
    if (draft.status === 'approved' || draft.status === 'sent') {
      return { ok: true, noop: true }
    }
    const now = Date.now()
    await ctx.db.patch(id, { status: 'approved' })
    if (draft.leadId) {
      await ctx.db.insert('activity_log', {
        leadId: draft.leadId,
        action: 'draft_approved',
        actor: 'operator',
        details: draft.subject,
        timestamp: now,
      })
    }
    return { ok: true }
  },
})

export const logSend = mutation({
  args: {
    token: v.string(),
    leadId: v.id('leads'),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, leadId, subject } = args
    const now = Date.now()
    const id = await ctx.db.insert('email_sends', {
      leadId,
      subject,
      status: 'sent',
      sentAt: now,
    })
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'email_sent',
      actor: 'operator',
      details: subject,
      timestamp: now,
    })
    const lead = await ctx.db.get(leadId)
    if (lead) {
      const current = lead.stage ?? 'discover'
      const patch: Record<string, unknown> = { lastTouchpoint: 'email_sent' }
      if (['discover', 'engaged', 'qualified'].includes(current)) {
        patch.stage = 'contacted'
      }
      await ctx.db.patch(leadId, patch)
    }
    return id
  },
})

// Public action: Hermes fires the send itself, without operator gate.
// Used by the daily runner to pump 40/day.
export const autoSend = action({
  args: {
    token: v.string(),
    queueId: v.id('outreach_queue'),
    subject: v.string(),
    body: v.string(),
    touch: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; noop?: boolean; reason?: string; sendId?: string; resendId?: string; touch: number }> => {
    requireHermes(args.token)
    const queue = await ctx.runQuery(internal.hermes.outreach.getQueueItem, {
      id: args.queueId,
    })
    if (!queue) throw new Error(`Queue item not found: ${args.queueId}`)
    if (queue.status === 'sent' || queue.status === 'suppressed') {
      return { ok: true, noop: true, reason: queue.status, touch: args.touch ?? 1 }
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      await ctx.runMutation(internal.hermes.outreach.markQueueItem, {
        id: args.queueId,
        status: 'failed',
        lastError: 'RESEND_API_KEY not configured',
      })
      throw new Error('RESEND_API_KEY not configured on server')
    }

    const html = args.body.replace(/\n/g, '<br/>')
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: queue.email,
        reply_to: REPLY_TO,
        subject: args.subject,
        text: args.body,
        html,
        headers: {
          'X-Outreach-Touch': String(args.touch ?? 1),
          'X-Queue-Id': String(args.queueId),
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      await ctx.runMutation(internal.hermes.outreach.markQueueItem, {
        id: args.queueId,
        status: 'failed',
        lastError: `Resend ${res.status}: ${errText.slice(0, 200)}`,
      })
      throw new Error(`Resend send failed: ${res.status} ${errText}`)
    }

    const json = (await res.json()) as { id?: string }
    const resendId = json.id

    const sendId = await ctx.runMutation(internal.hermes.outreach.recordAutoSend, {
      queueId: args.queueId,
      leadId: queue.leadId ?? undefined,
      subject: args.subject,
      body: args.body,
      resendId,
      touch: args.touch ?? 1,
    })

    if ((args.touch ?? 1) === 1) {
      await ctx.runMutation(internal.hermes.outreach.scheduleFollowups, {
        queueId: args.queueId,
        leadId: queue.leadId,
      })
    }

    return { ok: true, sendId, resendId, touch: args.touch ?? 1 }
  },
})

export const cancelFollowups = mutation({
  args: {
    token: v.string(),
    leadId: v.id('leads'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, leadId, reason } = args
    const pending = await ctx.db
      .query('outreach_followups')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect()
    const now = Date.now()
    for (const f of pending) {
      if (f.status === 'scheduled') {
        await ctx.db.patch(f._id, {
          status: 'cancelled',
          cancelledReason: reason,
        })
      }
    }
    const queue = await ctx.db
      .query('outreach_queue')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect()
    for (const q of queue) {
      if (q.status === 'queued' || q.status === 'sending') {
        await ctx.db.patch(q._id, { status: 'suppressed' })
      }
    }
    return { cancelled: pending.length, suppressed: queue.length }
  },
})

// ---------- Internal queries / mutations (no token, callable from actions) ----------

export const getQueueItem = internalQuery({
  args: { id: v.id('outreach_queue') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const markQueueItem = internalMutation({
  args: {
    id: v.id('outreach_queue'),
    status: v.string(),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, lastError }) => {
    const now = Date.now()
    const patch: Record<string, unknown> = {
      status,
      lastAttemptAt: now,
    }
    if (lastError) patch.lastError = lastError
    if (status === 'sent') patch.sentAt = now
    await ctx.db.patch(id, patch)
  },
})

export const recordAutoSend = internalMutation({
  args: {
    queueId: v.id('outreach_queue'),
    leadId: v.optional(v.id('leads')),
    subject: v.string(),
    body: v.string(),
    resendId: v.optional(v.string()),
    touch: v.number(),
  },
  handler: async (ctx, { queueId, leadId, subject, body, resendId, touch }) => {
    const now = Date.now()
    if (!leadId) {
      throw new Error('recordAutoSend requires leadId; orphan queue items are not allowed')
    }
    const id = await ctx.db.insert('email_sends', {
      leadId,
      subject,
      status: 'sent',
      sentAt: now,
    })
    await ctx.db.insert('email_drafts', {
      leadId,
      subject,
      body,
      status: 'sent',
      createdAt: now,
    })
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'email_sent',
      actor: 'hermes',
      details: `${subject} (touch ${touch}, resend:${resendId ?? 'n/a'})`,
      timestamp: now,
    })
    const lead = await ctx.db.get(leadId)
    if (lead) {
      const current = lead.stage ?? 'discover'
      const patch: Record<string, unknown> = { lastTouchpoint: 'email_sent' }
      if (['discover', 'engaged', 'qualified'].includes(current)) {
        patch.stage = 'contacted'
      }
      await ctx.db.patch(leadId, patch)
    }
    await ctx.db.patch(queueId, {
      status: 'sent',
      sentAt: now,
      lastAttemptAt: now,
      sendId: id,
    })
    return id
  },
})

export const scheduleFollowups = internalMutation({
  args: {
    queueId: v.id('outreach_queue'),
    leadId: v.optional(v.id('leads')),
  },
  handler: async (ctx, { queueId, leadId }) => {
    if (!leadId) return { scheduled: 0, reason: 'no_lead' }
    const now = Date.now()
    await ctx.db.insert('outreach_followups', {
      queueId,
      leadId,
      touch: 2,
      sendAt: now + TOUCH_GAP_MS(3),
      status: 'scheduled',
      createdAt: now,
    })
    await ctx.db.insert('outreach_followups', {
      queueId,
      leadId,
      touch: 3,
      sendAt: now + TOUCH_GAP_MS(7),
      status: 'scheduled',
      createdAt: now,
    })
    return { scheduled: 2 }
  },
})

// Used by Resend webhook on inbound reply: stop the rest of the sequence.
export const suppressForReply = internalMutation({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    const now = Date.now()
    const pending = await ctx.db
      .query('outreach_followups')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect()
    let cancelled = 0
    for (const f of pending) {
      if (f.status === 'scheduled') {
        await ctx.db.patch(f._id, {
          status: 'cancelled',
          cancelledReason: 'replied',
        })
        cancelled++
      }
    }
    const queue = await ctx.db
      .query('outreach_queue')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect()
    let suppressed = 0
    for (const q of queue) {
      if (q.status === 'queued' || q.status === 'sending') {
        await ctx.db.patch(q._id, { status: 'suppressed' })
        suppressed++
      }
    }
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'sequence_suppressed',
      actor: 'hermes',
      details: `reply detected; cancelled ${cancelled} follow-ups, suppressed ${suppressed} queue items`,
      timestamp: now,
    })
    return { cancelled, suppressed }
  },
})

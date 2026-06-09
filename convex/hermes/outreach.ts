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

import { action, internalMutation, internalQuery, mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { api, internal } from '../_generated/api'
import { requireHermes } from '../hermesAuth'
import { wrapEmailBody } from './emailTemplate'

const RESEND_API = 'https://api.resend.com/emails'
const FROM_ADDRESS =
  process.env.OUTREACH_FROM_EMAIL ??
  process.env.BREVO_SENDER_EMAIL ??
  'hello@emvyai.com'
// Board operator flow sends as Jake — matches Blando's reviewable signature
// and keeps a clear human/persona separation from the mass-mail FROM_ADDRESS.
const FROM_ADDRESS_BOARD = process.env.OUTREACH_FROM_EMAIL_BOARD ?? 'jake@emvyai.com'
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

    const { html, text } = wrapEmailBody(args.body)
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
        text,
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

// ---------- Board operator flow: send edited / record learning ----------

// Public action: operator sends an edited version of a draft from the board.
// Validates the recipient matches the lead's email and the draft is in
// {draft, approved}. Calls Resend from FROM_ADDRESS_BOARD (Jake), then
// recordOperatorSend atomically: email_sends row, draft -> 'sent',
// activity_log (actor=operator), new learnings row (operator_edit, weight 2.0),
// lead stage bump, followups cancelled, queue suppressed.
export const sendEditedFromBoard = action({
  args: {
    token: v.string(),
    draftId: v.id('email_drafts'),
    leadId: v.id('leads'),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ ok: boolean; noop?: boolean; reason?: string; sendId?: string; resendId?: string }> => {
    requireHermes(args.token)
    const draft = await ctx.runQuery(internal.hermes.outreach.getDraft, { id: args.draftId })
    if (!draft) throw new Error(`Draft not found: ${args.draftId}`)
    if (draft.status === 'sent') {
      return { ok: true, noop: true, reason: 'already_sent' }
    }
    if (draft.status !== 'draft' && draft.status !== 'approved') {
      return { ok: false, noop: true, reason: `invalid_status:${draft.status}` }
    }
    const lead = await ctx.runQuery(internal.hermes.outreach.getLead, { id: args.leadId })
    if (!lead) throw new Error(`Lead not found: ${args.leadId}`)
    if (lead.email && lead.email.toLowerCase() !== args.to.toLowerCase()) {
      throw new Error(`to (${args.to}) does not match lead email (${lead.email})`)
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured on server')
    }

    const { html, text } = wrapEmailBody(args.body)
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS_BOARD,
        to: args.to,
        reply_to: REPLY_TO,
        subject: args.subject,
        text,
        html,
        headers: {
          'X-Outreach-Touch': '1',
          'X-Draft-Id': String(args.draftId),
          'X-Operator-Send': '1',
        },
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      throw new Error(`Resend send failed: ${res.status} ${errText}`)
    }

    const json = (await res.json()) as { id?: string }
    const resendId = json.id

    const sendId = await ctx.runMutation(internal.hermes.outreach.recordOperatorSend, {
      draftId: args.draftId,
      leadId: args.leadId,
      subject: args.subject,
      originalBody: draft.body ?? '',
      editedBody: args.body,
      resendId,
    })

    // Suppress any pending followups/queue for this lead — operator has
    // taken ownership, no automated touches should follow.
    await ctx.runMutation(api.hermes.outreach.cancelFollowups, {
      token: args.token,
      leadId: args.leadId,
      reason: 'operator_sent',
    })

    return { ok: true, sendId, resendId }
  },
})

export const getDraft = internalQuery({
  args: { id: v.id('email_drafts') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const getLead = internalQuery({
  args: { id: v.id('leads') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

// Atomic write for the board operator-send path: email_sends + draft flip +
// activity_log + learnings row + lead stage bump + followups/queue cancel.
// Called from sendEditedFromBoard after Resend returns 2xx.
export const recordOperatorSend = internalMutation({
  args: {
    draftId: v.id('email_drafts'),
    leadId: v.id('leads'),
    subject: v.string(),
    originalBody: v.string(),
    editedBody: v.string(),
    resendId: v.optional(v.string()),
  },
  handler: async (ctx, { draftId, leadId, subject, originalBody, editedBody, resendId }) => {
    const now = Date.now()
    const lead = await ctx.db.get(leadId)
    if (!lead) throw new Error(`Lead not found: ${leadId}`)

    const sendId = await ctx.db.insert('email_sends', {
      leadId,
      subject,
      status: 'sent',
      sentAt: now,
    })

    await ctx.db.patch(draftId, { status: 'sent' })

    await ctx.db.insert('activity_log', {
      leadId,
      action: 'email_sent',
      actor: 'operator',
      details: `${subject} (resend:${resendId ?? 'n/a'})`,
      timestamp: now,
    })

    const context = JSON.stringify({
      company: lead.company,
      sector: lead.sector,
      score: lead.score,
      stage: lead.stage,
      painSignals: lead.painSignals,
    })
    await ctx.db.insert('learnings', {
      leadId,
      draftId,
      sendId,
      source: 'operator_edit',
      fromAddress: lead.email,
      subject,
      originalBody,
      editedBody,
      context,
      weight: 2.0,
      capturedAt: now,
    })

    const current = lead.stage ?? 'discover'
    const patch: Record<string, unknown> = { lastTouchpoint: 'email_sent' }
    if (['discover', 'engaged', 'qualified'].includes(current)) {
      patch.stage = 'contacted'
    }
    await ctx.db.patch(leadId, patch)

    const pending = await ctx.db
      .query('outreach_followups')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect()
    for (const f of pending) {
      if (f.status === 'scheduled') {
        await ctx.db.patch(f._id, {
          status: 'cancelled',
          cancelledReason: 'operator_sent',
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

    return sendId
  },
})

// Public mutation: operator saves edits to a draft without sending.
// Captures a 'learnings' row (operator_save) so Blando can read the
// preference back. Draft stays in its current status (draft/approved).
export const recordLearning = mutation({
  args: {
    token: v.string(),
    draftId: v.id('email_drafts'),
    leadId: v.id('leads'),
    subject: v.string(),
    editedBody: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, draftId, leadId, subject, editedBody, source } = args
    const draft = await ctx.db.get(draftId)
    if (!draft) throw new Error(`Draft not found: ${draftId}`)
    const lead = await ctx.db.get(leadId)
    if (!lead) throw new Error(`Lead not found: ${leadId}`)
    const now = Date.now()
    const context = JSON.stringify({
      company: lead.company,
      sector: lead.sector,
      score: lead.score,
      stage: lead.stage,
      painSignals: lead.painSignals,
    })
    const learningId = await ctx.db.insert('learnings', {
      leadId,
      draftId,
      source: source ?? 'operator_save',
      fromAddress: lead.email,
      subject,
      originalBody: draft.body,
      editedBody,
      context,
      weight: source === 'operator_edit' ? 2.0 : 1.0,
      capturedAt: now,
    })
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'draft_edited',
      actor: 'operator',
      details: subject,
      timestamp: now,
    })
    return learningId
  },
})

// Public query: pulls recent learnings for Blando's pull_learnings.py script.
// Token-gated. Returns rows strictly newer than `since` (ms epoch), up to
// `limit`, ordered by capturedAt ascending so the script can append in
// order. Strictly-greater (gt, not gte) so the high-water mark itself is
// never re-pulled on subsequent runs.
export const listRecentLearnings = query({
  args: {
    token: v.string(),
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, since, limit } = args
    const cap = limit ?? 200
    const rows = await ctx.db
      .query('learnings')
      .withIndex('by_capturedAt', (q) => q.gt('capturedAt', since ?? 0))
      .order('asc')
      .take(cap)
    return rows
  },
})

// Public query: has this lead had a recent bounce event? Used by the
// board detail page to show a soft-warn banner before re-sending.
export const hasRecentBounce = query({
  args: {
    token: v.string(),
    leadId: v.id('leads'),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, leadId, windowMs } = args
    const since = Date.now() - (windowMs ?? 30 * 24 * 60 * 60 * 1000)
    const events = await ctx.db
      .query('email_events')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .collect()
    const recent = events.find(
      (e) =>
        (e.eventType === 'bounced' || e.eventType === 'complained') &&
        e.timestamp >= since,
    )
    return { bounced: !!recent, at: recent?.timestamp ?? null }
  },
})

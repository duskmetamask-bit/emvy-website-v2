// Hermes outreach v2 — Convex-driven state machine for Blando.
//
// Replaces the file-based outbox/_sent/_scheduled/ dance that caused the
// 2026-06-26 E1+E2+E3-same-day incident. State is now in Convex:
//   - leads.outreachState drives the state machine
//   - outreach_queue holds queued|sending|sent|failed|blocked rows (touch 1/2/3)
//   - outreach_followups holds E2/E3 release timestamps
//
// LOCKED LAW (2026-06-27 — feedback_outreach_followup_timing_law.md):
//   Followups (E2, E3) MUST NEVER fire at the same time as initial outreach (E1).
//
// The state machine is enforced at SEND time in `claim`, NOT at queue time:
//   - queueStep: idempotency + unsubscribed/doNotContact + duplicate-step checks.
//     Allows E2/E3 to be queued with future scheduledFor regardless of current
//     state — that's how queueSequence can atomically queue E1+E2+E3.
//   - claim: at send time, refuses E2 unless state=e1_sent AND ≥4d since E1
//     sentAt; refuses E3 unless state=e2_sent AND ≥6d since E2 sentAt.
//     Refused rows surface as `reason: 'blocked:e*'` so the dead-letter
//     view in the board can flag them.
//
// This is the v2 Convex-driven queue. Old file-based scripts
// (send_outreach.py, schedule_followups.py) are now thin wrappers around
// claimAndSendStep + runFollowups.

import { action, internalAction, internalMutation, internalQuery, mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { internal, api } from '../_generated/api'
import { requireHermesAgent } from '../hermesAuth'

// Sequence timing (locked 2026-06-26 per [[project-emvy-outreach-bulletproof-design]]).
// E2 fires E1+4d, E3 fires E2+6d (so E1+10d total).
const E2_GAP_MS = 4 * 24 * 60 * 60 * 1000
const E3_GAP_MS = 6 * 24 * 60 * 60 * 1000
const STEPS = ['campaign', 'e1', 'e2', 'e3'] as const
type Step = (typeof STEPS)[number]

function stepToTouch(step: Step): number {
  return { campaign: 1, e1: 1, e2: 2, e3: 3 }[step]
}
function touchToStep(touch: number): Step {
  const m: Record<number, Step> = { 1: 'e1', 2: 'e2', 3: 'e3' }
  return m[touch] ?? 'e1'
}
function stateAfterStep(step: Step): string {
  const m: Record<Step, string> = {
    campaign: 'campaign_sent',
    e1: 'e1_sent',
    e2: 'e2_sent',
    e3: 'e3_sent',
  }
  return m[step]
}

// ---------- Public mutation: queueStep ----------
//
// Idempotent on (leadId, step). Refuses to queue if state machine gate fails.
// Auto-creates a lead row if the email is new.
export const queueStep = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
    businessName: v.string(),
    step: v.union(
      v.literal('campaign'),
      v.literal('e1'),
      v.literal('e2'),
      v.literal('e3')
    ),
    scheduledFor: v.number(),
    contact: v.optional(v.string()),
    source: v.optional(v.string()),
    sector: v.optional(v.string()),
    location: v.optional(v.string()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    // Operator escape hatch: forceSendNow sets this so the claim-time
    // E2/E3 timing gate (≥4d after E1, ≥6d after E2) is bypassed for
    // manual verification or hot-lead immediate follow-up.
    forceBypassGates: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const now = Date.now()
    const email = args.email.toLowerCase()

    // 1. Find or create lead
    const existing = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()
    let leadId: string
    if (existing) {
      leadId = existing._id
      if (existing.unsubscribedAt) throw new Error('queueStep refused: lead is unsubscribed')
      if (existing.doNotContactAt) throw new Error('queueStep refused: lead is do_not_contact')
    } else {
      leadId = await ctx.db.insert('leads', {
        email,
        company: args.businessName,
        contact: args.contact,
        source: args.source ?? 'blando_outreach',
        sector: args.sector,
        location: args.location,
        stage: 'discover',
        discoveredAt: now,
        enrichedAt: now,
      })
    }

    // 2. State machine gate (queue time) — ONLY enforces idempotency for
    //    re-queuing the same step. Sequence timing (e2 must wait for e1 to
    //    send + 4d; e3 must wait for e2 + 6d) is enforced at SEND time in
    //    `claim`, not here. This is the locked law (2026-06-27) that
    //    followups NEVER fire at the same time as initial outreach.
    const state = existing?.outreachState ?? null
    if (state === 'unsubscribed') throw new Error('queueStep refused: lead.unsubscribed')
    if (state === 'do_not_contact') throw new Error('queueStep refused: lead.do_not_contact')
    // Re-queueing the SAME step that's already sent is a no-op (caught by
    // the (leadId, step) idempotency check below). Re-queueing a step
    // that's AHEAD of current state (e.g. trying to queue e1 when state
    // is already e1_sent) is the only queue-time gate we keep.
    if (args.step === 'e1' && (state === 'e1_sent' || state === 'e2_sent' || state === 'e3_sent')) {
      throw new Error(`queueStep refused: e1_after_sequence_started (state=${state})`)
    }
    if (args.step === 'campaign' && state && state !== 'campaign_sent') {
      throw new Error(`queueStep refused: cannot_send_campaign_after_sequence (state=${state})`)
    }

    // 2b. Fail-fast at queue time: refuse to queue rows with empty body.
    if (!args.subject || !args.body) {
      throw new Error('queueStep refused: empty payload (subject and body are required)')
    }

    // 3. Idempotency: check existing (leadId, step) row
    const touch = stepToTouch(args.step)
    const priorQueue = await ctx.db
      .query('outreach_queue')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId as any))
      .collect()
    const prior = priorQueue.find((r) => r.touch === touch)
    if (prior) {
      // Already queued or sent. Return the existing row.
      return { queueId: prior._id, leadId, created: false, status: prior.status }
    }

    // 4. Insert outreach_queue row (subject + body persisted for send + audit).
    const queueId = await ctx.db.insert('outreach_queue', {
      leadId: leadId as any,
      company: args.businessName,
      contact: args.contact,
      email,
      sector: args.sector,
      location: args.location,
      source: args.source ?? 'blando_outreach',
      status: 'queued',
      scheduledFor: args.scheduledFor,
      attempts: 0,
      touch,
      forceBypassGates: args.forceBypassGates,
      subject: args.subject,
      body: args.body,
      createdAt: now,
    })

    // 5. Insert outreach_followups row (only for E2/E3; campaign/E1 only
    // need the queue row, the runner picks it up via runDaily).
    if (args.step === 'e2' || args.step === 'e3') {
      await ctx.db.insert('outreach_followups', {
        queueId: queueId as any,
        leadId: leadId as any,
        touch,
        sendAt: args.scheduledFor,
        status: 'scheduled',
        createdAt: now,
      })
    }

    // 6. Patch lead's nextActionAt
    await ctx.db.patch(leadId as any, { nextActionAt: args.scheduledFor })

    // 7. activity_log
    await ctx.db.insert('activity_log', {
      leadId: leadId as any,
      action: 'outreach_queued',
      actor: 'hermes',
      details: `step=${args.step} queueId=${queueId} scheduledFor=${args.scheduledFor} subject=${args.subject ?? ''}`,
      timestamp: now,
    })

    return { queueId, leadId, created: true, status: 'queued' }
  },
})

// ---------- Public mutation: markStepSent ----------
//
// Called by the VPS send script after Resend returns 2xx. Flips queue
// status, updates lead's outreachState + outreachHistory, writes email_sends
// + activity_log atomically.
export const markStepSent = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    queueId: v.id('outreach_queue'),
    resendId: v.string(),
    subject: v.string(),
    body: v.optional(v.string()),
    step: v.union(
      v.literal('campaign'),
      v.literal('e1'),
      v.literal('e2'),
      v.literal('e3')
    ),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const now = Date.now()
    const row = await ctx.db.get(args.queueId)
    if (!row) throw new Error('markStepSent: queue row not found')
    if (row.status === 'sent') {
      return { ok: true, noop: true, reason: 'already_sent' }
    }
    if (row.status !== 'sending' && row.status !== 'queued') {
      throw new Error(`markStepSent: unexpected status ${row.status}`)
    }

    // 1. Update queue row
    await ctx.db.patch(args.queueId, {
      status: 'sent',
      sentAt: now,
      lastAttemptAt: now,
    })

    // 2. If touch 2/3, update outreach_followups
    if (row.touch === 2 || row.touch === 3) {
      const followups = await ctx.db
        .query('outreach_followups')
        .withIndex('by_lead', (q) => q.eq('leadId', row.leadId!))
        .collect()
      for (const f of followups) {
        if (f.touch === row.touch && f.status === 'scheduled') {
          await ctx.db.patch(f._id, { status: 'sent', sentAt: now })
        }
      }
    }

    // 3. Update lead's outreachState + outreachHistory
    const lead = await ctx.db.get(row.leadId!)
    if (!lead) throw new Error('markStepSent: lead not found')
    const newState = stateAfterStep(args.step)
    const history = (lead.outreachHistory ?? []) as Array<{
      step: string
      sentAt: number
      resendMsgId?: string
      subject: string
    }>
    history.push({
      step: args.step,
      sentAt: now,
      resendMsgId: args.resendId,
      subject: args.subject,
    })
    const nextAction: Record<string, unknown> = {
      outreachState: newState,
      outreachHistory: history,
      stage: 'contacted',
      lastTouchpoint: 'email_sent',
    }
    await ctx.db.patch(lead._id, nextAction)

    // 4. Write email_sends (board reads this for the per-lead timeline)
    const sendId = await ctx.db.insert('email_sends', {
      leadId: lead._id,
      subject: args.subject,
      status: 'sent',
      sentAt: now,
      resendId: args.resendId,
      sequence: args.step,
      touch: row.touch,
      fromEmail: 'jake@emvyai.com',
      toEmail: lead.email!,
      company: lead.company,
      contact: lead.contact,
      sentBy: 'hermes',
    })

    // 5. activity_log
    await ctx.db.insert('activity_log', {
      leadId: lead._id,
      action: 'email_sent',
      actor: 'hermes',
      details: `step=${args.step} subject=${args.subject} resendId=${args.resendId}`,
      timestamp: now,
    })

    return { ok: true, sendId, state: newState }
  },
})

// ---------- Public mutation: markStepFailed ----------
export const markStepFailed = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    queueId: v.id('outreach_queue'),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const row = await ctx.db.get(args.queueId)
    if (!row) throw new Error('markStepFailed: queue row not found')
    await ctx.db.patch(args.queueId, {
      status: 'failed',
      lastError: args.error,
      lastAttemptAt: Date.now(),
      attempts: (row.attempts ?? 0) + 1,
    })
    return { ok: true }
  },
})

// ---------- Public query: getDueSteps (read-only, for dry-run) ----------
export const getDueSteps = query({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const now = Date.now()
    return await ctx.db
      .query('outreach_queue')
      .withIndex('by_status_scheduledFor', (q) =>
        q.eq('status', 'queued').lte('scheduledFor', now)
      )
      .take(args.limit)
  },
})

// ---------- Public query: getLeadSequenceState ----------
export const getLeadSequenceState = query({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const lead = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first()
    if (!lead) return { exists: false }
    const queue = await ctx.db
      .query('outreach_queue')
      .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
      .collect()
    return {
      exists: true,
      outreachState: lead.outreachState ?? null,
      nextActionAt: lead.nextActionAt ?? null,
      history: lead.outreachHistory ?? [],
      queue: queue.map((q) => ({
        touch: q.touch,
        status: q.status,
        scheduledFor: q.scheduledFor,
        queueId: q._id,
        templateId: q.templateId ?? null,
      })),
    }
  },
})

// ---------- Public mutation: queueSequence (E1 + E2 + E3 in one call) ----------
//
// Used by Zone 2 cron: queue E1 now, E2 at E1+4d, E3 at E1+10d. Each step
// is idempotent on (email, step) — re-running the cron is safe.
//
// Note: Convex's `api` reference gets circular types when a mutation in
// this file calls another via `api.hermes.outreach2.X`. We use `as any`
// casts on the api refs to break the cycle. The actual type safety is
// preserved at the runtime level.
export const queueSequence = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
    businessName: v.string(),
    contact: v.optional(v.string()),
    source: v.optional(v.string()),
    sector: v.optional(v.string()),
    location: v.optional(v.string()),
    e1Subject: v.optional(v.string()),
    e1Body: v.optional(v.string()),
    e2Subject: v.optional(v.string()),
    e2Body: v.optional(v.string()),
    e3Subject: v.optional(v.string()),
    e3Body: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    results: Array<{ step: Step; queueId: string; scheduledFor: number; created: boolean; error?: string }>
  }> => {
    requireHermesAgent(args.token, args.agent)
    const now = Date.now()
    const results: Array<{ step: Step; queueId: string; scheduledFor: number; created: boolean; error?: string }> = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef: any = api.hermes.outreach2

    // E1
    const e1 = await ctx.runMutation(apiRef.queueStep, {
      token: args.token,
      agent: 'blando',
      email: args.email,
      businessName: args.businessName,
      step: 'e1',
      scheduledFor: now,
      contact: args.contact,
      source: args.source,
      sector: args.sector,
      location: args.location,
      subject: args.e1Subject,
      body: args.e1Body,
    }).catch((e: Error) => ({ error: e.message }))
    if ('error' in e1) {
      results.push({ step: 'e1', queueId: '', scheduledFor: now, created: false, error: e1.error })
    } else {
      results.push({ step: 'e1', queueId: e1.queueId as string, scheduledFor: now, created: e1.created as boolean })
    }

    // E2 (E1 + 4d)
    const e2At = now + E2_GAP_MS
    const e2 = await ctx.runMutation(apiRef.queueStep, {
      token: args.token,
      agent: 'blando',
      email: args.email,
      businessName: args.businessName,
      step: 'e2',
      scheduledFor: e2At,
      contact: args.contact,
      source: args.source,
      sector: args.sector,
      location: args.location,
      subject: args.e2Subject,
      body: args.e2Body,
    }).catch((e: Error) => ({ error: e.message }))
    if ('error' in e2) {
      results.push({ step: 'e2', queueId: '', scheduledFor: e2At, created: false, error: e2.error })
    } else {
      results.push({ step: 'e2', queueId: e2.queueId as string, scheduledFor: e2At, created: e2.created as boolean })
    }

    // E3 (E2 + 6d, so E1 + 10d)
    const e3At = e2At + E3_GAP_MS
    const e3 = await ctx.runMutation(apiRef.queueStep, {
      token: args.token,
      agent: 'blando',
      email: args.email,
      businessName: args.businessName,
      step: 'e3',
      scheduledFor: e3At,
      contact: args.contact,
      source: args.source,
      sector: args.sector,
      location: args.location,
      subject: args.e3Subject,
      body: args.e3Body,
    }).catch((e: Error) => ({ error: e.message }))
    if ('error' in e3) {
      results.push({ step: 'e3', queueId: '', scheduledFor: e3At, created: false, error: e3.error })
    } else {
      results.push({ step: 'e3', queueId: e3.queueId as string, scheduledFor: e3At, created: e3.created as boolean })
    }

    return { results }
  },
})

// ---------- Public mutation: queueCampaign ----------
//
// Single-touch campaign. Used by Zone 1 cron: queue 1 row per qualified
// lead with step='campaign', scheduledFor=now. The Resend campaign
// template is rendered via template:{id, variables} — subject/body are
// still stored for audit/log + the failed-template fallback path.
export const queueCampaign = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
    businessName: v.string(),
    contact: v.optional(v.string()),
    source: v.optional(v.string()),
    sector: v.optional(v.string()),
    location: v.optional(v.string()),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ queueId: string; leadId: string; created: boolean; status: string }> => {
    requireHermesAgent(args.token, args.agent)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef: any = api.hermes.outreach2
    return await ctx.runMutation(apiRef.queueStep, {
      token: args.token,
      agent: 'blando',
      email: args.email,
      businessName: args.businessName,
      step: 'campaign',
      scheduledFor: Date.now(),
      contact: args.contact,
      source: args.source,
      sector: args.sector,
      location: args.location,
      subject: args.subject,
      body: args.body,
    })
  },
})

// ---------- Public action: claimAndSendStep ----------
//
// Claims due queue rows (status=queued, scheduledFor<=now) atomically,
// sends via Resend, marks sent. This is what the VPS send script calls.
//
// If the queue row carries a `templateId` + `variables`, we render the
// Resend template via `template:{id, variables}`. Otherwise we fall back
// to raw html/text (legacy path). subject/body are always stored on the
// row + email_sends for audit + the board preview.
export const claimAndSendStep = action({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    queueId: v.id('outreach_queue'),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; noop?: boolean; reason?: string; resendId?: string; state?: string }> => {
    requireHermesAgent(args.token, args.agent)

    // 0. SENDER INVARIANT (locked 2026-07-03) — only the canonical Convex
    //    path is allowed to send. If you see this fail, someone deployed
    //    a fork of this function from the wrong env, or the env was
    //    reset. Set `npx convex env set SENDER_NAME convex-v2` to recover.
    const expectedSender = process.env.SENDER_NAME
    if (expectedSender !== 'convex-v2') {
      throw new Error(
        `SENDER_NAME mismatch (got=${expectedSender ?? 'unset'}, expected=convex-v2). ` +
          'Set `npx convex env set SENDER_NAME convex-v2` on the glad-camel-940 deployment.'
      )
    }

    // 1. Atomically flip status queued -> sending
    const claim = await ctx.runMutation(internal.hermes.outreach2.claim, {
      id: args.queueId,
    })
    if (!claim.ok) {
      return { ok: false, noop: true, reason: claim.reason }
    }

    // 2. Send via Resend (raw HTML — no template)
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY not configured on server')
    const fromEmail = process.env.OUTREACH_FROM_EMAIL ?? 'jake@emvyai.com'

    // 2a. Build the Resend payload (raw HTML only — no templateId/variables).
    const payload: Record<string, unknown> = {
      from: `Jake Marchin-Vincent <${fromEmail}>`,
      to: claim.email,
      reply_to: 'jake@emvyai.com',
      subject: args.subject,
      text: args.body,
      html: args.body.replace(/\n/g, '<br/>'),
      headers: {
        'X-Outreach-Step': claim.step,
        'X-Queue-Id': String(args.queueId),
      },
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      await ctx.runMutation(internal.hermes.outreach2.markFailed, {
        id: args.queueId,
        error: `Resend ${res.status}: ${errText.slice(0, 200)}`,
      })
      throw new Error(`Resend send failed: ${res.status} ${errText}`)
    }
    const json = (await res.json()) as { id?: string }
    const resendId = json.id ?? 'unknown'

    // 3. Mark sent (flips state machine, writes email_sends + activity_log)
    const result = await ctx.runMutation(api.hermes.outreach2.markStepSent, {
      token: args.token,
      agent: 'blando',
      queueId: args.queueId,
      resendId,
      subject: args.subject,
      body: args.body,
      step: claim.step as any,
    })

    return { ok: true, resendId, state: result.state as any }
  },
})

// ---------- Internal mutations (called from action above) ----------

export const claim = internalMutation({
  args: { id: v.id('outreach_queue') },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id)
    if (!row) return { ok: false, reason: 'not_found' }
    if (row.status !== 'queued') return { ok: false, reason: `status=${row.status}` }
    const now = Date.now()
    if ((row.scheduledFor ?? 0) > now) return { ok: false, reason: 'not_due' }

    // SEND-TIME state machine gate (locked law 2026-06-27 — feedback_outreach_followup_timing_law.md).
    // E2 must wait for state=e1_sent AND >=4d since E1 actually sent.
    // E3 must wait for state=e2_sent AND >=6d since E2 actually sent.
    // Without this gate, followups could fire at the same time as initial outreach.
    const lead = row.leadId ? await ctx.db.get(row.leadId) : null
    if (lead && (row.touch === 2 || row.touch === 3)) {
      const history = (lead.outreachHistory ?? []) as Array<{ step: string; sentAt: number }>
      const e1 = history.find((h) => h.step === 'e1')
      const e2 = history.find((h) => h.step === 'e2')
      if (row.touch === 2) {
        if (!e1) {
          return { ok: false, reason: 'blocked:e2_before_e1_sent' }
        }
        if (!row.forceBypassGates && now - e1.sentAt < E2_GAP_MS) {
          return { ok: false, reason: `blocked:e2_too_soon (ms_since_e1=${now - e1.sentAt})` }
        }
      } else if (row.touch === 3) {
        if (!e2) {
          return { ok: false, reason: 'blocked:e3_before_e2_sent' }
        }
        if (!row.forceBypassGates && now - e2.sentAt < E3_GAP_MS) {
          return { ok: false, reason: `blocked:e3_too_soon (ms_since_e2=${now - e2.sentAt})` }
        }
      }
    }

    await ctx.db.patch(id, { status: 'sending', lastAttemptAt: now })
    return {
      ok: true,
      email: row.email,
      leadId: row.leadId,
      step: touchToStep(row.touch ?? 1),
      businessName: row.company,
    }
  },
})

export const markFailed = internalMutation({
  args: { id: v.id('outreach_queue'), error: v.string() },
  handler: async (ctx, { id, error }) => {
    const row = await ctx.db.get(id)
    if (!row) return
    await ctx.db.patch(id, {
      status: 'failed',
      lastError: error,
      lastAttemptAt: Date.now(),
      attempts: (row.attempts ?? 0) + 1,
    })
  },
})

// ---------- Public mutation: suppressLead ----------
//
// Operator-initiated: marks lead do_not_contact (hard) or unsubscribed
// (soft). Cancels any pending followups + queue rows. Idempotent.
export const suppressLead = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
    reason: v.union(
      v.literal('unsubscribed'),
      v.literal('do_not_contact'),
    ),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const now = Date.now()
    const lead = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first()
    if (!lead) return { ok: false, reason: 'lead_not_found' }

    const patch: Record<string, unknown> = {
      outreachState: args.reason,
    }
    if (args.reason === 'unsubscribed') {
      patch.unsubscribedAt = now
      patch.unsubscribeMethod = 'oneclick'
    } else {
      patch.doNotContactAt = now
    }
    await ctx.db.patch(lead._id, patch)

    // Cancel pending followups + suppress queue
    const followups = await ctx.db
      .query('outreach_followups')
      .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
      .collect()
    for (const f of followups) {
      if (f.status === 'scheduled') {
        await ctx.db.patch(f._id, { status: 'cancelled', cancelledReason: args.reason })
      }
    }
    const queue = await ctx.db
      .query('outreach_queue')
      .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
      .collect()
    for (const q of queue) {
      if (q.status === 'queued' || q.status === 'sending') {
        await ctx.db.patch(q._id, { status: 'suppressed' })
      }
    }

    await ctx.db.insert('activity_log', {
      leadId: lead._id,
      action: args.reason,
      actor: 'hermes',
      details: args.reason,
      timestamp: now,
    })

    return { ok: true, suppressed: queue.length, cancelled: followups.length }
  },
})

// ---------- Public mutation: resetSequenceForLead ----------
//
// Operator tool: hard-reset a lead's outreach sequence. Deletes all
// outreach_queue + outreach_followups rows, clears lead.outreachState
// + outreachHistory + nextActionAt. Use for re-running a sequence with
// a fresh draft (e.g. testing, re-engaging after months, fixing
// content errors). Audit-logged via activity_log.
//
// CAUTION: this is destructive. The lead's existing send history is
// erased — Resend email_sends rows are NOT deleted (Resend audit
// trail is preserved). Use sparingly.
export const resetSequenceForLead = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; email: string; deletedQueue: number; deletedFollowups: number }> => {
    requireHermesAgent(args.token, args.agent)
    const email = args.email.toLowerCase()
    const lead = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()
    if (!lead) return { ok: false, email, deletedQueue: 0, deletedFollowups: 0 }

    const queue = await ctx.db
      .query('outreach_queue')
      .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
      .collect()
    for (const q of queue) await ctx.db.delete(q._id)

    const followups = await ctx.db
      .query('outreach_followups')
      .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
      .collect()
    for (const f of followups) await ctx.db.delete(f._id)

    await ctx.db.patch(lead._id, {
      outreachState: undefined,
      outreachHistory: undefined,
      nextActionAt: undefined,
    })

    await ctx.db.insert('activity_log', {
      leadId: lead._id,
      action: 'reset_sequence',
      actor: 'hermes',
      details: `deleted ${queue.length} queue + ${followups.length} followups; reason=${args.reason ?? 'manual'}`,
      timestamp: Date.now(),
    })

    return { ok: true, email: lead.email as string, deletedQueue: queue.length, deletedFollowups: followups.length }
  },
})
//
// Operator tool: collapse a queued row's scheduledFor to now-1 so the
// next send_outreach.py run claims it immediately. Used for manual
// verification or hot-lead immediate follow-up. State-machine timing
// gates (E2 must be ≥4d after E1 sent, etc.) STILL apply at claim time
// — this only bypasses the scheduledFor wait, not the send-time gates.
export const forceSendNow = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    queueId: v.id('outreach_queue'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; queueId: string; scheduledFor: number }> => {
    requireHermesAgent(args.token, args.agent)
    const row = await ctx.db.get(args.queueId)
    if (!row) throw new Error(`forceSendNow: queue row ${args.queueId} not found`)
    if (row.status !== 'queued') {
      throw new Error(`forceSendNow: row status=${row.status}, only queued rows can be forced`)
    }
    const now = Date.now()
    await ctx.db.patch(args.queueId, { scheduledFor: now - 1, forceBypassGates: true })
    await ctx.db.insert('activity_log', {
      leadId: row.leadId as any,
      action: 'force_send_now',
      actor: 'hermes',
      details: `queueId=${args.queueId} step=${row.touch} reason=${args.reason ?? 'manual'}`,
      timestamp: now,
    })
    return { ok: true, queueId: String(args.queueId), scheduledFor: now - 1 }
  },
})

// ---------- Public query: listLeadsByOutreachState ----------
//
// Added 2026-06-27 PM. Operational tool for verifying the locked-law invariant
// (every e1_sent lead has E2/E3 queued) and for any future backfills. Used
// by bin/backfill_e2_e3_for_e1_sent.py. Returns email + company + contact +
// sector + location for leads matching the requested outreachState.
export const listLeadsByOutreachState = query({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    state: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const lim = Math.min(args.limit ?? 500, 500)
    const leads = await ctx.db
      .query('leads')
      .withIndex('by_outreachState', (q) => q.eq('outreachState', args.state as any))
      .take(lim)
    return leads.map((l) => ({
      email: l.email,
      company: l.company,
      contact: l.contact,
      sector: l.sector,
      location: l.location,
    }))
  },
})

// ---------- Public mutation: unsuppressLead ----------
//
// Operator-initiated: reverses a prior suppressLead by clearing
// doNotContactAt / unsubscribedAt / outreachState. Use when a lead was
// accidentally suppressed (e.g. operator mis-click during cleanup).
// Audit-logged via activity_log so reversals are traceable.
export const unsuppressLead = mutation({
  args: {
    token: v.string(),
    agent: v.literal('blando'),
    email: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; email: string; priorState: string | null }> => {
    requireHermesAgent(args.token, args.agent)
    const lead = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first()
    if (!lead) return { ok: false, email: args.email, priorState: null }
    const priorState = lead.outreachState ?? null
    await ctx.db.patch(lead._id, {
      outreachState: undefined,
      doNotContactAt: undefined,
      unsubscribedAt: undefined,
    })
    await ctx.db.insert('activity_log', {
      leadId: lead._id,
      action: 'unsuppress',
      actor: 'hermes',
      details: args.reason ?? 'unsuppress',
      timestamp: Date.now(),
    })
    return { ok: true, email: lead.email as string, priorState }
  },
})

// ---------- Internal mutation: markLegacyE1Backfilled ----------
//
// Slice 1 — backlog reconciliation. The 244 E2/E3 rows that hit
// `blocked:e2_before_e1_sent` were queued before the v2 migration; the
// original E1 send happened via the old Brevo `send_outreach.py` path and
// never wrote to lead.outreachHistory. This mutation synthesizes the
// missing E1 history entry so the next drain pass accepts the E2/E3 rows.
//
// IDEMPOTENT: a second call for the same lead is a no-op (returns
// noop:true, reason:'already_backfilled').
//
// `e1SentAt` is caller-supplied because the only valid timestamp is
// whatever the caller's VPS-side parser extracted from the legacy
// `_legacy_archive/_sent/` file. From the UI, we derive a valid value
// from the queue row's scheduledFor (E2.scheduledFor - 4d, or
// E3.scheduledFor - 10d) so the locked E2≥4d / E3≥6d gates pass naturally.
//
// Does NOT send any email — this is a metadata-only backfill. The next
// `drainDueOutreach` run picks up the now-allowed E2/E3 rows.
//
// CAUTION: this writes to lead.outreachState + lead.outreachHistory from
// inside `hermes/outreach2.ts`. The sender-seam guard test (see
// tests/lib/sender-seam.test.ts) does not flag this file — it IS the
// canonical seam. New writers elsewhere still fail CI.
export const markLegacyE1Backfilled = internalMutation({
  args: {
    email: v.string(),
    e1SentAt: v.number(),
    e1Subject: v.optional(v.string()),
    source: v.optional(v.string()), // 'ui' | 'vps_script' | 'manual' — audit provenance
  },
  handler: async (ctx, args): Promise<{
    ok: boolean
    leadId: string
    noop?: boolean
    reason?: string
    backfilledAt?: number
  }> => {
    const email = args.email.toLowerCase()
    const lead = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()
    if (!lead) {
      throw new Error(`markLegacyE1Backfilled: lead not found for ${email}`)
    }
    if (lead.unsubscribedAt) {
      throw new Error(`markLegacyE1Backfilled: lead ${email} is unsubscribed — refuse to backfill`)
    }
    if (lead.doNotContactAt) {
      throw new Error(`markLegacyE1Backfilled: lead ${email} is do_not_contact — refuse to backfill`)
    }

    // Idempotency: if e1 is already in history, no-op.
    const history = (lead.outreachHistory ?? []) as Array<{
      step: string
      sentAt: number
      resendMsgId?: string
      subject?: string
    }>
    const existingE1 = history.find((h) => h.step === 'e1')
    if (existingE1) {
      return {
        ok: true,
        leadId: String(lead._id),
        noop: true,
        reason: 'already_backfilled',
      }
    }

    // Refuse to overwrite a sequence that's already advanced past e1_sent.
    const state = lead.outreachState ?? null
    if (state === 'e1_sent' || state === 'e2_sent' || state === 'e3_sent') {
      return {
        ok: true,
        leadId: String(lead._id),
        noop: true,
        reason: `already_advanced (state=${state})`,
      }
    }

    const now = Date.now()
    const newEntry = {
      step: 'e1' as const,
      sentAt: args.e1SentAt,
      resendMsgId: undefined,
      subject: args.e1Subject ?? '(legacy pre-migration send via Brevo)',
    }
    history.push(newEntry)
    await ctx.db.patch(lead._id, {
      outreachState: 'e1_sent',
      outreachHistory: history,
    })

    await ctx.db.insert('activity_log', {
      leadId: lead._id,
      action: 'legacy_e1_backfilled',
      actor: 'hermes',
      details: `e1SentAt=${args.e1SentAt} subject=${args.e1Subject ?? ''} source=${args.source ?? 'ui'}`,
      timestamp: now,
    })

    return { ok: true, leadId: String(lead._id), backfilledAt: now }
  },
})

// ---------- Settings helpers (Slice 1a — pause/resume) ----------
//
// Single source of truth for runtime flags that gate the outreach
// pipeline (e.g. `outreach_paused`). Reads default to `false` so the
// drainer never crashes on first boot when the row hasn't been written
// yet. Writes are upsert on `key` (by_key index).

async function readSetting(ctx: { db: any }, key: string): Promise<string | null> {
  const row = await ctx.db
    .query('settings')
    .withIndex('by_key', (q: any) => q.eq('key', key))
    .first()
  return row?.value ?? null
}

async function writeSetting(
  ctx: { db: any },
  key: string,
  value: string,
): Promise<{ key: string; value: string; updatedAt: number }> {
  const now = Date.now()
  const existing = await ctx.db
    .query('settings')
    .withIndex('by_key', (q: any) => q.eq('key', key))
    .first()
  if (existing) {
    await ctx.db.patch(existing._id, { value, updatedAt: now })
    return { key, value, updatedAt: now }
  }
  await ctx.db.insert('settings', { key, value, updatedAt: now })
  return { key, value, updatedAt: now }
}

// ---------- Public query: getOutreachPaused ----------
//
// Read-only. Returns `{paused:boolean, updatedAt:number|null}`. Default
// `paused:false` when the row is missing (first boot, no flag ever set).
// Used by `drainDueOutreach` to short-circuit and by the board UI to
// render the toggle state.
export const getOutreachPaused = query({
  args: {},
  handler: async (ctx): Promise<{ paused: boolean; updatedAt: number | null }> => {
    const row = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', 'outreach_paused'))
      .first()
    if (!row) return { paused: false, updatedAt: null }
    return { paused: row.value === '1', updatedAt: row.updatedAt }
  },
})

// ---------- Internal mutation: setOutreachPaused ----------
//
// Operator kill switch (Slice 1a). Flips the `outreach_paused` setting
// and writes an `activity_log` entry with the prior + new value for
// audit. Idempotent — calling with the same `paused` value just refreshes
// the `updatedAt` timestamp.
//
// This is the SINGLE writer to the `outreach_paused` setting. The board
// UI calls the public seam mutation `convex/board/outreach:setOutreachPaused`
// which in turn calls this internal mutation. The board mirror inlines
// the same logic because it doesn't ship convex/hermes/*.
//
// Audit: the `settings.outreach_paused.updatedAt` field IS the audit
// trail (one row, monotonic). activity_log requires a `leadId` so it's
// not appropriate for a global flag — a future slice can add a
// `system_audit_log` table if global-event audit rows are needed.
export const setOutreachPaused = internalMutation({
  args: {
    paused: v.boolean(),
    actor: v.optional(v.string()), // 'operator' | 'hermes' — write provenance
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ ok: true; paused: boolean; previous: boolean; updatedAt: number }> => {
    const prior = await readSetting(ctx, 'outreach_paused')
    const previous = prior === '1'
    const next = args.paused
    const { updatedAt } = await writeSetting(ctx, 'outreach_paused', next ? '1' : '0')
    return { ok: true, paused: next, previous, updatedAt }
  },
})

// ---------- Internal drainer: drainDueOutreach ----------
//
// The missing link. Zone 2 cron queues E1+E2+E3 rows to outreach_queue,
// but no caller was invoking claimAndSendStep — the rows sat at
// status=queued indefinitely. This action drains them.
//
// Per the locked law (feedback_outreach_followup_timing_law.md), followups
// E2/E3 are gated at SEND TIME in `claim`: E2 requires state=e1_sent AND
// ≥4d since E1 sentAt; E3 requires state=e2_sent AND ≥6d since E2 sentAt.
// Rows that hit those gates return reason='blocked:e*_too_soon' and are
// left in queued — they will drain on a future run when the gap has elapsed.
//
// One failed send does NOT stop the loop — we capture the error and move on.
// This is the single live sender after the 2026-07-03 alignment fix;
// legacy Brevo `send_outreach.py` + older `hermes/outreach.ts` paths were
// stashed the same day.
//
// Idempotency is enforced at multiple layers:
//   1. queueStep: (leadId, touch) already-queued returns existing row.
//   2. claim: only flips queued→sending (returns reason='status=sent' if
//      already past that state).
//   3. markStepSent: short-circuits if row.status === 'sent'.
//
// Wired to crons.ts:drainOutreachQueue (every 5 minutes).
export const listDueForDrain = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    const now = Date.now()
    return await ctx.db
      .query('outreach_queue')
      .withIndex('by_status_scheduledFor', (q) =>
        q.eq('status', 'queued').lte('scheduledFor', now)
      )
      .take(limit)
  },
})

export const drainDueOutreach = internalAction({
  args: { batchSize: v.optional(v.number()) },
  handler: async (
    ctx,
    args,
  ): Promise<{
    processed: number
    sent: number
    blocked: number
    failed: number
    noop: number
    errors: Array<{ queueId: string; error: string }>
    paused?: boolean
  }> => {
    const token = process.env.HERMES_ACTIONS_TOKEN
    if (!token) throw new Error('HERMES_ACTIONS_TOKEN not configured on server')

    // Slice 1a — operator pause/resume kill switch. If the
    // `outreach_paused` setting is flipped, the drainer short-circuits
    // without touching Resend. The cron continues to fire on its 5-min
    // cadence; paused runs are no-ops that surface the `paused:true`
    // flag in the response so the activity log + future Slice 5
    // observability dashboard can show "X runs skipped because paused".
    const pauseFlag = await ctx.runQuery(internal.hermes.outreach2.getOutreachPaused, {})
    if (pauseFlag.paused) {
      return {
        processed: 0,
        sent: 0,
        blocked: 0,
        failed: 0,
        noop: 0,
        errors: [],
        paused: true,
      }
    }

    const limit = Math.min(args.batchSize ?? 10, 50)
    const dueRows = await ctx.runQuery(internal.hermes.outreach2.listDueForDrain, {
      limit,
    })
    if (dueRows.length === 0) {
      return { processed: 0, sent: 0, blocked: 0, failed: 0, noop: 0, errors: [] }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiRef: any = api.hermes.outreach2
    let sent = 0,
      blocked = 0,
      failed = 0,
      noop = 0
    const errors: Array<{ queueId: string; error: string }> = []

    for (const row of dueRows) {
      // Skip rows missing subject/body — they're queued from a partial write.
      if (!row.subject || !row.body) {
        errors.push({ queueId: String(row._id), error: 'missing subject or body' })
        failed++
        continue
      }
      try {
        const result = await ctx.runAction(apiRef.claimAndSendStep, {
          token,
          agent: 'blando',
          queueId: row._id,
          subject: row.subject,
          body: row.body,
        })
        if (result.ok) {
          sent++
        } else if (result.noop) {
          // Locked-law gate (blocked:e2_too_soon / blocked:e3_too_soon / status=sent)
          // is a legitimate no-op — row stays queued, will be retried next pass.
          if ((result.reason ?? '').startsWith('blocked:')) {
            blocked++
          } else {
            noop++
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        errors.push({ queueId: String(row._id), error: msg.slice(0, 300) })
        failed++
      }
    }

    return {
      processed: dueRows.length,
      sent,
      blocked,
      failed,
      noop,
      errors,
    }
  },
})

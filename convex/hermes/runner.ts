// Hermes runner — daily cadence + follow-up cadence.
//
// Public actions (Bearer token):
// - runDaily: pick up to N items from outreach_queue with status=queued
//   and scheduledFor<=now, generate trades-voice email via template
//   rotation, call autoSend for each, log digest.
// - runFollowups: pick outreach_followups with status=scheduled and
//   sendAt<=now, generate touch-2/touch-3 email, call autoSend,
//   then mark the followup row sent.
// - enqueue: add a lead to the queue (used by CSV seeder and the
//   warm-intro conversion path).
//
// Templates rotate by hour-of-day so the same lead never sees the
// same template back-to-back. Personalisation is plain string
// interpolation; no LLM call needed (faster, cheaper, and
// deterministic for review).

import { action, internalMutation, internalQuery, mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { internal, api } from '../_generated/api'
import { requireHermes } from '../hermesAuth'

const DAILY_LIMIT = Number(process.env.HERMES_DAILY_LIMIT ?? 40)
const HOURLY_FOLLOWUP_LIMIT = Number(process.env.HERMES_HOURLY_FOLLOWUP_LIMIT ?? 60)

type Template = {
  subject: string
  body: string
}

const TEMPLATES_T1: Template[] = [
  {
    subject: 'Quick one for {company}',
    body: `Hey {contact},

Saw {company} is doing {sector} work in {location}. I run a free 15-min AI audit for one business each week — looks at where 5+ hours a week of admin is hiding (quoting, follow-ups, inbox, booking, reports).

No pitch either way. Worth a look?

— Dusk
EMVY AI`,
  },
  {
    subject: '6-8 hours a week on admin?',
    body: `Hey {contact},

Most {sector} businesses I talk to lose half a day every week to admin — quoting, chasing replies, follow-ups, paperwork. AI is taking that back.

I'm doing a free 15-min call this month to scope it for one business. Worth a quick chat?

— Dusk
EMVY AI`,
  },
  {
    subject: 'Where the time is going at {company}',
    body: `Hey {contact},

Noticed {company} is in {sector} over in {location}. I just help businesses find the 5+ hours a week hiding in their admin and automate it. Free 15-min call this month.

Worth 15 min?

— Dusk
EMVY AI`,
  },
  {
    subject: 'Replies going to whoever rings back?',
    body: `Hey {contact},

Quick one for {company}. AI can reply to enquiries in under a minute and book the job before your competitors wake up. 15-min call to scope if it fits — no pitch.

Up for it?

— Dusk
EMVY AI`,
  },
]

const TEMPLATES_T2: Template[] = [
  {
    subject: 'Re: bumping this',
    body: `Hey {contact},

Just floating this back up in case it got buried. The free 15-min call is still open — happy to send a 2-min Loom instead if that's easier.

Either way, no stress.

— Dusk
EMVY AI`,
  },
  {
    subject: 'Re: quick one',
    body: `Hey {contact},

Bumping in case the last one slipped through. If cutting admin at {company} isn't on your radar right now, no worries at all — just say "not now" and I'll stop.

— Dusk
EMVY AI`,
  },
]

const TEMPLATES_T3: Template[] = [
  {
    subject: 'Last note from me',
    body: `Hey {contact},

Won't keep pinging. If cutting admin at {company} is something you want to look at down the track, the call is still there: https://emvyai.com/contact

Either way, all the best with the work.

— Dusk
EMVY AI`,
  },
]

function fillTemplate(t: Template, vars: Record<string, string>): Template {
  const fill = (s: string) =>
    s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
  return { subject: fill(t.subject), body: fill(t.body) }
}

function pickTemplate(set: Template[], seed: number): Template {
  return set[seed % set.length]
}

function buildVars(q: {
  contact?: string
  company: string
  sector?: string
  location?: string
}): Record<string, string> {
  return {
    contact: q.contact ?? 'there',
    company: q.company,
    sector: q.sector ?? 'trade work',
    location: q.location ?? 'your area',
  }
}

export const runDaily = action({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ planned: number; sent: number; failed: number; suppressed: number; errors: string[] }> => {
    requireHermes(args.token)
    const limit = args.limit ?? DAILY_LIMIT
    const now = Date.now()
    const today = new Date(now).toISOString().slice(0, 10)
    const seed = Math.floor(now / (60 * 60 * 1000)) // rotates per hour

    const items = await ctx.runQuery(internal.hermes.runner.pickQueued, {
      limit,
      now,
    })

    let sent = 0
    let failed = 0
    let suppressed = 0
    const errors: string[] = []

    for (const item of items) {
      try {
        const vars = buildVars(item)
        const tpl = pickTemplate(TEMPLATES_T1, seed + sent)
        const { subject, body } = fillTemplate(tpl, vars)
        await ctx.runAction(api.hermes.outreach.autoSend, {
          token: args.token,
          queueId: item._id,
          subject,
          body,
          touch: 1,
        })
        sent++
      } catch (e) {
        failed++
        const msg = e instanceof Error ? e.message : String(e)
        errors.push(`${item.email}: ${msg.slice(0, 120)}`)
        if (msg.includes('bounce') || msg.includes('complaint')) suppressed++
      }
    }

    await ctx.runMutation(internal.hermes.runner.writeDigest, {
      date: today,
      planned: items.length,
      sent,
      failed,
      suppressed,
      details: errors.length ? errors.slice(0, 10).join(' | ') : undefined,
    })

    return { planned: items.length, sent, failed, suppressed, errors }
  },
})

export const runFollowups = action({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ sent: number; failed: number; errors: string[] }> => {
    requireHermes(args.token)
    const limit = args.limit ?? HOURLY_FOLLOWUP_LIMIT
    const now = Date.now()
    const seed = Math.floor(now / (60 * 60 * 1000))

    const due = await ctx.runQuery(internal.hermes.runner.pickDueFollowups, {
      limit,
      now,
    })

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const f of due) {
      const queue = await ctx.runQuery(internal.hermes.runner.getQueueItemFull, {
        id: f.queueId,
      })
      if (!queue) {
        await ctx.runMutation(internal.hermes.runner.markFollowup, {
          id: f._id,
          status: 'failed',
        })
        failed++
        continue
      }
      const set = f.touch === 2 ? TEMPLATES_T2 : TEMPLATES_T3
      const tpl = pickTemplate(set, seed + sent)
      const { subject, body } = fillTemplate(tpl, buildVars(queue))
      try {
        await ctx.runAction(api.hermes.outreach.autoSend, {
          token: args.token,
          queueId: queue._id,
          subject,
          body,
          touch: f.touch,
        })
        await ctx.runMutation(internal.hermes.runner.markFollowup, {
          id: f._id,
          status: 'sent',
        })
        sent++
      } catch (e) {
        await ctx.runMutation(internal.hermes.runner.markFollowup, {
          id: f._id,
          status: 'failed',
        })
        failed++
        const msg = e instanceof Error ? e.message : String(e)
        errors.push(`${queue.email} t${f.touch}: ${msg.slice(0, 100)}`)
      }
    }

    return { sent, failed, errors }
  },
})

export const enqueue = mutation({
  args: {
    token: v.string(),
    leadId: v.optional(v.id('leads')),
    company: v.string(),
    contact: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    sector: v.optional(v.string()),
    source: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, ...data } = args
    const id = await ctx.db.insert('outreach_queue', {
      ...data,
      status: 'queued',
      source: data.source ?? 'manual',
      createdAt: Date.now(),
      scheduledFor: data.scheduledFor,
    })
    return id
  },
})

// ---------- Internal queries / mutations ----------

export const pickQueued = internalQuery({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const due = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status_scheduledFor', (q) =>
        q.eq('status', 'queued').lt('scheduledFor', now)
      )
      .take(limit)
    return due
  },
})

export const getQueueItemFull = internalQuery({
  args: { id: v.id('outreach_queue') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

export const pickDueFollowups = internalQuery({
  args: { limit: v.number(), now: v.number() },
  handler: async (ctx, { limit, now }) => {
    const due = await ctx.db
      .query('outreach_followups')
      .withIndex('by_status_sendAt', (q) =>
        q.eq('status', 'scheduled').lt('sendAt', now)
      )
      .take(limit)
    return due
  },
})

export const markFollowup = internalMutation({
  args: { id: v.id('outreach_followups'), status: v.string() },
  handler: async (ctx, { id, status }) => {
    const patch: Record<string, unknown> = { status }
    if (status === 'sent') patch.sentAt = Date.now()
    await ctx.db.patch(id, patch)
  },
})

export const writeDigest = internalMutation({
  args: {
    date: v.string(),
    planned: v.number(),
    sent: v.number(),
    failed: v.number(),
    suppressed: v.number(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('hermes_daily_digest', {
      ...args,
      createdAt: Date.now(),
    })
  },
})

// Operator-facing summary query (used by the board digest view)
export const recentDigests = query({
  args: {
    token: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    return await ctx.db
      .query('hermes_daily_digest')
      .withIndex('by_date')
      .order('desc')
      .take(args.limit ?? 14)
  },
})

// Audit chatbot lead capture (emvy-audit-chatbot.vercel.app).
// Public mutation — callable by anyone submitting the audit form.
// Writes a rich row to `audit_chatbot_leads` and auto-creates / updates
// a `leads` row so the board's existing /pipeline view picks it up
// without new board code. Activity log entry written for the timeline.
//
// Mirrors the pattern in convex/assessment/submissions.ts:saveSubmission.

import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),

    businessName: v.optional(v.string()),
    industry: v.optional(v.string()),
    teamSize: v.optional(v.string()),

    score: v.number(),
    scoreLabel: v.string(),
    scoreBlurb: v.optional(v.string()),
    summary: v.optional(v.string()),

    week1: v.optional(v.array(v.string())),
    weeks24: v.optional(v.array(v.string())),
    months23: v.optional(v.array(v.string())),
    nextStep: v.optional(v.string()),

    findings: v.array(
      v.object({
        category: v.string(),
        text: v.string(),
        severity: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
      })
    ),
    categoriesCovered: v.array(v.string()),
    painPoints: v.array(v.string()),
    manualTasks: v.array(v.string()),
    scores: v.record(v.string(), v.number()),
    aiTools: v.optional(v.string()),
    budget: v.optional(v.string()),
    goal: v.optional(v.string()),
    obstacles: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const chatbotLeadId = await ctx.db.insert('audit_chatbot_leads', {
      ...args,
      status: 'new',
      createdAt: Date.now(),
    })

    // Auto-create or update a `leads` row so the board's /pipeline
    // shows the lead without any new board code.
    const existingLeads = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .collect()

    let leadId
    let prevStage
    let stageChanged = false

    if (existingLeads.length === 0) {
      leadId = await ctx.db.insert('leads', {
        email: args.email,
        contact: args.name,
        company: args.company || args.businessName || undefined,
        source: 'audit_chatbot',
        score: args.score,
        stage: 'assessed',
        lastTouchpoint: 'audit_chatbot_completed',
        sector: args.industry || undefined,
        discoveredAt: Date.now(),
      })
      stageChanged = true
    } else {
      leadId = existingLeads[0]._id
      const existing = existingLeads[0]
      const scoreIsHigher = args.score > (existing.score || 0)
      const canAdvance =
        !existing.stage || ['discover', 'contacted', 'engaged'].includes(existing.stage)

      const updates: {
        lastTouchpoint: string
        score?: number
        stage?: string
      } = { lastTouchpoint: 'audit_chatbot_completed' }
      if (scoreIsHigher) updates.score = args.score
      if (canAdvance) {
        updates.stage = 'assessed'
        prevStage = existing.stage
        stageChanged = true
      }
      await ctx.db.patch(leadId, updates)
    }

    // Activity log
    await ctx.db.insert('activity_log', {
      leadId,
      action: 'audit_chatbot_completed',
      details: `Score: ${args.score}, ${args.scoreLabel}, business: ${args.businessName || 'unspecified'}`,
      timestamp: Date.now(),
    })
    if (stageChanged) {
      await ctx.db.insert('activity_log', {
        leadId,
        action: 'stage_change',
        details: `${prevStage || 'new'} → assessed (score: ${args.score})`,
        timestamp: Date.now(),
      })
    }

    return { chatbotLeadId, leadId }
  },
})

// List query — for the board (future view). Mirrors the assessment list.
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    return await ctx.db
      .query('audit_chatbot_leads')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit)
  },
})

// Get by id
export const get = query({
  args: { id: v.id('audit_chatbot_leads') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

// Stats — average score, count, etc. Mirrors getSubmissionStats.
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query('audit_chatbot_leads').take(1000)
    const total = leads.length
    const avgScore = total > 0 ? leads.reduce((a, l) => a + l.score, 0) / total : 0
    const byLabel: Record<string, number> = {}
    for (const l of leads) byLabel[l.scoreLabel] = (byLabel[l.scoreLabel] || 0) + 1
    const byIndustry: Record<string, number> = {}
    for (const l of leads) {
      const k = l.industry || 'unspecified'
      byIndustry[k] = (byIndustry[k] || 0) + 1
    }
    const byStatus: Record<string, number> = {
      new: 0,
      completed: 0,
      reviewed: 0,
      converted: 0,
    }
    for (const l of leads) {
      const k = l.status ?? 'new'
      byStatus[k] = (byStatus[k] || 0) + 1
    }
    return { total, avgScore: Math.round(avgScore), byLabel, byIndustry, byStatus }
  },
})

// Backfill mutation — called by the audit chatbot front-end after the
// MiniMax M2.7 30/60/90 report lands. Fills the score + roadmap fields
// that were unknown at email-submit time and flips status to 'completed'.
// Idempotent: a second call just overwrites with the same data.
//
// Throws if the id doesn't exist; the front-end treats that as a
// recoverable error and surfaces it (vs. silently dropping the report).
export const update = mutation({
  args: {
    id: v.id('audit_chatbot_leads'),
    score: v.number(),
    scoreLabel: v.string(),
    scoreBlurb: v.optional(v.string()),
    summary: v.optional(v.string()),
    week1: v.optional(v.array(v.string())),
    weeks24: v.optional(v.array(v.string())),
    months23: v.optional(v.array(v.string())),
    nextStep: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) throw new Error('Audit lead not found')
    const now = Date.now()
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      status: 'completed',
      updatedAt: now,
    })

    // Mirror onto the leads timeline so the /pipeline / /leads views
    // reflect the audit completion too.
    const leads = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', existing.email))
      .collect()
    if (leads.length > 0) {
      await ctx.db.insert('activity_log', {
        leadId: leads[0]._id,
        action: 'audit_chatbot_report_generated',
        details: `Score: ${args.score}, ${args.scoreLabel}`,
        timestamp: now,
      })
    }

    return { ok: true, id }
  },
})

// Mark a chatbot audit as reviewed on the board. Operator-only path;
// the auth check is the board's HMAC middleware (mirrors drafts.ts).
export const markReviewed = mutation({
  args: { id: v.id('audit_chatbot_leads') },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error('Audit lead not found')
    const now = Date.now()
    await ctx.db.patch(id, { status: 'reviewed', updatedAt: now })
    return { ok: true, id }
  },
})

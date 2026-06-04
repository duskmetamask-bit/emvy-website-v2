// Hermes function surface for the `leads` table.
//
// Rules (per Hermes Access Plan + locked architecture):
// - All Hermes writes carry `actor: 'hermes'` (set server-side, immutable).
// - `source` is immutable on update (per glossary attribution rule).
// - Hermes CANNOT delete.
// - Every function requires the Bearer token as the first arg.
// - Stage values are normalised from Blando's UPPERCASE taxonomy to
//   Convex's lowercase 9-stage taxonomy (see normaliseStage below).

import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermes } from '../hermesAuth'

// Blando UPPERCASE -> Convex lowercase. See Glossary 2026-06-01 for the
// canonical 9-stage taxonomy. Anything not in the map falls through to
// the lowercased input (so an already-correct value passes through).
const STAGE_MAP: Record<string, string> = {
  DISCOVER: 'discover',
  DISCOVERED: 'discover',
  RESEARCH: 'discover',
  ENRICH: 'discover',
  COLD: 'discover',
  WARM: 'engaged',
  HOT: 'qualified',
  SCORE: 'qualified',
  QUALIFIED: 'qualified',
  SEQUENCE: 'contacted',
  OUTREACH: 'contacted',
  SENT: 'contacted',
  REPLY: 'engaged',
  CALL: 'assessed',
  WON: 'active',
  LOST: 'lost',
  ARCHIVED: 'lost',
  SKIP: 'lost',
}

function normaliseStage(input: string | undefined): string | undefined {
  if (!input) return undefined
  const upper = input.toUpperCase()
  return STAGE_MAP[upper] ?? input.toLowerCase()
}

export const upsert = mutation({
  args: {
    token: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    contact: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    source: v.optional(v.string()),
    sector: v.optional(v.string()),
    score: v.optional(v.number()),
    painSignals: v.optional(v.array(v.string())),
    solutionMatched: v.optional(v.string()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    stage: v.optional(v.string()),
    discoveredAt: v.optional(v.number()),
    enrichedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, ...data } = args
    if (data.stage) data.stage = normaliseStage(data.stage)
    const existing = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', data.email))
      .first()
    if (existing) {
      const { source: _source, ...updates } = data
      await ctx.db.patch(existing._id, updates)
      return { id: existing._id, created: false }
    }
    const now = Date.now()
    const id = await ctx.db.insert('leads', {
      ...data,
      discoveredAt: data.discoveredAt ?? now,
      enrichedAt: data.enrichedAt ?? now,
    })
    await ctx.db.insert('activity_log', {
      leadId: id,
      action: 'lead_created',
      actor: 'hermes',
      details: data.source ? `source: ${data.source}` : undefined,
      timestamp: now,
    })
    return { id, created: true }
  },
})

export const updateStage = mutation({
  args: {
    token: v.string(),
    id: v.id('leads'),
    toStage: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, id, toStage, reason } = args
    const lead = await ctx.db.get(id)
    if (!lead) throw new Error('Lead not found')
    const fromStage = lead.stage ?? 'discover'
    const target = normaliseStage(toStage) ?? toStage
    if (fromStage === target) return { ok: true, noop: true }
    const patch: Record<string, unknown> = { stage: target }
    if (target === 'lost' && reason) patch.outcome = reason
    await ctx.db.patch(id, patch)
    await ctx.db.insert('activity_log', {
      leadId: id,
      action: 'stage_change',
      actor: 'hermes',
      details: reason
        ? `${fromStage} → ${target} (${reason})`
        : `${fromStage} → ${target}`,
      timestamp: Date.now(),
    })
    return { ok: true, fromStage, toStage: target }
  },
})

export const addActivity = mutation({
  args: {
    token: v.string(),
    leadId: v.id('leads'),
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const { token: _token, leadId, action, details } = args
    return await ctx.db.insert('activity_log', {
      leadId,
      action,
      actor: 'hermes',
      details,
      timestamp: Date.now(),
    })
  },
})

// Hermes function surface for the `actions` table.
//
// Rules (per Hermes Access Plan + locked architecture):
// - All Hermes writes carry `actor: 'hermes'` (set server-side, immutable).
// - Hermes CANNOT change `actor`, `source`, or `assignee`.
// - Hermes CANNOT delete. The full action surface is create/list/update/complete.
// - Every function requires the Bearer token as the first arg.
//
// This surface ships without Q1–Q6 of the Hermes Access Plan resolved.
// The function shapes are stable; the auth/transport decisions
// (proxy vs direct, rotation cadence, drafts.publish, lost from discover,
// idempotency) land in PRD-6.

import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermes } from '../hermesAuth'

const TRACKS = ['workspace', 'growth', 'clients', 'harden', 'polish'] as const
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const
const STATUSES = ['open', 'in_progress', 'done', 'blocked', 'dropped'] as const

function assertOneOf<T extends readonly string[]>(
  value: string,
  allowed: T,
  label: string
): void {
  if (!allowed.includes(value)) {
    throw new Error(
      `Invalid ${label}: ${value}. Allowed: ${allowed.join(', ')}`
    )
  }
}

export const list = query({
  args: {
    token: v.string(),
    status: v.optional(v.string()),
    track: v.optional(v.string()),
    priority: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const take = args.limit ?? 500
    if (args.status) {
      assertOneOf(args.status, STATUSES, 'status')
      return await ctx.db
        .query('actions')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(take)
    }
    if (args.track) {
      assertOneOf(args.track, TRACKS, 'track')
      return await ctx.db
        .query('actions')
        .withIndex('by_track', (q) => q.eq('track', args.track!))
        .order('desc')
        .take(take)
    }
    if (args.priority) {
      assertOneOf(args.priority, PRIORITIES, 'priority')
      return await ctx.db
        .query('actions')
        .withIndex('by_priority', (q) => q.eq('priority', args.priority!))
        .order('desc')
        .take(take)
    }
    return await ctx.db.query('actions').order('desc').take(take)
  },
})

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    track: v.string(),
    priority: v.string(),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    assertOneOf(args.track, TRACKS, 'track')
    assertOneOf(args.priority, PRIORITIES, 'priority')
    if (!args.title.trim()) {
      throw new Error('Hermes auth: title cannot be empty')
    }

    const now = Date.now()
    return await ctx.db.insert('actions', {
      title: args.title,
      description: args.description,
      track: args.track,
      priority: args.priority,
      status: 'open',
      assignee: 'hermes',
      actor: 'hermes',
      source: 'hermes',
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    token: v.string(),
    id: v.id('actions'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    if (args.priority) assertOneOf(args.priority, PRIORITIES, 'priority')
    if (args.status) assertOneOf(args.status, STATUSES, 'status')

    // Strip Hermes-controlled fields from the patch — actor/source/assignee
    // are immutable from Hermes's perspective.
    const { token: _token, id, ...fields } = args
    const patch: Record<string, unknown> = { ...fields, updatedAt: Date.now() }
    if (args.status === 'done') {
      patch.completedAt = Date.now()
    }
    await ctx.db.patch(id, patch)
    return id
  },
})

export const complete = mutation({
  args: {
    token: v.string(),
    id: v.id('actions'),
  },
  handler: async (ctx, args) => {
    requireHermes(args.token)
    const now = Date.now()
    await ctx.db.patch(args.id, {
      status: 'done',
      completedAt: now,
      updatedAt: now,
    })
    return args.id
  },
})

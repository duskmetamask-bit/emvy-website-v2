// Operator-side mutations for the `actions` table.
// All writes carry `actor: 'operator'` and `source: 'manual'`.
// The board calls these via `useMutation(api.actions.create)` etc.
//
// This mirrors the board's `convex/board/actions.ts` — both repos
// redeclare the same shape; the underlying table is shared (single
// Convex deployment).

import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const TRACKS = ['workspace', 'growth', 'clients', 'harden', 'polish'] as const
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const
const STATUSES = ['open', 'in_progress', 'done', 'blocked', 'dropped'] as const
const ASSIGNEES = ['operator', 'hermes'] as const

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
    status: v.optional(v.string()),
    track: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignee: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const take = args.limit ?? 500
    if (args.status) {
      return await ctx.db
        .query('actions')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(take)
    }
    if (args.track) {
      return await ctx.db
        .query('actions')
        .withIndex('by_track', (q) => q.eq('track', args.track!))
        .order('desc')
        .take(take)
    }
    if (args.assignee) {
      return await ctx.db
        .query('actions')
        .withIndex('by_assignee', (q) => q.eq('assignee', args.assignee!))
        .order('desc')
        .take(take)
    }
    return await ctx.db.query('actions').order('desc').take(take)
  },
})

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    track: v.string(),
    priority: v.string(),
    assignee: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    assertOneOf(args.track, TRACKS, 'track')
    assertOneOf(args.priority, PRIORITIES, 'priority')
    if (args.assignee) assertOneOf(args.assignee, ASSIGNEES, 'assignee')
    if (!args.title.trim()) {
      throw new Error('Operator actions: title cannot be empty')
    }

    const now = Date.now()
    return await ctx.db.insert('actions', {
      title: args.title,
      description: args.description,
      track: args.track,
      priority: args.priority,
      status: 'open',
      assignee: args.assignee ?? 'operator',
      actor: 'operator',
      source: 'manual',
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('actions'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    assignee: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.priority) assertOneOf(args.priority, PRIORITIES, 'priority')
    if (args.status) assertOneOf(args.status, STATUSES, 'status')
    if (args.assignee) assertOneOf(args.assignee, ASSIGNEES, 'assignee')

    const { id, ...fields } = args
    const patch: Record<string, unknown> = {
      ...fields,
      updatedAt: Date.now(),
    }
    if (args.status === 'done') {
      patch.completedAt = Date.now()
    }
    await ctx.db.patch(id, patch)
    return id
  },
})

export const complete = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    const now = Date.now()
    await ctx.db.patch(id, {
      status: 'done',
      completedAt: now,
      updatedAt: now,
    })
    return id
  },
})

export const drop = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    const now = Date.now()
    await ctx.db.patch(id, { status: 'dropped', updatedAt: now })
    return id
  },
})

export const reopen = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    const now = Date.now()
    await ctx.db.patch(id, {
      status: 'open',
      completedAt: undefined,
      updatedAt: now,
    })
    return id
  },
})

// Board-side actions table — same `actions` table as the website's
// `convex/actions.ts`, but exposed under `api.board.actions.*` so the board's
// generated API knows about it. Both repos redeclare the same query/mutation
// shape; the underlying table is shared (single Convex deployment).
//
// Mutations called from the board (operator) write `actor: 'operator'`
// (the default in the website's convex/actions.ts), and from the
// website's hermes/actions.ts they write `actor: 'hermes'`. The board's
// UI displays the actor pill per the architecture spec.

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const TRACKS = ['workspace', 'growth', 'clients', 'harden', 'polish'] as const;
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const;
const STATUSES = ['open', 'in_progress', 'done', 'blocked', 'dropped'] as const;

function assertOneOf<T extends readonly string[]>(value: string, allowed: T, label: string) {
  if (!allowed.includes(value)) {
    throw new Error(`Invalid ${label}: ${value}. Allowed: ${allowed.join(', ')}`);
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
    const take = args.limit ?? 500;
    if (args.status) {
      return await ctx.db
        .query('actions')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(take);
    }
    if (args.track) {
      return await ctx.db
        .query('actions')
        .withIndex('by_track', (q) => q.eq('track', args.track!))
        .order('desc')
        .take(take);
    }
    if (args.assignee) {
      return await ctx.db
        .query('actions')
        .withIndex('by_assignee', (q) => q.eq('assignee', args.assignee!))
        .order('desc')
        .take(take);
    }
    return await ctx.db.query('actions').order('desc').take(take);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    track: v.string(),
    priority: v.string(),
    assignee: v.optional(v.string()),
    source: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    assertOneOf(args.track, TRACKS, 'track');
    assertOneOf(args.priority, PRIORITIES, 'priority');
    if (args.assignee) assertOneOf(args.assignee, ['operator', 'hermes'], 'assignee');
    if (args.source) assertOneOf(args.source, ['manual', 'hermes', 'import'], 'source');

    const now = Date.now();
    return await ctx.db.insert('actions', {
      title: args.title,
      description: args.description,
      track: args.track,
      priority: args.priority,
      status: 'open',
      assignee: args.assignee ?? 'operator',
      actor: 'operator',
      source: args.source ?? 'manual',
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

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
    if (args.priority) assertOneOf(args.priority, PRIORITIES, 'priority');
    if (args.status) assertOneOf(args.status, STATUSES, 'status');
    if (args.assignee) assertOneOf(args.assignee, ['operator', 'hermes'], 'assignee');

    const { id, ...fields } = args;
    const patch: Record<string, unknown> = { ...fields, updatedAt: Date.now() };
    if (args.status === 'done') {
      patch.completedAt = Date.now();
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const complete = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    const now = Date.now();
    await ctx.db.patch(id, { status: 'done', completedAt: now, updatedAt: now });
    return id;
  },
});

export const drop = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    const now = Date.now();
    await ctx.db.patch(id, { status: 'dropped', updatedAt: now });
    return id;
  },
});

export const reopen = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    const now = Date.now();
    await ctx.db.patch(id, { status: 'open', completedAt: undefined, updatedAt: now });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id('actions') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

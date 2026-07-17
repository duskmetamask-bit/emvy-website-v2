import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const STATUSES = ['idea', 'promoted'] as const;

const DEFAULT_IDEAS = [
  {
    title: 'Bottle shop stocktake reorder agent',
    summary:
      'Turn bottle shop stocktake notes or photos into reorder suggestions and a manager-approved draft order.',
    category: 'Retail automation',
    source: 'operator',
    notes: 'Pilot with one store, one supplier set, and a human approval step before sending any order.',
  },
];

export const list = query({
  args: {
    status: v.optional(v.union(v.literal('idea'), v.literal('promoted'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.status) {
      return await ctx.db
        .query('build_ideas')
        .withIndex('by_status_and_createdAt', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('build_ideas')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('build_ideas') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const createIdea = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    category: v.string(),
    source: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    const summary = args.summary.trim();
    const category = args.category.trim();
    const source = args.source.trim();
    if (!title) throw new Error('Idea title cannot be empty');
    if (!summary) throw new Error('Idea summary cannot be empty');
    if (!category) throw new Error('Idea category cannot be empty');
    if (!source) throw new Error('Idea source cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('build_ideas', {
      title,
      summary,
      category,
      source,
      notes: args.notes?.trim() || undefined,
      status: 'idea',
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const updateIdea = mutation({
  args: {
    id: v.id('build_ideas'),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    category: v.optional(v.string()),
    source: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error('Build idea not found');
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.summary !== undefined) patch.summary = args.summary.trim();
    if (args.category !== undefined) patch.category = args.category.trim();
    if (args.source !== undefined) patch.source = args.source.trim();
    if (args.notes !== undefined) patch.notes = args.notes.trim() || undefined;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});

export const promoteIdea = mutation({
  args: { id: v.id('build_ideas') },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Build idea not found');
    const now = Date.now();
    const requestId = await ctx.db.insert('build_requests', {
      project: row.title,
      requestText: row.summary,
      status: 'requested',
      requestedBy: 'operator',
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(id, {
      status: 'promoted',
      promotedRequestId: requestId,
      promotedAt: now,
      updatedAt: now,
    });
    return { requestId };
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('build_ideas').collect();
    const byTitle = new Map(existing.map((row) => [row.title, row]));
    const now = Date.now();

    for (const idea of DEFAULT_IDEAS) {
      const current = byTitle.get(idea.title);
      const payload = {
        ...idea,
        status: (current?.status ?? 'idea') as (typeof STATUSES)[number],
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
      };

      if (current) {
        await ctx.db.patch(current._id, payload);
      } else {
        await ctx.db.insert('build_ideas', payload);
      }
    }

    return { count: DEFAULT_IDEAS.length };
  },
});

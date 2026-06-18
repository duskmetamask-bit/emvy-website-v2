// Hermes function surface for the competitor pricing matrix.
//
// Called by:
//   - The seed script (one-shot bootstrap of 11 rows + 5 recommendations)
//   - The intelligence agent when it produces a new pricing_matrix artifact
//     (POSTs a fresh matrix or PATCHes individual rows)
//
// Auth: requireHermesAgent(token, agent) where agent MUST be 'intelligence'.
// Cross-agent calls throw. Per-agent attribution pattern matches the
// marketing/intel/builds files: agentId is server-immutable, set on insert.

import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { requireHermesAgent } from '../hermesAuth';

export const upsertCompetitor = mutation({
  args: {
    token: v.string(),
    agent: v.literal('intelligence'),
    competitor: v.string(),
    location: v.string(),
    positioning: v.string(),
    website: v.string(),
    auditPrice: v.string(),
    auditFormat: v.string(),
    auditIncludes: v.string(),
    auditBuildCredit: v.boolean(),
    buildMin: v.string(),
    buildMax: v.string(),
    buildType: v.string(),
    buildNotes: v.string(),
    retainerPrice: v.string(),
    retainerIncludes: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent);
    const { token: _t, agent: _a, ...data } = args;
    const now = Date.now();
    const existing = await ctx.db
      .query('competitor_pricing')
      .withIndex('by_competitor', (q) => q.eq('competitor', data.competitor))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { ...data, updatedAt: now });
      return { id: existing._id, action: 'updated' as const };
    }
    const id = await ctx.db.insert('competitor_pricing', {
      ...data,
      isEmvy: data.competitor === 'EMVY',
      source: 'intel_agent',
      updatedAt: now,
    });
    return { id, action: 'created' as const };
  },
});

export const appendRecommendation = mutation({
  args: {
    token: v.string(),
    agent: v.literal('intelligence'),
    number: v.number(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent);
    const { token: _t, agent: _a, ...data } = args;
    const now = Date.now();
    const existing = await ctx.db
      .query('pricing_recommendation')
      .withIndex('by_number', (q) => q.eq('number', data.number))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: data.title,
        body: data.body,
      });
      return { id: existing._id, action: 'updated' as const };
    }
    const id = await ctx.db.insert('pricing_recommendation', {
      number: data.number,
      title: data.title,
      body: data.body,
      status: 'open',
      createdAt: now,
    });
    return { id, action: 'created' as const };
  },
});

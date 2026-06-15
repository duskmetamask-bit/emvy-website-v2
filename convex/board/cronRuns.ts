// Board-side read surface for the `cron_runs` table.
// Mirrors convex/board/intelligence.ts (list/stats).
// Written by the VPS `~/.hermes/bin/log_cron_health.py` via the
// website's `hermes/cronEntry:appendRun` mutation.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    agentId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.agentId) {
      return await ctx.db
        .query('cron_runs')
        .withIndex('by_agentId', (q) => q.eq('agentId', args.agentId as string))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('cron_runs')
      .withIndex('by_updatedAt')
      .order('desc')
      .take(limit);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('cron_runs').take(2000);
    const total = rows.length;
    const byState: Record<string, number> = {};
    const byAgent: Record<string, number> = {};
    for (const r of rows) {
      byState[r.state] = (byState[r.state] ?? 0) + 1;
      byAgent[r.agentId] = (byAgent[r.agentId] ?? 0) + 1;
    }
    return { total, byState, byAgent };
  },
});

// Board-side read surface for the `maya_content_topics` table.
// Mirrors convex/board/intelligence.ts (list/stats).
// Written by the VPS `~/.hermes/profiles/maya/bin/log_topics.py` via
// the website's `hermes/marketing.ts:appendTopic` mutation.
//
// Idempotent at the Convex layer (upsert by date). The VPS script parses
// the vault markdown file and POSTs one row per date.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 60;
    return await ctx.db
      .query('maya_content_topics')
      .withIndex('by_date')
      .order('asc')
      .take(limit);
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query('maya_content_topics')
      .withIndex('by_date', (q) => q.eq('date', date))
      .unique();
  },
});

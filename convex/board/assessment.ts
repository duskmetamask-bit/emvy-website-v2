// Operator-facing assessment results view. Powers /assessment.
// Reads the website's assessment_submissions table (canonical schema
// lives on the website, board mirrors it). Surfaces the submitter's
// name/email, the score + priority level, the recommendation, and
// the full answers object for the report.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    return await ctx.db
      .query('assessment_submissions')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('assessment_submissions') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Compact overview data for the operator dashboard. This remains a read-only
// projection over canonical assessment submissions.
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('assessment_submissions').take(1000);
    const last7d = Date.now() - 7 * 86_400_000;
    const recent = rows.filter((row) => (row.createdAt ?? 0) >= last7d).length;
    return { total: rows.length, recent };
  },
});

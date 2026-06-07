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

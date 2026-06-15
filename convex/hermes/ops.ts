// Operator-facing outreach queue operations.
// Re-timing helper: collapses all queued items to scheduledFor=now (or
// spaced within a single day) so the daily cron actually fires them.
//
// Auth: agent='mewy' (operator-driven; the board's API route calls this
// when the operator runs "reschedule queue" from the dashboard). The
// mewy token is in the board's server env.

import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { requireHermesAgent } from '../hermesAuth';

export const rescheduleQueue = mutation({
  args: {
    token: v.string(),
    agent: v.literal('mewy'),
    horizonHours: v.optional(v.number()),
    onlyStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const horizonHours = args.horizonHours ?? 24;
    const onlyStatus = args.onlyStatus ?? 'queued';
    const items = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', onlyStatus))
      .collect();
    const now = Date.now();
    const horizonMs = horizonHours * 60 * 60 * 1000;
    const step = items.length > 0 ? Math.floor(horizonMs / items.length) : 0;
    let updated = 0;
    for (let i = 0; i < items.length; i++) {
      const scheduledFor = horizonHours === 0 ? now - 1 : now + i * step;
      await ctx.db.patch(items[i]._id, { scheduledFor });
      updated++;
    }
    return { updated, total: items.length, horizonHours };
  },
});

export const requeueFailed = mutation({
  args: {
    token: v.string(),
    agent: v.literal('mewy'),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const items = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'failed'))
      .collect();
    const now = Date.now();
    for (const item of items) {
      await ctx.db.patch(item._id, {
        status: 'queued',
        scheduledFor: now - 1,
        lastError: undefined,
      });
    }
    return { requeued: items.length };
  },
});

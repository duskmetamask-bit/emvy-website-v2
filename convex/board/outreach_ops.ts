// Operator-facing outreach queue operations.
// Re-timing helper: collapses all queued items to scheduledFor=now (or
// spaced in a single day) so the daily cron actually fires them.

import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const rescheduleQueue = mutation({
  args: {
    horizonHours: v.optional(v.number()),
    onlyStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      // Spread forward from now so the daily cron picks them up.
      // HorizonHours=0 means "all due now" (now - 1ms to be safe against
      // a strict-less-than pickup).
      const scheduledFor = horizonHours === 0 ? now - 1 : now + i * step;
      await ctx.db.patch(items[i]._id, { scheduledFor });
      updated++;
    }
    return { updated, total: items.length, horizonHours };
  },
});

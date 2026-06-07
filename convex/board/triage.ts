// Reply triage — board view that surfaces leads needing operator action.
// Combines: leads table + email_inbox (inbound replies) + activity_log
// (recent moves) into a single ordered queue.

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const TRIAGE_STAGES = ['discover', 'contacted', 'engaged', 'qualified'] as const;
const TERMINAL_STAGES = ['active', 'lost', 'assessed'] as const;

export const listNeedingTriage = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = limit ?? 50;
    const leads = await ctx.db
      .query('leads')
      .order('desc')
      .take(300);

    const candidates = leads.filter(
      (l) => l.stage && TRIAGE_STAGES.includes(l.stage as never)
    );

    const enriched = await Promise.all(
      candidates.slice(0, take).map(async (lead) => {
        const [inbound, latestActivity, latestEvent] = await Promise.all([
          ctx.db
            .query('email_inbox')
            .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
            .order('desc')
            .first(),
          ctx.db
            .query('activity_log')
            .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
            .order('desc')
            .first(),
          ctx.db
            .query('email_events')
            .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
            .order('desc')
            .first(),
        ]);
        const lastTouch = Math.max(
          lead.lastTouchpoint ? 0 : 0,
          inbound?.receivedAt ?? 0,
          latestActivity?.timestamp ?? 0,
          latestEvent?.timestamp ?? 0
        );
        const hasReply = !!inbound;
        const isUnread = inbound?.status === 'unread';
        return {
          ...lead,
          lastInbound: inbound
            ? {
                from: inbound.from,
                subject: inbound.subject,
                snippet: (inbound.body ?? '').slice(0, 220),
                receivedAt: inbound.receivedAt,
                status: inbound.status,
                emailId: inbound._id,
              }
            : null,
          lastTouch,
          hasReply,
          isUnread,
        };
      })
    );

    // Sort: unread replies first, then any reply, then by recency
    enriched.sort((a, b) => {
      const score = (l: typeof a) =>
        (l.isUnread ? 1_000_000_000_000 : 0) +
        (l.hasReply ? 100_000_000_000 : 0) +
        l.lastTouch;
      return score(b) - score(a);
    });

    return enriched;
  },
});

export const countByStage = query({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.db.query('leads').collect();
    const counts: Record<string, number> = {};
    for (const l of leads) {
      const s = l.stage ?? 'unknown';
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  },
});

export const dailyDigest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const digests = await ctx.db
      .query('hermes_daily_digest')
      .withIndex('by_date')
      .order('desc')
      .take(limit ?? 14);
    const queuePending = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'queued'))
      .collect();
    const queueSent = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'sent'))
      .collect();
    const queueFailed = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'failed'))
      .collect();
    return {
      digests,
      queueCounts: {
        queued: queuePending.length,
        sent: queueSent.length,
        failed: queueFailed.length,
      },
    };
  },
});

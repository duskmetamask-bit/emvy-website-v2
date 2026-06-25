// Operator-facing sent-emails view. Powers /sent.
// Lists email_sends joined with their lead row + the most recent
// email_event (delivered/bounced/opened/clicked/complained) so the
// operator can see what's gone out and how it landed. Also aggregates
// eventCounts per send (delivered/opened/clicked/bounced/replied) so
// the /sent UI can show "↗ 3 · 👁 1" style micro-stats per row without
// making the client re-query.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const rows = await ctx.db
      .query('email_sends')
      .withIndex('by_sentAt')
      .order('desc')
      .take(limit);
    const filtered = args.status
      ? rows.filter((r) => (r.status ?? '').toLowerCase() === args.status!.toLowerCase())
      : rows;
    return Promise.all(
      filtered.map(async (send) => {
        const lead = send.leadId ? await ctx.db.get(send.leadId) : null;
        const latestEvent = send.leadId
          ? await ctx.db
              .query('email_events')
              .withIndex('by_lead', (q) => q.eq('leadId', send.leadId!))
              .order('desc')
              .first()
              .catch(() => null)
          : null;
        // Per-row event aggregates. Match by Resend email id (preferred)
        // or fall back to leadId if resendId is missing on very old rows.
        // Cap at 500 events per send to keep the query bounded.
        let events: Array<{ eventType: string }> = [];
        if (send.resendId) {
          events = await ctx.db
            .query('email_events')
            .withIndex('by_emailId', (q) => q.eq('emailId', send.resendId!))
            .take(500);
        } else if (send.leadId) {
          events = await ctx.db
            .query('email_events')
            .withIndex('by_lead', (q) => q.eq('leadId', send.leadId!))
            .take(500);
        }
        const eventCounts = {
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          replied: 0,
        };
        for (const e of events) {
          const k = e.eventType as keyof typeof eventCounts;
          if (k in eventCounts) eventCounts[k]++;
        }
        return { ...send, lead, latestEvent, eventCounts };
      }),
    );
  },
});
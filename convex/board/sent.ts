// Operator-facing sent-emails view. Powers /sent.
// Lists email_sends joined with their lead row + the most recent
// email_event (delivered/bounced/opened/clicked/complained) so the
// operator can see what's gone out and how it landed.

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
        return { ...send, lead, latestEvent };
      }),
    );
  },
});

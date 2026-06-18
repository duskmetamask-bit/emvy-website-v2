// ONE-OFF diag query: dump recent sent email_drafts with their full body
// so the operator can see what Blando has been writing. Delete after
// the diagnostic.

import { query } from './_generated/server';
import { v } from 'convex/values';

export const recentSentBodies = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const cap = args.limit ?? 8;
    const all = await ctx.db.query('email_drafts').order('desc').take(cap * 5);
    const sent = all
      .filter((d) => d.status === 'sent')
      .slice(0, cap);
    return Promise.all(
      sent.map(async (d) => {
        const lead = d.leadId ? await ctx.db.get(d.leadId) : null;
        return {
          id: d._id,
          subject: d.subject,
          body: d.body,
          createdAt: d._creationTime,
          leadEmail: lead?.email,
          leadCompany: lead?.company,
        };
      }),
    );
  },
});

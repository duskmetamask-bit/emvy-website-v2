// Operator-facing follow-up sequence view. Powers /follow-ups.
//
// The follow-up sequence is the canned touch 2 / touch 3 set that Hermes
// sends automatically after an initial outreach goes out. It is
// intentionally template-only (no per-lead customisation) — the operator
// wants visibility into the schedule and what each lead is in line to
// receive, not the ability to rewrite the templates from the board.
//
// Data model reminder (mirrored from emvy-website-v2):
// - outreach_followups.touch = 2 → scheduled ~3 days after initial send
// - outreach_followups.touch = 3 → scheduled ~7 days after initial send
// - status = 'scheduled' | 'sent' | 'cancelled' | 'failed'
// Templates live in the website's `convex/hermes/outreach2.ts` (was
// `convex/hermes/runner.ts` pre-2026-07-03 Slice 2a). This file only
// surfaces the schedule and the live state, plus a static copy of the
// templates for operator visibility.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export const listFollowups = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('scheduled'),
        v.literal('sent'),
        v.literal('cancelled'),
        v.literal('failed'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const rows = args.status
      ? await ctx.db
          .query('outreach_followups')
          .withIndex('by_status_sendAt', (qq) => qq.eq('status', args.status!))
          .order('desc')
          .take(limit)
      : await ctx.db
          .query('outreach_followups')
          .order('desc')
          .take(limit);
    const withLead = await Promise.all(
      rows.map(async (f) => {
        const lead = f.leadId ? await ctx.db.get(f.leadId) : null;
        return { ...f, lead };
      }),
    );
    return withLead;
  },
});

export const sequenceStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('outreach_followups').collect();
    const counts = {
      scheduled: 0,
      sent: 0,
      cancelled: 0,
      failed: 0,
    };
    for (const f of all) {
      const key = (f.status ?? 'scheduled') as keyof typeof counts;
      if (key in counts) counts[key] += 1;
    }
    return { counts, total: all.length };
  },
});

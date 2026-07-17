// Activity feed: merged view of email_events + activity_log, newest-first.
//
// The resend webhook (website-v2/app/api/webhooks/resend) writes email_events;
// the lead-stage transitions and other Convex mutations write activity_log.
// Slice 1 of the board v2 build (Decision 6, 2026-06-22 grill-me) surfaces
// both on /activity so the operator can see what's happening at a glance.
//
// Pure merge/summarise logic lives in lib/activity.ts so it can be unit-tested
// without a DB (per CLAUDE.md "no DB mocks" rule).
//
// KNOWN LIMITATION: email_events does not have a `by_timestamp` index yet.
// We fetch all rows and sort in-memory. Fine up to ~5k events. Index addition
// is a separate website-v2 schema deploy (per ADR 0002 / CLAUDE.md).

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { mergeActivity, summarizeActivity } from '../../lib/activity';

export const list = query({
  args: {
    limit: v.optional(v.number()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const since = args.since ?? 0;

    const [emailRows, activityRows] = await Promise.all([
      ctx.db.query('email_events').collect(),
      since
        ? ctx.db
            .query('activity_log')
            .withIndex('by_timestamp', (q) => q.gte('timestamp', since))
            .collect()
        : ctx.db.query('activity_log').collect(),
    ]);

    const leadIds = new Set<string>();
    for (const r of emailRows) if (r.leadId) leadIds.add(r.leadId);
    for (const r of activityRows) leadIds.add(r.leadId);
    const leads = await Promise.all(Array.from(leadIds).map((id) => ctx.db.get(id as any)));
    const leadNameById = new Map<string, string>();
    for (const l of leads) {
      if (l && '_id' in l) leadNameById.set(l._id as string, (l as any).contact ?? (l as any).company ?? 'Lead');
    }

    return mergeActivity(emailRows, activityRows, leadNameById, since).slice(0, limit);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const [emails, activities] = await Promise.all([
      ctx.db.query('email_events').collect(),
      ctx.db.query('activity_log').collect(),
    ]);
    return summarizeActivity(emails, activities);
  },
});

// Operator-facing contact-form submissions view. Powers /contact-submissions.
//
// Reads the contact_submissions table (canonical schema lives on the website,
// board mirrors it). Surfaces every inbound contact form entry from emvyai.com
// with the submitter's name, email, phone, company, message, and source —
// so the operator can see who came in and follow up from the board.

import { query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    return await ctx.db
      .query('contact_submissions')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('contact_submissions') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Stats — counts for the overview tile on the board ("Contact forms").
// Mirror of the website's `convex/board/contactSubmissions.ts` (per ADR-007
// the website is the canonical schema/function owner; board mirrors). Powers
// the new "Contact forms" hero KPI on the board's overview page.
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('contact_submissions').take(1000);
    let total = rows.length;
    const last7d = Date.now() - 7 * 86_400_000;
    let recent = 0;
    let notified = 0;
    for (const r of rows) {
      if ((r.createdAt ?? 0) >= last7d) recent += 1;
      if (r.notifiedAt) notified += 1;
    }
    return { total, recent, notified };
  },
});

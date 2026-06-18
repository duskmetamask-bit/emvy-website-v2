// Operator-facing audit chatbot review view. Powers /audit-chatbot.
//
// Reads the website's audit_chatbot_leads table (canonical schema lives
// on the website, board mirrors it). The chat writes a 'new' row at
// email-submit time. The MiniMax M2.7 5-section report lands a few
// seconds later and the chat front-end calls :update to flip status to
// 'completed' + fill opportunities/quickWin/first90Days. This view
// surfaces both states side-by-side.
//
// SCOPE: read + mark-reviewed. Conversion to leads pipeline is a
// follow-up slice (board will get a "convert" mutation that promotes
// the audit row into the standard leads flow).

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

const VALID_STATUSES = ['new', 'completed', 'reviewed', 'converted'] as const;
type AuditStatus = (typeof VALID_STATUSES)[number];

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('new'),
        v.literal('completed'),
        v.literal('reviewed'),
        v.literal('converted'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const rows = args.status
      ? await ctx.db
          .query('audit_chatbot_leads')
          .withIndex('by_status', (q) => q.eq('status', args.status!))
          .order('desc')
          .take(limit)
      : await ctx.db
          .query('audit_chatbot_leads')
          .order('desc')
          .take(limit);
    return rows;
  },
});

export const get = query({
  args: { id: v.id('audit_chatbot_leads') },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return null;

    // Pull the leads-row activity timeline so the operator sees the audit
    // in context with the broader lead history. Look up by email since
    // audit_chatbot_leads doesn't carry a direct leadId.
    const leads = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', row.email))
      .collect();
    const leadId = leads[0]?._id ?? null;
    const activity = leadId
      ? await ctx.db
          .query('activity_log')
          .withIndex('by_lead', (q) => q.eq('leadId', leadId))
          .order('desc')
          .take(20)
      : [];

    return { row, lead: leads[0] ?? null, activity };
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('audit_chatbot_leads').take(1000);
    const total = rows.length;
    const byStatus: Record<AuditStatus, number> = {
      new: 0,
      completed: 0,
      reviewed: 0,
      converted: 0,
    };
    for (const r of rows) {
      const k = (r.status ?? 'new') as AuditStatus;
      if (k in byStatus) byStatus[k] += 1;
    }
    return { total, byStatus };
  },
});

export const markReviewed = mutation({
  args: { id: v.id('audit_chatbot_leads') },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Audit lead not found');
    const now = Date.now();
    await ctx.db.patch(id, { status: 'reviewed', updatedAt: now });
    return { ok: true, id };
  },
});

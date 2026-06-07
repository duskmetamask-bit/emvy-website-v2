import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// Read functions for the board's /inbox page. The website's
// convex/email_inbox.ts owns recordInboundEmail (called by the
// /api/webhooks/email-inbound route). The board only needs reads + a
// markRead mutation; it shares the email_inbox table via the shared
// glad-camel-940 deployment.

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query('email_inbox')
      .withIndex('by_receivedAt')
      .order('desc')
      .take(limit ?? 100);
  },
});

export const listByLead = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    return await ctx.db
      .query('email_inbox')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .order('desc')
      .collect();
  },
});

export const listUnread = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query('email_inbox')
      .withIndex('by_status', (q) => q.eq('status', 'unread'))
      .order('desc')
      .take(limit ?? 100);
  },
});

export const countUnread = query({
  handler: async (ctx) => {
    const unread = await ctx.db
      .query('email_inbox')
      .withIndex('by_status', (q) => q.eq('status', 'unread'))
      .collect();
    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id('email_inbox') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: 'read' });
  },
});

export const get = query({
  args: { id: v.id('email_inbox') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

// Parse the bare address out of an RFC822 From/To header value.
// "Jane Doe <jane@example.com>" → "jane@example.com"
// "jane@example.com"            → "jane@example.com"
export function parseAddress(s: string): string {
  const angleMatch = s.match(/<([^>]+)>/)
  if (angleMatch) return angleMatch[1].toLowerCase().trim()
  const bareMatch = s.match(/([^\s,<>]+@[^\s,<>]+)/)
  if (bareMatch) return bareMatch[1].toLowerCase().trim()
  return s.toLowerCase().trim()
}

// Called by the website's /api/webhooks/email-inbound route, which is
// in turn called by the Cloudflare Email Worker. The Worker HMAC-signs
// the body, so the route is the trust boundary; this mutation just
// shapes the row and auto-links.
export const recordInboundEmail = mutation({
  args: {
    messageId: v.string(),
    from: v.string(),
    to: v.string(),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    htmlBody: v.optional(v.string()),
    inReplyTo: v.optional(v.string()),
    references: v.optional(v.string()),
    receivedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const fromAddress = parseAddress(args.from)

    // Idempotency: if we've already recorded this messageId, return the
    // existing row. Cheap because the rowcount for email_inbox will be
    // small; if it ever gets large, add a by_messageId index.
    const existing = await ctx.db
      .query('email_inbox')
      .withIndex('by_receivedAt', (q) => q)
      .filter((q) => q.eq(q.field('messageId'), args.messageId))
      .first()
    if (existing) {
      return { id: existing._id, leadId: existing.leadId, duplicate: true }
    }

    // Auto-link to lead by exact email match. If a lead's email has
    // changed, this won't pick it up — the link is best-effort.
    let leadId: Id<'leads'> | undefined
    const leads = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', fromAddress))
      .collect()
    if (leads[0]) leadId = leads[0]._id

    const id = await ctx.db.insert('email_inbox', {
      messageId: args.messageId,
      from: args.from,
      fromAddress,
      to: args.to,
      subject: args.subject,
      body: args.body,
      htmlBody: args.htmlBody,
      inReplyTo: args.inReplyTo,
      references: args.references,
      receivedAt: args.receivedAt,
      leadId,
      status: 'unread',
    })

    // Log activity on the lead's timeline so the lead detail view shows
    // the inbound reply as a pill. No `actor` field yet — that lands in
    // the Hermes migration (Q3 of the access plan). When actor lands,
    // backfill this to `actor: 'inbox'`.
    if (leadId) {
      await ctx.db.insert('activity_log', {
        leadId,
        action: 'email_received',
        details: args.subject || '(no subject)',
        timestamp: args.receivedAt,
      })
    }

    return { id, leadId, duplicate: false }
  },
})

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query('email_inbox')
      .withIndex('by_receivedAt')
      .order('desc')
      .take(limit ?? 100)
  },
})

export const listByLead = query({
  args: { leadId: v.id('leads') },
  handler: async (ctx, { leadId }) => {
    return await ctx.db
      .query('email_inbox')
      .withIndex('by_lead', (q) => q.eq('leadId', leadId))
      .order('desc')
      .collect()
  },
})

export const listUnread = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query('email_inbox')
      .withIndex('by_status', (q) => q.eq('status', 'unread'))
      .order('desc')
      .take(limit ?? 100)
  },
})

export const countUnread = query({
  handler: async (ctx) => {
    const unread = await ctx.db
      .query('email_inbox')
      .withIndex('by_status', (q) => q.eq('status', 'unread'))
      .collect()
    return unread.length
  },
})

export const markRead = mutation({
  args: { id: v.id('email_inbox') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: 'read' })
  },
})

export const get = query({
  args: { id: v.id('email_inbox') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})

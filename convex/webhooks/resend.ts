import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

// Resend Webhook Handler for email events
export const handleEmailEvent = mutation({
  args: {
    // Resend sends these fields
    type: v.string(), // delivered, opened, clicked, bounced, complained
    created_at: v.number(),
    recipient: v.optional(v.string()),
    email_id: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    ip: v.optional(v.string()),
    // Extra metadata
    data: v.optional(v.object({
      timestamp: v.optional(v.number()),
      url: v.optional(v.string()),
      link_id: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Find lead by email
    let leadId: Id<'leads'> | undefined = undefined
    if (args.recipient) {
      const leads = await ctx.db.query('leads').withIndex('by_email', (q) => q.eq('email', args.recipient!)).collect()
      leadId = leads[0]?._id
    }

    // Store event
    const event = await ctx.db.insert('email_events', {
      emailId: args.email_id,
      leadId,
      eventType: args.type,
      timestamp: args.created_at,
      metadata: args.data ? JSON.stringify(args.data) : undefined,
    })

    // Update email_sends status if we have email_id
    if (args.email_id && leadId) {
      const sends = await ctx.db.query('email_sends').withIndex('by_lead', (q) => q.eq('leadId', leadId)).collect()
      const latestSend = sends.find(s => s.subject) // Match by subject or latest
      if (latestSend) {
        // Map event types to statuses
        const statusMap: Record<string, string> = {
          delivered: 'delivered',
          opened: 'opened',
          clicked: 'opened',
          bounced: 'bounced',
          complained: 'bounced',
        }
        const newStatus = statusMap[args.type] || 'sent'
        await ctx.db.patch(latestSend._id, { status: newStatus })
      }
    }

    // Log activity + stage transition
    if (leadId) {
      const lead = await ctx.db.get(leadId)
      const currentStage = lead?.stage

      if (args.type === 'delivered' && (!currentStage || currentStage === 'discover')) {
        await ctx.db.patch(leadId, {
          stage: 'contacted',
          lastTouchpoint: 'email_delivered',
        })
        await ctx.db.insert('activity_log', {
          leadId,
          action: 'stage_change',
          details: 'discover → contacted via email.delivered',
          timestamp: Date.now(),
        })
      } else if (
        (args.type === 'opened' || args.type === 'clicked') &&
        (!currentStage || currentStage === 'discover' || currentStage === 'contacted')
      ) {
        await ctx.db.patch(leadId, {
          stage: 'engaged',
          lastTouchpoint: args.type === 'opened' ? 'email_opened' : 'email_clicked',
        })
        await ctx.db.insert('activity_log', {
          leadId,
          action: 'stage_change',
          details: `→ engaged via email.${args.type}`,
          timestamp: Date.now(),
        })
      }

      // Auto-suppress on bounce or complaint — cancel E2/E3 follow-ups
      if (args.type === 'bounced' || args.type === 'complained') {
        const now = Date.now()
        await ctx.db.patch(leadId, {
          unsubscribedAt: now,
          stage: 'unsubscribed',
          lastTouchpoint: args.type === 'bounced' ? 'email_bounced' : 'email_complaint',
        })
        // Cancel pending queue items for this lead
        const queue = await ctx.db.query('outreach_queue')
          .withIndex('by_lead_state', (q) => q.eq('leadId', leadId).eq('status', 'queued'))
          .collect()
        for (const q of queue) {
          await ctx.db.patch(q._id, { status: 'suppressed' })
        }
      }

      await ctx.db.insert('activity_log', {
        leadId,
        action: `email_${args.type}`,
        details: `${args.type} - ${args.recipient}`,
        timestamp: Date.now(),
      })
    }

    return { status: 'success', eventId: event }
  },
})
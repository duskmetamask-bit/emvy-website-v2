import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { internal } from '../_generated/api'

// Contact form submission
export const submit = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.insert('contact_submissions', {
      ...args,
      createdAt: Date.now(),
    })

    // Auto-create lead from contact
    if (args.email) {
      const existingLeads = await ctx.db.query('leads').withIndex('by_email', (q) => q.eq('email', args.email!)).collect()

      if (existingLeads.length === 0) {
        const leadId = await ctx.db.insert('leads', {
          email: args.email,
          contact: args.name,
          phone: args.phone,
          company: args.company,
          source: args.source || 'contact-form',
          stage: 'discover',
          discoveredAt: Date.now(),
          score: 5, // Default score for contact form
        })

        // Log activity
        await ctx.db.insert('activity_log', {
          leadId,
          action: 'lead_created',
          details: `From contact form: ${args.name || args.email}`,
          timestamp: Date.now(),
        })
      }
    }

    // Fire-and-forget operator notification (Resend email). Idempotent
    // — re-runs of notifyOperator check notifiedAt and no-op.
    await ctx.scheduler.runAfter(0, internal.contact_notify_action.notifyOperator, {
      submissionId: submission,
    })

    return { status: 'success', submissionId: submission }
  },
})
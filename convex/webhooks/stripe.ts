import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

// Stripe webhook handler
export const handlePaymentEvent = mutation({
  args: {
    type: v.string(),
    data: v.object({
      object: v.object({
        id: v.string(),
        amount: v.number(),
        currency: v.optional(v.string()),
        status: v.string(),
        description: v.optional(v.string()),
        metadata: v.optional(v.object({
          leadId: v.optional(v.string()),
        })),
      }),
    }),
  },
  handler: async (ctx, args) => {
    const { type, data } = args
    const payment = data.object

    // Find lead if linked. Three-tier match:
    //   1. metadata.leadId (set by our own checkout flows — emvy-board's
    //      parked Stripe build, the website's own Stripe routes)
    //   2. receipt_email on the PaymentIntent (most reliable for Cal.com-native
    //      Stripe — Cal.com forwards the booker's email)
    //   3. fallback to metadata.email if present
    // Without the fallback, payments from Cal.com's native Stripe integration
    // never link to leads (Cal.com sets its own metadata, not ours).
    let leadId: Id<'leads'> | undefined = undefined
    if (payment.metadata?.leadId) {
      const leads = await ctx.db.query('leads').collect()
      const lead = leads.find(l => l._id.toString() === payment.metadata!.leadId)
      leadId = lead?._id
    }
    if (!leadId) {
      const email =
        (payment as unknown as { receipt_email?: string }).receipt_email ??
        (payment.metadata as { email?: string } | undefined)?.email
      if (email) {
        const leads = await ctx.db
          .query('leads')
          .withIndex('by_email', (q) => q.eq('email', email))
          .collect()
        leadId = leads[0]?._id
      }
    }

    // Map Stripe events to our status
    const statusMap: Record<string, string> = {
      'payment_intent.succeeded': 'succeeded',
      'payment_intent.payment_failed': 'failed',
      'payment_intent.canceled': 'cancelled',
      'charge.refunded': 'refunded',
    }

    const status = statusMap[type] || payment.status

    // Create or update payment record
    const existingPayments = await ctx.db.query('payments')
      .withIndex('by_stripeId', (q) => q.eq('stripePaymentIntentId', payment.id))
      .collect()

    let paymentId: Id<'payments'>

    if (existingPayments.length > 0) {
      await ctx.db.patch(existingPayments[0]._id, { status })
      paymentId = existingPayments[0]._id
    } else {
      paymentId = await ctx.db.insert('payments', {
        leadId,
        stripePaymentIntentId: payment.id,
        amount: payment.amount,
        currency: payment.currency || 'usd',
        status,
        description: payment.description,
        createdAt: Date.now(),
      })
    }

    // Log activity + stage transition
    if (leadId && status === 'succeeded') {
      const lead = await ctx.db.get(leadId)
      const currentStage = lead?.stage
      if (currentStage === 'proposal_sent' || !currentStage) {
        await ctx.db.patch(leadId, {
          stage: 'implementing',
          lastTouchpoint: 'payment_succeeded',
        })
        await ctx.db.insert('activity_log', {
          leadId,
          action: 'stage_change',
          details: `${currentStage || 'new'} → implementing via payment ($${(payment.amount / 100).toFixed(2)} ${payment.currency?.toUpperCase() || 'USD'})`,
          timestamp: Date.now(),
        })
      }
      await ctx.db.insert('activity_log', {
        leadId,
        action: 'payment_received',
        details: `$${(payment.amount / 100).toFixed(2)} ${payment.currency?.toUpperCase() || 'USD'}`,
        timestamp: Date.now(),
      })
    }

    return { status: 'success', paymentId }
  },
})

// List payments
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query('payments').withIndex('by_status', (q) => q.eq('status', args.status!)).collect()
    }
    return await ctx.db.query('payments').order('desc').take(100)
  },
})

// Get payment stats
export const getPaymentStats = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query('payments').collect()

    const byStatus: Record<string, number> = {}
    const byStatusAmount: Record<string, number> = {}
    let totalAmount = 0

    for (const p of payments) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
      if (p.status === 'succeeded') {
        byStatusAmount['succeeded'] = (byStatusAmount['succeeded'] || 0) + p.amount
        totalAmount += p.amount
      }
    }

    return {
      total: payments.length,
      succeeded: byStatus['succeeded'] || 0,
      failed: byStatus['failed'] || 0,
      pending: byStatus['pending'] || 0,
      totalRevenue: totalAmount,
      currency: 'cents',
    }
  },
})
import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'

// Cal.com Webhook Handler
export const handleBooking = mutation({
  args: {
    event: v.string(),
    payload: v.object({
      eventTypeName: v.optional(v.string()),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      title: v.optional(v.string()),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      location: v.optional(v.string()),
      // Paid-booking fields (Cal.com's v2 BookingOutput doesn't include these,
      // but the route forwards them defensively so we capture them if Cal.com
      // ever adds them or the webhook payload is enriched upstream).
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      paymentId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    if (
      args.event !== 'BOOKING_CREATED' &&
      args.event !== 'BOOKING_CANCELLED' &&
      args.event !== 'BOOKING_PAID'
    ) {
      return { status: 'ignored', event: args.event }
    }

    const { payload } = args
    const bookingTime = payload.startTime ? new Date(payload.startTime).getTime() : Date.now()

    // Find lead by email
    let leadId: Id<'leads'> | undefined = undefined
    if (payload.email) {
      const leads = await ctx.db.query('leads').withIndex('by_email', (q) => q.eq('email', payload.email)).collect()
      leadId = leads[0]?._id
    }

    // Create booking (BOOKING_PAID still creates one if not already present —
    // BOOKING_CREATED usually fires first, but defensive in case Cal.com order
    // differs or the BOOKING_CREATED webhook was missed).
    const eventId = `${payload.eventTypeName || 'unknown'}_${bookingTime}`
    const existing = await ctx.db
      .query('cal_bookings')
      .filter((q) => q.eq(q.field('eventId'), eventId))
      .first()

    let bookingId: Id<'cal_bookings'>
    if (existing) {
      bookingId = existing._id
      if (args.event === 'BOOKING_CANCELLED') {
        await ctx.db.patch(existing._id, { status: 'cancelled' })
      } else if (args.event === 'BOOKING_PAID') {
        await ctx.db.patch(existing._id, { status: 'confirmed' })
      }
    } else {
      bookingId = await ctx.db.insert('cal_bookings', {
        leadId,
        eventId,
        bookingTime,
        status: args.event === 'BOOKING_CANCELLED' ? 'cancelled' : args.event === 'BOOKING_PAID' ? 'confirmed' : 'scheduled',
        name: payload.name,
        email: payload.email,
        createdAt: Date.now(),
      })
    }

    // If this is BOOKING_PAID with a payment reference, write a payments row so
    // the board's pipeline can show paid bookings even if Stripe's webhook
    // (which carries the real amount/currency) is configured separately.
    if (args.event === 'BOOKING_PAID' && payload.price && payload.price > 0) {
      await ctx.db.insert('payments', {
        leadId,
        stripePaymentIntentId: payload.paymentId ?? undefined,
        amount: payload.price,
        currency: (payload.currency ?? 'usd').toLowerCase(),
        status: 'succeeded',
        description: payload.eventTypeName,
        createdAt: Date.now(),
      })
    }

    // Log activity + stage transition
    if (leadId) {
      if (args.event === 'BOOKING_CREATED') {
        const lead = await ctx.db.get(leadId)
        const currentStage = lead?.stage
        if (!currentStage || ['discover', 'contacted', 'engaged', 'assessed'].includes(currentStage)) {
          await ctx.db.patch(leadId, {
            stage: 'qualified',
            lastTouchpoint: 'cal_booked',
          })
          await ctx.db.insert('activity_log', {
            leadId,
            action: 'stage_change',
            details: `${currentStage || 'new'} → qualified via Cal.com booking (${payload.eventTypeName})`,
            timestamp: Date.now(),
          })
        }
      } else if (args.event === 'BOOKING_PAID') {
        await ctx.db.insert('activity_log', {
          leadId,
          action: 'payment_received',
          details: payload.price
            ? `$${(payload.price / 100).toFixed(2)} ${(payload.currency ?? 'USD').toUpperCase()} via Cal.com booking (${payload.eventTypeName})`
            : `Cal.com booking payment (${payload.eventTypeName})`,
          timestamp: Date.now(),
        })
      }
      await ctx.db.insert('activity_log', {
        leadId,
        action:
          args.event === 'BOOKING_CANCELLED'
            ? 'booking_cancelled'
            : args.event === 'BOOKING_PAID'
              ? 'booking_paid'
              : 'booking_created',
        details: `${payload.name} - ${payload.eventTypeName}`,
        timestamp: Date.now(),
      })
    }

    return { status: 'success', bookingId }
  },
})

// List bookings
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status !== undefined) {
      return await ctx.db.query('cal_bookings').withIndex('by_status', (q) => q.eq('status', args.status!)).collect()
    }
    return await ctx.db.query('cal_bookings').collect()
  },
})

// Update booking status
export const updateStatus = mutation({
  args: {
    id: v.id('cal_bookings'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })
  },
})
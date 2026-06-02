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
    }),
  },
  handler: async (ctx, args) => {
    if (args.event !== 'BOOKING_CREATED' && args.event !== 'BOOKING_CANCELLED') {
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

    // Create booking
    const booking = await ctx.db.insert('cal_bookings', {
      leadId,
      eventId: `${payload.eventTypeName || 'unknown'}_${bookingTime}`,
      bookingTime,
      status: args.event === 'BOOKING_CANCELLED' ? 'cancelled' : 'scheduled',
      name: payload.name,
      email: payload.email,
      createdAt: Date.now(),
    })

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
      }
      await ctx.db.insert('activity_log', {
        leadId,
        action: args.event === 'BOOKING_CANCELLED' ? 'booking_cancelled' : 'booking_created',
        details: `${payload.name} - ${payload.eventTypeName}`,
        timestamp: Date.now(),
      })
    }

    return { status: 'success', bookingId: booking }
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
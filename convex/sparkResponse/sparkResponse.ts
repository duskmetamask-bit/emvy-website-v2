import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Writes a completed VAPI call to the spark_response_calls table.
 * Called by the VAPI webhook handler at:
 *   app/api/spark-response/webhook/route.ts
 */
export const writeCall = mutation({
  args: {
    callSid: v.string(),
    callerName: v.optional(v.string()),
    callerPhone: v.optional(v.string()),
    jobType: v.optional(v.string()),
    address: v.optional(v.string()),
    outcome: v.string(),
    ownerPhone: v.string(),
    ownerTelegramChatId: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    calBookingUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if this callSid was already written
    const existing = await ctx.db
      .query('spark_response_calls')
      .withIndex('by_callSid', (q) => q.eq('callSid', args.callSid))
      .unique()

    if (existing) {
      return { existingId: existing._id }
    }

    const id = await ctx.db.insert('spark_response_calls', {
      callSid: args.callSid,
      callerName: args.callerName,
      callerPhone: args.callerPhone,
      jobType: args.jobType,
      address: args.address,
      outcome: args.outcome,
      ownerPhone: args.ownerPhone,
      ownerTelegramChatId: args.ownerTelegramChatId,
      durationSeconds: args.durationSeconds,
      calBookingUrl: args.calBookingUrl,
      notes: args.notes,
      smsSentToCaller: false,
      telegramNotified: false,
      createdAt: Date.now(),
    })

    return { id }
  },
})

/**
 * Lists recent calls for an owner phone number (for dashboard).
 */
export const listByOwner = query({
  args: {
    ownerPhone: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50
    const rows = await ctx.db
      .query('spark_response_calls')
      .withIndex('by_ownerPhone', (q) => q.eq('ownerPhone', args.ownerPhone))
      .take(limit)
    return rows.sort((a, b) => b.createdAt - a.createdAt)
  },
})

import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

// Email Drafts
export const listDrafts = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query('email_drafts').withIndex('by_status', (q) => q.eq('status', args.status)).collect()
    }
    return await ctx.db.query('email_drafts').collect()
  },
})

export const createDraft = mutation({
  args: {
    leadId: v.optional(v.id('leads')),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('email_drafts', {
      ...args,
      status: 'draft',
      createdAt: Date.now(),
    })
  },
})

export const updateDraft = mutation({
  args: {
    id: v.id('email_drafts'),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

// Email Sends
export const logSend = mutation({
  args: {
    leadId: v.id('leads'),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('email_sends', {
      ...args,
      status: 'sent',
      sentAt: Date.now(),
    })
  },
})

export const updateSendStatus = mutation({
  args: {
    id: v.id('email_sends'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })
  },
})

// Cal Bookings
export const createBooking = mutation({
  args: {
    leadId: v.optional(v.id('leads')),
    eventId: v.string(),
    bookingTime: v.number(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('cal_bookings', {
      ...args,
      status: 'scheduled',
      createdAt: Date.now(),
    })
  },
})

export const updateBookingStatus = mutation({
  args: {
    id: v.id('cal_bookings'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })
  },
})
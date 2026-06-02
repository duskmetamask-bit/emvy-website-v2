import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('leads').collect()
  },
})

export const create = mutation({
  args: {
    company: v.optional(v.string()),
    contact: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('leads', {
      ...args,
      score: 0,
      discoveredAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('leads'),
    company: v.optional(v.string()),
    contact: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    sector: v.optional(v.string()),
    stage: v.optional(v.string()),
    score: v.optional(v.number()),
    painSignals: v.optional(v.array(v.string())),
    icpMatch: v.optional(v.boolean()),
    solutionMatched: v.optional(v.string()),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})
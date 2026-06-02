import { query } from '../_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: { sector: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sector) {
      return await ctx.db
        .query('case_studies')
        .withIndex('by_sector', (q) => q.eq('sector', args.sector))
        .order('desc')
        .collect()
    }
    return await ctx.db.query('case_studies').order('desc').collect()
  },
})

export const sectors = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('case_studies').collect()
    const set = new Set<string>()
    for (const cs of all) {
      if (cs.sector) set.add(cs.sector)
    }
    return Array.from(set).sort()
  },
})

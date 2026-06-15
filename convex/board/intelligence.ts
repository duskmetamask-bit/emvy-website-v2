// Board-side read surface for the `intelligence_reports` table.
// Mirrors convex/board/maya.ts (list/get/stats).
// The /intelligence page in app/(board)/intelligence calls these.

import { query } from '../_generated/server'
import { v } from 'convex/values'

const REPORT_TYPE_LABELS: Record<string, string> = {
  daily_competitive_intel: 'Daily Competitive Intel',
  competitor_pricing: 'Competitor Pricing',
  competitor_deep_dive: 'Competitor Deep Dive',
  compliance_tracker: 'Compliance Tracker',
  sentiment_pulse: 'SMB Sentiment Pulse',
  launch_tracker: 'Launch Tracker',
  seo_gap: 'SEO Content Gap',
  sector_assessment: 'Sector Assessment',
  content_routing: 'Content Routing → Maya',
  pricing_strategy: 'Pricing Strategy',
  ico_target: 'ICO + Target Market',
  positioning: 'Positioning',
}

export const REPORT_TYPES = Object.keys(REPORT_TYPE_LABELS) as Array<
  keyof typeof REPORT_TYPE_LABELS
>

function reportTypeLabelImpl(t: string): string {
  return REPORT_TYPE_LABELS[t] ?? t
}

export const list = query({
  args: {
    reportType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    const base = args.reportType
      ? await ctx.db
          .query('intelligence_reports')
          .withIndex('by_reportType', (q) =>
            q.eq('reportType', args.reportType as Parameters<typeof q.eq>[1])
          )
          .order('desc')
          .take(limit)
      : await ctx.db
          .query('intelligence_reports')
          .withIndex('by_createdAt')
          .order('desc')
          .take(limit)
    return base
  },
})

export const get = query({
  args: { id: v.id('intelligence_reports') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('intelligence_reports').collect()
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const byReportType: Record<string, number> = {}
    let thisWeek = 0
    for (const r of all) {
      byReportType[r.reportType] = (byReportType[r.reportType] ?? 0) + 1
      if (r.createdAt >= oneWeekAgo) thisWeek += 1
    }
    return {
      total: all.length,
      thisWeek,
      byReportType,
    }
  },
})

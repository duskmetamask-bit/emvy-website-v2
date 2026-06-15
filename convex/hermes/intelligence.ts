// Hermes function surface for the Intelligence agent.
//
// Called by the VPS `intelligence` agent's daily/weekly research crons
// after they write their markdown report to ~/obsidian-vault/intelligence/.
// The board's /intelligence tab reads this table to surface the
// competitive intel pipeline in the operator CRM.
//
// Auth: requireHermesAgent(token, agent) where agent MUST be 'intelligence'.
// Cross-agent calls (any other agent) throw. agentId is also set
// server-side to 'intelligence' (immutable, set on insert) so the source
// of every row is clear at query time.
//
// Mirrors the structure of convex/hermes/marketing.ts (Maya's appendEntry).
// activity_log is NOT written here — these are research outputs, not
// lead-scoped events. The intelligence_reports row (with agentId +
// createdAt + sourcePath) is the audit trail.

import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

export const appendEntry = mutation({
  args: {
    token: v.string(),
    agent: v.literal('intelligence'),
    date: v.string(), // YYYY-MM-DD
    reportType: v.union(
      v.literal('daily_competitive_intel'),
      v.literal('competitor_pricing'),
      v.literal('competitor_deep_dive'),
      v.literal('compliance_tracker'),
      v.literal('sentiment_pulse'),
      v.literal('launch_tracker'),
      v.literal('seo_gap'),
      v.literal('sector_assessment'),
      v.literal('content_routing'),
      v.literal('pricing_strategy'),
      v.literal('ico_target'),
      v.literal('positioning'),
    ),
    title: v.string(),
    summary: v.string(),
    body: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sourcePath: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const { token: _token, agent: _agent, ...data } = args
    const now = Date.now()
    const id = await ctx.db.insert('intelligence_reports', {
      date: data.date,
      reportType: data.reportType,
      title: data.title,
      summary: data.summary,
      body: data.body,
      tags: data.tags,
      sourcePath: data.sourcePath,
      agentId: 'intelligence',
      createdAt: now,
    })
    return { id, createdAt: now }
  },
})

// Hermes function surface for the Sage audit agent.
//
// Called by the VPS `audit` agent's `AI Business Audit — Daily Crawler`
// cron (15:15 AWST) after it appends a row to
// ~/obsidian-vault/audit/AUDIT-REGISTER.md. The board's /audits tab reads
// this table to surface the audit pipeline + suggested build ideas in
// the operator CRM.
//
// Auth: requireHermesAgent(token, agent) where agent MUST be 'sage'.
// Cross-agent calls (any other agent) throw. agentId is also set
// server-side to 'sage' (immutable, set on insert) so the source of every
// row is clear at query time.
//
// Semantics: appendEntry dedupes on businessName. Re-runs of the
// same audit don't create duplicate rows — the cron backs off and
// returns {action: 'deduped'}. The operator can manually patch an
// existing row via the Convex dashboard if a re-audit is needed.
//
// activity_log is NOT written here — audits are not lead-scoped.
// The audit_register row (with agentId + createdAt + sourcePath) is
// the audit trail.

import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

export const appendEntry = mutation({
  args: {
    token: v.string(),
    agent: v.literal('sage'),
    date: v.string(), // YYYY-MM-DD
    businessName: v.string(), // 1-200 chars
    auditConducted: v.string(), // markdown body
    findingsRecommendations: v.string(), // markdown body
    buildIdeas: v.string(), // markdown body
    sourcePath: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const { token: _token, agent: _agent, ...data } = args
    const now = Date.now()

    // Dedupe by businessName. The lookup is case-sensitive in v1
    // (Convex v.literal equality is case-sensitive). The cron should
    // normalise businessName before posting (strip + lowercase
    // comparison happens in the python sync wrapper, not here).
    const existing = await ctx.db
      .query('audit_register')
      .withIndex('by_businessName', (q) =>
        q.eq('businessName', data.businessName)
      )
      .first()
    if (existing) {
      return {
        id: existing._id,
        action: 'deduped' as const,
        createdAt: existing.createdAt,
      }
    }

    const id = await ctx.db.insert('audit_register', {
      date: data.date,
      businessName: data.businessName,
      auditConducted: data.auditConducted,
      findingsRecommendations: data.findingsRecommendations,
      buildIdeas: data.buildIdeas,
      sourcePath: data.sourcePath,
      agentId: 'sage',
      createdAt: now,
    })
    return { id, action: 'inserted' as const, createdAt: now }
  },
})

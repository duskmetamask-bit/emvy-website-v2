// Cron entry points + the public cron_runs append mutation.
//
// Auth model (per-agent tokens, deployed 2026-06-15 PM):
// - `appendRun` is called by the VPS `log_cron_health.py` script which
//   runs from a generic context (it can be invoked by mewy or any
//   other agent to push cron health). It accepts agent='mewy' ONLY —
//   mewy is the orchestrator that aggregates cron health across all
//   agent profiles. The mutation validates that args.agent === 'mewy'
//   and that mewy has a configured token. Even if a bound agent tried
//   to call it with agent='mewy', the token check would fail (they
//   don't have mewey's token).
// - `runDailyCron` and `runFollowupsCron` remain internal actions;
//   they read the env directly (no per-agent token needed because
//   they're server-side only and Convex blocks external calls).

import { internalAction, mutation } from '../_generated/server'
import { api } from '../_generated/api'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

function getToken(): string {
  const t = process.env.HERMES_ACTIONS_TOKEN
  if (!t) {
    throw new Error('HERMES_ACTIONS_TOKEN not configured on server')
  }
  return t
}

export const runDailyCron = internalAction({
  args: {},
  handler: async (ctx): Promise<{ planned: number; sent: number; failed: number; suppressed: number; errors: string[] }> => {
    return await ctx.runAction(api.hermes.runner.runDaily, {
      token: getToken(),
    })
  },
})

export const runFollowupsCron = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number; failed: number; errors: string[] }> => {
    return await ctx.runAction(api.hermes.runner.runFollowups, {
      token: getToken(),
    })
  },
})

// Public mutation called by the VPS `~/.hermes/bin/log_cron_health.py`.
// Upserts one row in `cron_runs` per (agentId, cronName) pair. The
// board's /intelligence cron roster reads this table live.
//
// Auth: requireHermesAgent(token, 'mewy') — only mewy writes here. The
// mewy token is set in HERMES_TOKEN_MEWY. The cron_health script reads
// it from ~/.hermes/.env. Bound agents do NOT have the mewy token, so
// even if a sync wrapper mis-routes a call, the auth check rejects.
export const appendRun = mutation({
  args: {
    token: v.string(),
    agent: v.literal('mewy'),
    agentId: v.string(),      // the *target* agent whose cron ran (intelligence, audit, etc.)
    cronName: v.string(),
    schedule: v.string(),
    state: v.union(
      v.literal('scheduled'),
      v.literal('paused'),
      v.literal('unscheduled'),
      v.literal('error'),
    ),
    lastStatus: v.optional(v.string()),
    lastRunAt: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const now = Date.now()
    const existing = await ctx.db
      .query('cron_runs')
      .withIndex('by_agent_cronName', (q) =>
        q.eq('agentId', args.agentId).eq('cronName', args.cronName)
      )
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, {
        schedule: args.schedule,
        state: args.state,
        lastStatus: args.lastStatus,
        lastRunAt: args.lastRunAt,
        note: args.note,
        updatedAt: now,
      })
      return { id: existing._id, action: 'updated' as const }
    }
    const id = await ctx.db.insert('cron_runs', {
      agentId: args.agentId,
      cronName: args.cronName,
      schedule: args.schedule,
      state: args.state,
      lastStatus: args.lastStatus,
      lastRunAt: args.lastRunAt,
      note: args.note,
      createdAt: now,
      updatedAt: now,
    })
    return { id, action: 'created' as const }
  },
})

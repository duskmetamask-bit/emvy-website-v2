// Cron entry points. These are internal actions that read the Hermes
// token from the server env and call the public runner actions.
//
// Convex crons can only call internal functions, so this thin wrapper
// is the bridge between the schedule and the token-gated public surface.
//
// Also exposes the public `appendRun` mutation that the VPS
// `~/.hermes/bin/log_cron_health.py` calls to upsert one row per cron
// job into `cron_runs` (live state for the board's /intelligence roster).
// Added 2026-06-15.

import { internalAction, mutation } from '../_generated/server'
import { api } from '../_generated/api'
import { v } from 'convex/values'
import { requireHermes } from '../hermesAuth'

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
// Token-gated: the VPS client passes HERMES_ACTIONS_TOKEN in the
// Authorization header. 409-style conflict (same agentId+cronName, newer
// updatedAt) is handled by overwriting in place — `log_cron_health.py`
// is the single writer.
export const appendRun = mutation({
  args: {
    token: v.string(),
    agentId: v.string(),
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
    requireHermes(args.token)
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

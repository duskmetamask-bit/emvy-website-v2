// Public cron_runs append mutation — the only remaining entry here after
// Slice 2a (2026-07-03) deleted `convex/hermes/runner.ts` (the legacy v1
// runner). The `runDailyCron` / `runFollowupsCron` wrappers around
// `api.hermes.runner.*` are gone — cron registration in `convex/crons.ts`
// has been off them since 2026-06-26 and the auto-drain is now paused
// (see `convex/hermes/outreach2.ts:operatorSend` for the operator-driven
// surface that replaced it).
//
// Auth model (per-agent tokens, deployed 2026-06-15 PM):
// - `appendRun` is called by the VPS `log_cron_health.py` script which
//   runs from a generic context (it can be invoked by mewy or any
//   other agent to push cron health). It accepts agent='mewy' ONLY —
//   mewy is the orchestrator that aggregates cron health across all
//   agent profiles. The mutation validates that args.agent === 'mewy'
//   and that mewy has a configured token. Even if a bound agent tried
//   to call it with agent='mewy', the token check would fail (they
//   don't have mewy's token).

import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

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

// Append-only log entry for cron run history. Written by the VPS
// `~/.hermes/bin/log_cron_health.py` after each cron invocation. The
// board's /cron-history page reads this for stats + per-cron timelines.
//
// Auth: same as appendRun — requireHermesAgent(token, 'mewy'). The VPS
// script uses MEWY's token because mewy is the orchestrator that
// aggregates cron health across all agent profiles.
export const appendHistory = mutation({
  args: {
    token: v.string(),
    agent: v.literal('mewy'),
    agentId: v.string(),
    cronName: v.string(),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    status: v.union(v.literal('ok'), v.literal('fail'), v.literal('running')),
    error: v.optional(v.string()),
    source: v.optional(v.string()),
    runId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    return await ctx.db.insert('cron_run_history', {
      agentId: args.agentId,
      cronName: args.cronName,
      startedAt: args.startedAt,
      finishedAt: args.finishedAt,
      durationMs: args.durationMs,
      status: args.status,
      error: args.error,
      source: args.source,
      runId: args.runId,
    })
  },
})

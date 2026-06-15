// Hermes function surface for the Cartz/Builds agent.
//
// Called by the VPS `builds` agent's `Build Register — Daily Review`
// cron (05:00 AWST) after it walks ~/obsidian-vault/builds/BUILD-REGISTER.md
// and POSTs the current state of every project. The board's /builds tab
// reads this table to surface the production-code build pipeline in the
// operator CRM.
//
// Auth: requireHermesAgent(token, agent) where agent MUST be 'builds'.
// Cross-agent calls (any other agent) throw. agentId is also set
// server-side to 'builds' (immutable, set on insert) so the source of
// every row is clear at query time.
//
// Semantics: appendEntry is an UPSERT. New projects are inserted;
// existing projects have their stage + date + sourcePath updated.
// The mutation returns {action: 'inserted' | 'updated'} so the cron
// can log which happened. The cron is idempotent — re-running it on
// the same BUILD-REGISTER.md produces the same end state.
//
// Note on the upsert lookup: there is no `by_project` index in v1.
// We use `by_stage` (narrow pre-filter — usually <10 rows) and filter
// in-memory on `project`. Acceptable while the register is small;
// if it grows past ~100 rows per stage, add a `by_project` index
// in a follow-up and switch the lookup.
//
// 6 stages: build_idea → design_visuals → planning → reviewed →
//   awaiting_dusk_approval → product_ready_to_sell.
// The "awaiting_dusk_approval" gate is explicit; the cron will not
// auto-advance past "reviewed" — the operator edits the vault file
// to flip the stage, and the next daily review POSTs the new state.
//
// activity_log is NOT written here — builds are not lead-scoped.

import { mutation } from '../_generated/server'
import { v } from 'convex/values'
import { requireHermesAgent } from '../hermesAuth'

export const appendEntry = mutation({
  args: {
    token: v.string(),
    agent: v.literal('builds'),
    date: v.string(), // YYYY-MM-DD (date the row was last touched)
    project: v.string(), // 1-200 chars
    stage: v.union(
      v.literal('build_idea'),
      v.literal('design_visuals'),
      v.literal('planning'),
      v.literal('reviewed'),
      v.literal('awaiting_dusk_approval'),
      v.literal('product_ready_to_sell')
    ),
    sourcePath: v.string(),
  },
  handler: async (ctx, args) => {
    requireHermesAgent(args.token, args.agent)
    const { token: _token, agent: _agent, ...data } = args
    const now = Date.now()

    // Upsert by project name. The by_stage index narrows the search
    // (rarely >10 rows per stage in v1); we then filter on project
    // equality in-memory. See header note about adding a by_project
    // index if the register grows.
    const candidates = await ctx.db
      .query('build_register')
      .withIndex('by_stage', (q) => q.eq('stage', data.stage))
      .collect()
    const match = candidates.find((row) => row.project === data.project)
    if (match) {
      await ctx.db.patch(match._id, {
        stage: data.stage,
        date: data.date,
        sourcePath: data.sourcePath,
      })
      return {
        id: match._id,
        action: 'updated' as const,
        createdAt: match.createdAt,
      }
    }

    const id = await ctx.db.insert('build_register', {
      date: data.date,
      project: data.project,
      stage: data.stage,
      sourcePath: data.sourcePath,
      agentId: 'builds',
      createdAt: now,
    })
    return { id, action: 'inserted' as const, createdAt: now }
  },
})

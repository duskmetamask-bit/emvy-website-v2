// Slice 5 — send observability tests
//
// Per-send observability surface (recordSendRun + getRecentSendRuns +
// getSendRunStats). Tests cover all four outcomes + the stats rollup.

import { convexTest } from 'convex-test'
import { describe, expect, it, beforeAll } from 'vitest'
import schema from '../../convex/schema'
import { api, internal } from '../../convex/_generated/api'

const BLANDO_TOKEN = 'test-blando-token'
const BLANDO_AGENT = 'blando'

beforeAll(() => {
  process.env.HERMES_TOKEN_BLANDO = BLANDO_TOKEN
})

const modules = import.meta.glob('../../convex/**/*.*s')

async function seedLead(t: ReturnType<typeof convexTest>, email: string) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('leads', {
      company: 'Acme',
      contact: 'Test',
      email,
      stage: 'queued',
    })
  })
}

async function seedQueueRow(
  t: ReturnType<typeof convexTest>,
  args: { leadId?: any; email: string; touch: 1 | 2 | 3 }
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('outreach_queue', {
      leadId: args.leadId,
      company: 'Acme',
      contact: 'Test',
      email: args.email,
      status: 'queued',
      scheduledFor: Date.now() - 1000,
      touch: args.touch,
      subject: 'subj',
      body: 'body',
      createdAt: Date.now(),
    })
  })
}

describe('recordSendRun() — Slice 5 observability', () => {
  it('writes a row for each outcome', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'a@example.com')
    const row = await seedQueueRow(t, { leadId, email: 'a@example.com', touch: 1 })

    for (const outcome of ['sent', 'blocked', 'failed', 'noop'] as const) {
      await t.mutation(internal.hermes.outreach2.recordSendRun, {
        queueId: row,
        leadId,
        actor: 'operator',
        outcome,
        reason: outcome === 'blocked' ? 'blocked:e2_too_soon' : undefined,
        step: 'e1',
      })
    }

    const recent = await t.query(api.board.outreach.getRecentSendRuns, { limit: 10 })
    expect(recent).toHaveLength(4)
    const outcomes = recent.map((r) => r.outcome).sort()
    expect(outcomes).toEqual(['blocked', 'failed', 'noop', 'sent'])
  })

  it('getRecentSendRuns returns rows in descending timestamp order', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'b@example.com')
    const row = await seedQueueRow(t, { leadId, email: 'b@example.com', touch: 1 })

    // Insert 3 rows with delays so timestamps differ
    await t.mutation(internal.hermes.outreach2.recordSendRun, {
      queueId: row, leadId, actor: 'op', outcome: 'sent', step: 'e1',
    })
    await new Promise((r) => setTimeout(r, 5))
    await t.mutation(internal.hermes.outreach2.recordSendRun, {
      queueId: row, leadId, actor: 'op', outcome: 'sent', step: 'e2',
    })
    await new Promise((r) => setTimeout(r, 5))
    await t.mutation(internal.hermes.outreach2.recordSendRun, {
      queueId: row, leadId, actor: 'op', outcome: 'sent', step: 'e3',
    })

    const recent = await t.query(api.board.outreach.getRecentSendRuns, { limit: 10 })
    expect(recent).toHaveLength(3)
    // Newest first
    expect(recent[0].step).toBe('e3')
    expect(recent[1].step).toBe('e2')
    expect(recent[2].step).toBe('e1')
  })

  it('getSendRunStats counts each outcome in the window', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'c@example.com')
    const row = await seedQueueRow(t, { leadId, email: 'c@example.com', touch: 1 })

    // 3 sent, 2 blocked, 1 failed
    for (let i = 0; i < 3; i++) {
      await t.mutation(internal.hermes.outreach2.recordSendRun, {
        queueId: row, leadId, actor: 'op', outcome: 'sent', step: 'e1',
      })
    }
    for (let i = 0; i < 2; i++) {
      await t.mutation(internal.hermes.outreach2.recordSendRun, {
        queueId: row, leadId, actor: 'op', outcome: 'blocked', reason: 'blocked:e2_too_soon', step: 'e2',
      })
    }
    await t.mutation(internal.hermes.outreach2.recordSendRun, {
      queueId: row, leadId, actor: 'op', outcome: 'failed', step: 'e1',
    })

    const stats = await t.query(api.board.outreach.getSendRunStats, {})
    expect(stats.sent).toBe(3)
    expect(stats.blocked).toBe(2)
    expect(stats.failed).toBe(1)
    expect(stats.noop).toBe(0)
    expect(stats.windowMs).toBe(24 * 60 * 60 * 1000)
  })

  it('getSendRunStats respects sinceMs window', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'd@example.com')
    const row = await seedQueueRow(t, { leadId, email: 'd@example.com', touch: 1 })

    // Insert a "recent" row and a "very old" row via direct db
    await t.mutation(internal.hermes.outreach2.recordSendRun, {
      queueId: row, leadId, actor: 'op', outcome: 'sent', step: 'e1',
    })
    // 1 hour window — should still see the just-inserted row
    const stats1h = await t.query(api.board.outreach.getSendRunStats, { sinceMs: 60 * 60 * 1000 })
    expect(stats1h.sent).toBe(1)
  })
})

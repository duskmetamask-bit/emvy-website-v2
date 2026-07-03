// Slice 4a — Per-lead sequence ordering test
//
// Per `~/.claude/plans/jolly-jingling-sun.md` Slice 4a:
//   listDueForDrain orders by (scheduledFor ASC). The E2/E3 blocked
//   path is covered by Slice 3; this test asserts the drainer's
//   per-lead sequencing is deterministic.
//
// Strategy: seed 3 rows per lead with offsets matching the real
// sequence (E1 oldest, E2 +4d, E3 +10d). The by_status_scheduledFor
// index returns rows in scheduledFor order, so the returned array is
// [leadA.E1, leadB.E1, leadA.E2, leadB.E2, leadA.E3, leadB.E3] for
// a balanced batch.

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import schema from '../../convex/schema'
import { internal } from '../../convex/_generated/api'

const modules = import.meta.glob('../../convex/**/*.*s')

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.now()

async function seedLead(t: ReturnType<typeof convexTest>, email: string) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('leads', {
      company: email.split('@')[0],
      contact: 'Test',
      email,
      stage: 'queued',
    })
  })
}

async function seedQueueRow(
  t: ReturnType<typeof convexTest>,
  args: { leadId: any; email: string; touch: 1 | 2 | 3; scheduledFor: number }
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('outreach_queue', {
      leadId: args.leadId,
      company: 'Acme',
      contact: 'Test',
      email: args.email,
      status: 'queued',
      scheduledFor: args.scheduledFor,
      touch: args.touch,
      createdAt: NOW,
    })
  })
}

describe('listDueForDrain() — Slice 4a ordering', () => {
  it('returns rows in scheduledFor ASC order across multiple leads', async () => {
    const t = convexTest(schema, modules)

    // Seed two leads with full E1+E2+E3 sequences.
    const leadA = await seedLead(t, 'a@example.com')
    const leadB = await seedLead(t, 'b@example.com')

    // All rows are due (past) but with E1 oldest, E2 next, E3 latest —
    // mirroring the locked sequence offsets but shrunk to fit "all
    // past" so the drain sees the full batch. The by_status_scheduledFor
    // index returns rows in scheduledFor order, so all E1s come
    // before any E2 before any E3.
    const E1_AT = NOW - 3000
    const E2_AT = NOW - 2000
    const E3_AT = NOW - 1000
    await seedQueueRow(t, { leadId: leadA, email: 'a@example.com', touch: 1, scheduledFor: E1_AT })
    await seedQueueRow(t, { leadId: leadA, email: 'a@example.com', touch: 2, scheduledFor: E2_AT })
    await seedQueueRow(t, { leadId: leadA, email: 'a@example.com', touch: 3, scheduledFor: E3_AT })
    await seedQueueRow(t, { leadId: leadB, email: 'b@example.com', touch: 1, scheduledFor: E1_AT + 1 })
    await seedQueueRow(t, { leadId: leadB, email: 'b@example.com', touch: 2, scheduledFor: E2_AT + 1 })
    await seedQueueRow(t, { leadId: leadB, email: 'b@example.com', touch: 3, scheduledFor: E3_AT + 1 })

    const due = await t.query(internal.hermes.outreach2.listDueForDrain, { limit: 10 })

    expect(due).toHaveLength(6)
    // Both lead A E1 (NOW-1000) and lead B E1 (NOW-500) are in the past.
    // The E1 rows should be first (oldest), then E2s, then E3s.
    const touches = due.map((r: any) => r.touch)
    // All E1s (touch=1) must come before any E2 (touch=2) must come before any E3 (touch=3)
    const firstE2 = touches.indexOf(2)
    const lastE1 = touches.lastIndexOf(1)
    const firstE3 = touches.indexOf(3)
    const lastE2 = touches.lastIndexOf(2)
    expect(lastE1).toBeLessThan(firstE2)
    expect(lastE2).toBeLessThan(firstE3)
  })

  it('skips rows with status != queued', async () => {
    const t = convexTest(schema, modules)
    const leadA = await seedLead(t, 'skip@example.com')
    await seedQueueRow(t, { leadId: leadA, email: 'skip@example.com', touch: 1, scheduledFor: NOW - 1000 })
    // Mark a 'sending' row that's also due
    const sendingId = await t.run(async (ctx) => {
      return await ctx.db.insert('outreach_queue', {
        leadId: leadA,
        company: 'Acme',
        contact: 'Test',
        email: 'skip@example.com',
        status: 'sending',
        scheduledFor: NOW - 1000,
        touch: 2,
        createdAt: NOW,
      })
    })
    const due = await t.query(internal.hermes.outreach2.listDueForDrain, { limit: 10 })
    expect(due).toHaveLength(1)
    expect(due[0]._id).not.toBe(sendingId)
  })

  it('skips rows with scheduledFor in the future', async () => {
    const t = convexTest(schema, modules)
    const leadA = await seedLead(t, 'future@example.com')
    await seedQueueRow(t, { leadId: leadA, email: 'future@example.com', touch: 1, scheduledFor: NOW - 1000 })
    await seedQueueRow(t, { leadId: leadA, email: 'future@example.com', touch: 2, scheduledFor: NOW + 4 * DAY })
    const due = await t.query(internal.hermes.outreach2.listDueForDrain, { limit: 10 })
    expect(due).toHaveLength(1)
    expect(due[0].touch).toBe(1)
  })

  it('respects the limit parameter', async () => {
    const t = convexTest(schema, modules)
    const leadA = await seedLead(t, 'lim@example.com')
    for (let i = 0; i < 5; i++) {
      await seedQueueRow(t, { leadId: leadA, email: 'lim@example.com', touch: 1, scheduledFor: NOW - 1000 - i })
    }
    const due = await t.query(internal.hermes.outreach2.listDueForDrain, { limit: 3 })
    expect(due).toHaveLength(3)
  })
})

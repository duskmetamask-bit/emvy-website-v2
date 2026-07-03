// Slice 5a — recover-stuck-sending sweeper test
//
// Tests that the sweeper (commit 51a80d5) flips rows stuck in
// status='sending' for >5 min back to 'queued' + writes an
// activity_log entry for the board timeline.

import { convexTest } from 'convex-test'
import { describe, expect, it, beforeAll } from 'vitest'
import schema from '../../convex/schema'
import { internal } from '../../convex/_generated/api'

const BLANDO_TOKEN = 'test-blando-token'
const BLANDO_AGENT = 'blando'

beforeAll(() => {
  process.env.HERMES_TOKEN_BLANDO = BLANDO_TOKEN
})

const modules = import.meta.glob('../../convex/**/*.*s')

const MINUTE = 60 * 1000
const NOW = Date.now()

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

async function seedSendingRow(
  t: ReturnType<typeof convexTest>,
  args: { leadId?: any; email: string; lastAttemptAt: number }
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('outreach_queue', {
      leadId: args.leadId,
      company: 'Acme',
      contact: 'Test',
      email: args.email,
      status: 'sending',
      scheduledFor: NOW - 600_000,
      lastAttemptAt: args.lastAttemptAt,
      touch: 1,
      subject: 'subj',
      body: 'body',
      createdAt: NOW - 600_000,
    })
  })
}

describe('recoverStuckSendingRows() — Slice 5a sweeper', () => {
  it('1. flips status=sending with lastAttemptAt>5min ago back to queued', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'a@example.com')
    const id = await seedSendingRow(t, {
      leadId,
      email: 'a@example.com',
      lastAttemptAt: NOW - 10 * MINUTE, // 10 min ago — well past threshold
    })

    const result = await t.mutation(internal.hermes.outreach2.recoverStuckSendingRows, {})

    expect(result.recovered).toBe(1)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].id).toBe(id)
    expect(result.rows[0].ageMs).toBeGreaterThan(5 * MINUTE)

    // Row should now be 'queued'
    const row = await t.run(async (ctx) => ctx.db.get(id as any) as any)
    expect(row?.status).toBe('queued')
  })

  it('2. leaves fresh sending rows alone', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'b@example.com')
    const id = await seedSendingRow(t, {
      leadId,
      email: 'b@example.com',
      lastAttemptAt: NOW - 1 * MINUTE, // 1 min ago — under threshold
    })

    const result = await t.mutation(internal.hermes.outreach2.recoverStuckSendingRows, {})

    expect(result.recovered).toBe(0)
    const row = await t.run(async (ctx) => ctx.db.get(id as any) as any)
    expect(row?.status).toBe('sending')
  })

  it('3. writes activity_log entry per recovered row', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'c@example.com')
    await seedSendingRow(t, {
      leadId,
      email: 'c@example.com',
      lastAttemptAt: NOW - 10 * MINUTE,
    })

    await t.mutation(internal.hermes.outreach2.recoverStuckSendingRows, {
      actor: 'test-sweeper',
    })

    const activity = await t.run(async (ctx) =>
      ctx.db
        .query('activity_log')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId as any))
        .collect()
    )
    const recovered = activity.filter((a) => a.action === 'stuck_sending_recovered')
    expect(recovered).toHaveLength(1)
    expect(recovered[0].actor).toBe('test-sweeper')
    expect(recovered[0].details).toMatch(/queueId=.*touch=1.*ageMs=/)
  })

  it('4. listStuckSendingRows is a noop when none are stuck', async () => {
    const t = convexTest(schema, modules)
    const stuck = await t.query(internal.hermes.outreach2.listStuckSendingRows, {})
    expect(stuck).toEqual([])
  })

  it('5. respects the thresholdMs override', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'd@example.com')
    const id = await seedSendingRow(t, {
      leadId,
      email: 'd@example.com',
      lastAttemptAt: NOW - 2 * MINUTE, // 2 min — under default 5min threshold
    })

    // Override threshold to 1 min — should recover
    const result = await t.mutation(internal.hermes.outreach2.recoverStuckSendingRows, {
      thresholdMs: 60_000,
    })
    expect(result.recovered).toBe(1)

    const row = await t.run(async (ctx) => ctx.db.get(id as any) as any)
    expect(row?.status).toBe('queued')
  })

  it('6. idempotent — re-running is a noop when no rows are stuck', async () => {
    const t = convexTest(schema, modules)
    const r1 = await t.mutation(internal.hermes.outreach2.recoverStuckSendingRows, {})
    const r2 = await t.mutation(internal.hermes.outreach2.recoverStuckSendingRows, {})
    expect(r1.recovered).toBe(0)
    expect(r2.recovered).toBe(0)
  })
})

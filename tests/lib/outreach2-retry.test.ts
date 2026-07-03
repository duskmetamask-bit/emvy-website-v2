// Slice 5b — exponential backoff retry policy test
//
// Tests that markStepFailed (already in 5b-prep ee914dc) implements
// the locked retry policy:
//   - attempts < 3 → status='queued', scheduledFor=now+5min*2^(attempts-1)
//     (5 min after 1st fail, 10 min after 2nd, 20 min after 3rd)
//   - attempts >= 3 → status='failed' for operator triage
// Each retry writes activity_log action=send_retried_with_backoff or
// send_permanently_failed.

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

async function seedQueueRow(
  t: ReturnType<typeof convexTest>,
  args: { leadId?: any; email: string; touch?: 1 | 2 | 3; attempts?: number }
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('outreach_queue', {
      leadId: args.leadId,
      company: 'Acme',
      contact: 'Test',
      email: args.email,
      status: 'sending',
      scheduledFor: NOW - 1000,
      lastAttemptAt: NOW - 1000,
      touch: args.touch ?? 1,
      attempts: args.attempts ?? 0,
      subject: 'subj',
      body: 'body',
      createdAt: NOW - 1000,
    })
  })
}

describe('markStepFailed() — Slice 5b exponential backoff', () => {
  it('1. attempts=0 → queued, scheduledFor=now+5min (first retry)', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'a@example.com')
    const id = await seedQueueRow(t, { leadId, email: 'a@example.com', attempts: 0 })

    const before = Date.now()
    const result = await t.mutation(api.hermes.outreach2.markStepFailed, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: id,
      error: 'Resend 500: oops',
    })
    const after = Date.now()

    expect(result.ok).toBe(true)
    expect(result.retried).toBe(true)
    expect(result.attempts).toBe(1)
    expect(result.nextAttemptAt).toBeGreaterThanOrEqual(before + 5 * MINUTE)
    expect(result.nextAttemptAt).toBeLessThanOrEqual(after + 5 * MINUTE)

    const row = await t.run(async (ctx) => ctx.db.get(id as any) as any)
    expect(row?.status).toBe('queued')
    expect(row?.attempts).toBe(1)
    expect(row?.lastError).toBe('Resend 500: oops')
  })

  it('2. attempts=1 → queued, scheduledFor=now+10min (second retry, 2^1 * 5)', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'b@example.com')
    const id = await seedQueueRow(t, { leadId, email: 'b@example.com', attempts: 1 })

    const before = Date.now()
    const result = await t.mutation(api.hermes.outreach2.markStepFailed, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: id,
      error: 'Resend 500: still failing',
    })
    const after = Date.now()

    expect(result.retried).toBe(true)
    expect(result.attempts).toBe(2)
    // 2^1 = 2, * 5min = 10 min backoff
    expect(result.nextAttemptAt).toBeGreaterThanOrEqual(before + 10 * MINUTE)
    expect(result.nextAttemptAt).toBeLessThanOrEqual(after + 10 * MINUTE)
  })

  it('3. attempts=3 → status=failed (over MAX_RETRY_ATTEMPTS)', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'c@example.com')
    const id = await seedQueueRow(t, { leadId, email: 'c@example.com', attempts: 3 })

    const result = await t.mutation(api.hermes.outreach2.markStepFailed, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: id,
      error: 'Resend 500: giving up',
    })

    expect(result.ok).toBe(true)
    expect(result.retried).toBe(false)
    expect(result.dead).toBe(true)
    expect(result.attempts).toBe(4)

    const row = await t.run(async (ctx) => ctx.db.get(id as any) as any)
    expect(row?.status).toBe('failed')
    expect(row?.attempts).toBe(4)
  })

  it('4. writes activity_log send_retried_with_backoff on retry', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'd@example.com')
    const id = await seedQueueRow(t, { leadId, email: 'd@example.com', attempts: 0 })

    await t.mutation(api.hermes.outreach2.markStepFailed, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: id,
      error: 'Resend 500: retryable',
    })

    const activity = await t.run(async (ctx) =>
      ctx.db.query('activity_log')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId as any))
        .collect()
    )
    const retried = activity.filter((a) => a.action === 'send_retried_with_backoff')
    expect(retried).toHaveLength(1)
    expect(retried[0].actor).toBe('drainer')
    expect(retried[0].details).toMatch(/queueId=.*attempts=1.*backoffMs=300000/)
  })

  it('5. writes activity_log send_permanently_failed on dead', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, 'e@example.com')
    const id = await seedQueueRow(t, { leadId, email: 'e@example.com', attempts: 3 })

    await t.mutation(api.hermes.outreach2.markStepFailed, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: id,
      error: 'Resend 500: dead',
    })

    const activity = await t.run(async (ctx) =>
      ctx.db.query('activity_log')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId as any))
        .collect()
    )
    const dead = activity.filter((a) => a.action === 'send_permanently_failed')
    expect(dead).toHaveLength(1)
    expect(dead[0].actor).toBe('drainer')
    expect(dead[0].details).toMatch(/attempts=4/)
  })
})

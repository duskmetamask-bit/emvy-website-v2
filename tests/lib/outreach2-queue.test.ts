// Slice 4 — queueStep + queueSequence unit tests
//
// Locks the queue-time invariants:
//   - (leadId, step) idempotency: re-queue returns { created:false }
//   - Refusals: unsubscribed + do_not_contact + empty payload
//   - queueSequence atomicity: E1, E2 (E1+4d), E3 (E2+6d)
//
// Per `~/.claude/plans/jolly-jingling-sun.md` Slice 4.

import { convexTest } from 'convex-test'
import { describe, expect, it, beforeAll } from 'vitest'
import schema from '../../convex/schema'
import { api } from '../../convex/_generated/api'

const BLANDO_TOKEN = 'test-blando-token'
const BLANDO_AGENT = 'blando'

beforeAll(() => {
  process.env.HERMES_TOKEN_BLANDO = BLANDO_TOKEN
})

const modules = import.meta.glob('../../convex/**/*.*s')

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.now()

const E1_ARGS = {
  token: BLANDO_TOKEN,
  agent: BLANDO_AGENT as const,
  email: 'test@example.com',
  businessName: 'Acme',
  step: 'e1' as const,
  scheduledFor: NOW,
  subject: 'E1 subject',
  body: 'E1 body',
}

async function queueE1(t: ReturnType<typeof convexTest>, email: string) {
  return await t.mutation(api.hermes.outreach2.queueStep, {
    ...E1_ARGS,
    email,
  })
}

describe('queueStep() — Slice 4 queue-time invariants', () => {
  it('1. first call returns { created:true, status:"queued" }', async () => {
    const t = convexTest(schema, modules)
    const result = await queueE1(t, 'first@example.com')
    expect(result.created).toBe(true)
    expect(result.status).toBe('queued')
    expect(result.queueId).toBeTruthy()
    expect(result.leadId).toBeTruthy()
  })

  it('2. re-queue same (email, step) returns { created:false } with prior queueId', async () => {
    const t = convexTest(schema, modules)
    const first = await queueE1(t, 'dup@example.com')
    const second = await t.mutation(api.hermes.outreach2.queueStep, {
      ...E1_ARGS,
      email: 'dup@example.com',
    })
    expect(second.created).toBe(false)
    expect(second.queueId).toBe(first.queueId)
    expect(second.status).toBe('queued')
  })

  it('3. unsubscribed lead throws', async () => {
    const t = convexTest(schema, modules)
    // First queue a lead
    await queueE1(t, 'unsub@example.com')
    // Mark as unsubscribed
    await t.run(async (ctx) => {
      const lead = await ctx.db
        .query('leads')
        .withIndex('by_email', (q) => q.eq('email', 'unsub@example.com'))
        .first()
      if (lead) {
        await ctx.db.patch(lead._id, {
          unsubscribedAt: NOW,
          outreachState: 'unsubscribed',
        })
      }
    })
    // Try to queue E2 for the same lead — should throw
    await expect(
      t.mutation(api.hermes.outreach2.queueStep, {
        ...E1_ARGS,
        email: 'unsub@example.com',
        step: 'e2',
        subject: 'E2 subject',
        body: 'E2 body',
      })
    ).rejects.toThrow(/unsubscribed|do_not_contact/)
  })

  it('4. do_not_contact lead throws', async () => {
    const t = convexTest(schema, modules)
    await queueE1(t, 'dnc@example.com')
    await t.run(async (ctx) => {
      const lead = await ctx.db
        .query('leads')
        .withIndex('by_email', (q) => q.eq('email', 'dnc@example.com'))
        .first()
      if (lead) {
        await ctx.db.patch(lead._id, {
          doNotContactAt: NOW,
          outreachState: 'do_not_contact',
        })
      }
    })
    await expect(
      t.mutation(api.hermes.outreach2.queueStep, {
        ...E1_ARGS,
        email: 'dnc@example.com',
        step: 'e2',
        subject: 'E2 subject',
        body: 'E2 body',
      })
    ).rejects.toThrow(/do_not_contact|do_not/)
  })

  it('5. empty subject throws', async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.mutation(api.hermes.outreach2.queueStep, {
        ...E1_ARGS,
        email: 'nosubj@example.com',
        subject: undefined,
      })
    ).rejects.toThrow(/empty payload/)
  })

  it('6. empty body throws', async () => {
    const t = convexTest(schema, modules)
    await expect(
      t.mutation(api.hermes.outreach2.queueStep, {
        ...E1_ARGS,
        email: 'nobody@example.com',
        body: undefined,
      })
    ).rejects.toThrow(/empty payload/)
  })
})

describe('queueSequence() — Slice 4 atomic sequence', () => {
  it('7. returns 3 results with E1.now, E2=E1+4d, E3=E2+6d', async () => {
    const t = convexTest(schema, modules)
    const before = Date.now()
    const result = await t.mutation(api.hermes.outreach2.queueSequence, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      email: 'seq@example.com',
      businessName: 'Acme',
      e1Subject: 'E1',
      e1Body: 'E1 body',
      e2Subject: 'E2',
      e2Body: 'E2 body',
      e3Subject: 'E3',
      e3Body: 'E3 body',
    })
    const after = Date.now()

    expect(result.results).toHaveLength(3)
    const [e1, e2, e3] = result.results
    expect(e1.step).toBe('e1')
    expect(e2.step).toBe('e2')
    expect(e3.step).toBe('e3')
    expect(e1.created).toBe(true)
    expect(e2.created).toBe(true)
    expect(e3.created).toBe(true)

    // E1.scheduledFor ≈ now (within test wall clock)
    expect(e1.scheduledFor).toBeGreaterThanOrEqual(before)
    expect(e1.scheduledFor).toBeLessThanOrEqual(after)
    // E2 = E1 + 4d
    expect(e2.scheduledFor - e1.scheduledFor).toBe(4 * DAY)
    // E3 = E2 + 6d
    expect(e3.scheduledFor - e2.scheduledFor).toBe(6 * DAY)
  })

  it('8. queueSequence twice returns created:false for E1 (idempotency)', async () => {
    const t = convexTest(schema, modules)
    const first = await t.mutation(api.hermes.outreach2.queueSequence, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      email: 'idem@example.com',
      businessName: 'Acme',
      e1Subject: 'E1',
      e1Body: 'E1 body',
      e2Subject: 'E2',
      e2Body: 'E2 body',
      e3Subject: 'E3',
      e3Body: 'E3 body',
    })
    expect(first.results.every((r) => r.created)).toBe(true)

    const second = await t.mutation(api.hermes.outreach2.queueSequence, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      email: 'idem@example.com',
      businessName: 'Acme',
      e1Subject: 'E1',
      e1Body: 'E1 body',
      e2Subject: 'E2',
      e2Body: 'E2 body',
      e3Subject: 'E3',
      e3Body: 'E3 body',
    })
    // Second call: E1 already queued → noop, E2/E3 also already queued → noop
    expect(second.results.every((r) => r.created)).toBe(false)
  })
})

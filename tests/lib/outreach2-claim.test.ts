// Slice 3 — State machine unit tests (`claim` + `markStepSent`)
//
// Locks the LOCKED LAW (2026-06-27): E2 must wait for state=e1_sent AND ≥4d
// since E1 sentAt. E3 must wait for state=e2_sent AND ≥6d since E2 sentAt.
// Followups must NEVER fire at the same time as initial outreach.
//
// Cases per `~/.claude/plans/jolly-jingling-sun.md` Slice 3:
//   1. E1 from queued → ok
//   2. E2 with no E1 history → blocked:e2_before_e1_sent
//   3. E2 with E1 3d ago → blocked:e2_too_soon
//   4. E2 with E1 5d ago → ok
//   5. E3 analogous (no E2 → blocked:e3_before_e2_sent; E2 7d ago → ok)
//   6. forceBypassGates=true short-circuits both gates
//   7. markStepSent second call returns { ok:true, noop:true, reason:'already_sent' }

import { convexTest } from 'convex-test'
import { describe, expect, it, beforeAll } from 'vitest'
import schema from '../../convex/schema'
import { internal, api } from '../../convex/_generated/api'

// Per-agent hermes token. claim() is internal so doesn't need it, but
// markStepSent is public and requireHermesAgent() reads this env var.
const BLANDO_TOKEN = 'test-blando-token'
const BLANDO_AGENT = 'blando'

beforeAll(() => {
  process.env.HERMES_TOKEN_BLANDO = BLANDO_TOKEN
})

const modules = import.meta.glob('../../convex/**/*.*s')

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.now() // claim() reads real Date.now() — must match

async function seedLead(t: ReturnType<typeof convexTest>, overrides: {
  email: string
  company?: string
  history?: Array<{ step: string; sentAt: number; subject: string }>
} = { email: 'lead@example.com' }) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('leads', {
      company: overrides.company ?? 'Acme',
      contact: 'Test',
      email: overrides.email,
      stage: 'queued',
      outreachState: 'e1_queued',
      outreachHistory: overrides.history,
    })
  })
}

async function seedQueueRow(t: ReturnType<typeof convexTest>, args: {
  leadId: any
  email: string
  touch: 1 | 2 | 3
  scheduledFor?: number
  forceBypassGates?: boolean
}) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert('outreach_queue', {
      leadId: args.leadId,
      company: 'Acme',
      contact: 'Test',
      email: args.email,
      status: 'queued',
      scheduledFor: args.scheduledFor ?? NOW - 60_000, // already due
      touch: args.touch,
      forceBypassGates: args.forceBypassGates,
      createdAt: NOW,
    })
  })
}

describe('claim() — Slice 3 state machine', () => {
  it('1. E1 from queued → ok, flips to sending', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, { email: 'e1@example.com' })
    const id = await seedQueueRow(t, { leadId, email: 'e1@example.com', touch: 1 })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(true)
    expect(result.email).toBe('e1@example.com')
    expect(result.step).toBe('e1')
    expect(result.businessName).toBe('Acme')

    // Verify status flipped to sending
    const row = await t.run(async (ctx) => ctx.db.get(id))
    expect(row?.status).toBe('sending')
  })

  it('2. E2 with no E1 history → blocked:e2_before_e1_sent', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, {
      email: 'noe1@example.com',
      history: [], // no E1
    })
    const id = await seedQueueRow(t, { leadId, email: 'noe1@example.com', touch: 2 })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('blocked:e2_before_e1_sent')

    // Status must NOT have flipped
    const row = await t.run(async (ctx) => ctx.db.get(id))
    expect(row?.status).toBe('queued')
  })

  it('3. E2 with E1 3d ago → blocked:e2_too_soon (E2_GAP_MS=4d)', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, {
      email: 'soon@example.com',
      history: [{ step: 'e1', sentAt: NOW - 3 * DAY, subject: 'E1' }],
    })
    const id = await seedQueueRow(t, { leadId, email: 'soon@example.com', touch: 2 })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/^blocked:e2_too_soon/)
  })

  it('4. E2 with E1 5d ago → ok', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, {
      email: 'ready@example.com',
      history: [{ step: 'e1', sentAt: NOW - 5 * DAY, subject: 'E1' }],
    })
    const id = await seedQueueRow(t, { leadId, email: 'ready@example.com', touch: 2 })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(true)
    expect(result.step).toBe('e2')
  })

  it('5a. E3 with no E2 history → blocked:e3_before_e2_sent', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, {
      email: 'noe2@example.com',
      history: [{ step: 'e1', sentAt: NOW - 5 * DAY, subject: 'E1' }], // E1 only
    })
    const id = await seedQueueRow(t, { leadId, email: 'noe2@example.com', touch: 3 })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('blocked:e3_before_e2_sent')
  })

  it('5b. E3 with E2 7d ago → ok (E3_GAP_MS=6d)', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, {
      email: 'e3ready@example.com',
      history: [
        { step: 'e1', sentAt: NOW - 12 * DAY, subject: 'E1' },
        { step: 'e2', sentAt: NOW - 7 * DAY, subject: 'E2' },
      ],
    })
    const id = await seedQueueRow(t, { leadId, email: 'e3ready@example.com', touch: 3 })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(true)
    expect(result.step).toBe('e3')
  })

  it('6. forceBypassGates=true short-circuits BOTH gates (E2 with E1 1d ago)', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, {
      email: 'bypass@example.com',
      history: [{ step: 'e1', sentAt: NOW - 1 * DAY, subject: 'E1' }],
    })
    // E2 with E1 only 1d ago (would normally be blocked:e2_too_soon) +
    // forceBypassGates=true → should pass
    const id = await seedQueueRow(t, {
      leadId,
      email: 'bypass@example.com',
      touch: 2,
      forceBypassGates: true,
    })

    const result = await t.mutation(internal.hermes.outreach2.claim, { id })

    expect(result.ok).toBe(true)
    expect(result.step).toBe('e2')
  })
})

describe('markStepSent() — Slice 3 idempotency', () => {
  it('7. second call returns { ok:true, noop:true, reason:"already_sent" }', async () => {
    const t = convexTest(schema, modules)
    const leadId = await seedLead(t, { email: 'idem@example.com' })
    // Pre-flip row to 'sent' to simulate the first call already having completed
    const id = await t.run(async (ctx) => {
      return await ctx.db.insert('outreach_queue', {
        leadId,
        company: 'Acme',
        contact: 'Test',
        email: 'idem@example.com',
        status: 'sent', // already-sent state
        touch: 1,
        sentAt: NOW - 1000,
        createdAt: NOW,
      })
    })

    const result = await t.mutation(api.hermes.outreach2.markStepSent, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: id,
      resendId: 'resend-123',
      subject: 'E1',
      step: 'e1',
    })

    expect(result.ok).toBe(true)
    expect(result.noop).toBe(true)
    expect(result.reason).toBe('already_sent')
  })
})

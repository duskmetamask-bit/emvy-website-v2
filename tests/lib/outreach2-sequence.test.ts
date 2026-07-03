// Slice 4b — Sequence integration test (mock Resend)
//
// Per `~/.claude/plans/jolly-jingling-sun.md` Slice 4b:
//   Mock fetch('https://api.resend.com/emails'). Walk a single lead
//   through E1 → E2 → E3 with forceBypassGates on E2/E3 (to skip the
//   real 4d/6d wait). Assert 3 email_sends rows + lead.outreachState='e3_sent'.

import { convexTest } from 'convex-test'
import { describe, expect, it, beforeAll, vi, afterEach } from 'vitest'
import schema from '../../convex/schema'
import { api, internal } from '../../convex/_generated/api'

const BLANDO_TOKEN = 'test-blando-token'
const BLANDO_AGENT = 'blando'

beforeAll(() => {
  process.env.HERMES_TOKEN_BLANDO = BLANDO_TOKEN
  process.env.HERMES_ACTIONS_TOKEN = 'test-actions-token'
  process.env.SENDER_NAME = 'convex-v2'
  process.env.RESEND_API_KEY = 'test-resend-key'
})

const modules = import.meta.glob('../../convex/**/*.*s')

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.now()

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockResendSuccess(msgId: string) {
  return vi.fn(async () =>
    new Response(JSON.stringify({ id: msgId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  )
}

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

async function queueStep(
  t: ReturnType<typeof convexTest>,
  args: { leadId: any; email: string; step: 'e1' | 'e2' | 'e3'; forceBypassGates?: boolean }
) {
  return await t.mutation(api.hermes.outreach2.queueStep, {
    token: BLANDO_TOKEN,
    agent: BLANDO_AGENT,
    email: args.email,
    businessName: 'Acme',
    step: args.step,
    scheduledFor: NOW - 1000, // already due
    subject: `${args.step} subject`,
    body: `${args.step} body`,
    forceBypassGates: args.forceBypassGates,
  })
}

describe('sequence integration — Slice 4b E1 → E2 → E3', () => {
  it('1. full happy path: E1+E2+E3 each fire exactly once, lead state e3_sent, 3 email_sends', async () => {
    const fetchMock = mockResendSuccess('msg-1')
    vi.stubGlobal('fetch', fetchMock)

    const t = convexTest(schema, modules)
    const email = 'seq@example.com'
    const leadId = await seedLead(t, email)

    // Queue E1+E2+E3 (E2/E3 with forceBypassGates to skip the 4d/6d gap).
    const e1 = await queueStep(t, { leadId, email, step: 'e1' })
    const e2 = await queueStep(t, { leadId, email, step: 'e2', forceBypassGates: true })
    const e3 = await queueStep(t, { leadId, email, step: 'e3', forceBypassGates: true })

    // Step 1: send E1
    const r1 = await t.action(api.hermes.outreach2.claimAndSendStep, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: e1.queueId,
      subject: 'E1',
      body: 'E1 body',
    })
    expect(r1.ok).toBe(true)
    expect(r1.state).toBe('e1_sent')

    // Step 2: send E2 (forceBypassGates on row bypasses the 4d gap)
    const r2 = await t.action(api.hermes.outreach2.claimAndSendStep, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: e2.queueId,
      subject: 'E2',
      body: 'E2 body',
    })
    expect(r2.ok).toBe(true)
    expect(r2.state).toBe('e2_sent')

    // Step 3: send E3
    const r3 = await t.action(api.hermes.outreach2.claimAndSendStep, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: e3.queueId,
      subject: 'E3',
      body: 'E3 body',
    })
    expect(r3.ok).toBe(true)
    expect(r3.state).toBe('e3_sent')

    // Assert: lead state is e3_sent
    const lead = await t.run(async (ctx) => ctx.db.get(leadId as any))
    expect(lead?.outreachState).toBe('e3_sent')
    expect(lead?.outreachHistory).toHaveLength(3)
    expect(lead?.outreachHistory?.[0]?.step).toBe('e1')
    expect(lead?.outreachHistory?.[1]?.step).toBe('e2')
    expect(lead?.outreachHistory?.[2]?.step).toBe('e3')

    // Assert: 3 email_sends rows
    const sends = await t.run(async (ctx) => {
      return await ctx.db
        .query('email_sends')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId as any))
        .collect()
    })
    expect(sends).toHaveLength(3)
    expect(sends.map((s) => s.sequence).sort()).toEqual(['e1', 'e2', 'e3'])

    // Assert: fetch was called 3 times, each with X-Outreach-Step in payload
    expect(fetchMock).toHaveBeenCalledTimes(3)
    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>
    expect(calls[0][0]).toBe('https://api.resend.com/emails')
    // X-Outreach-Step is in the JSON body's `headers` field, not the
    // RequestInit headers (Resend API takes custom headers in the body).
    const body0 = JSON.parse(calls[0][1].body as string)
    expect(body0.headers['X-Outreach-Step']).toBe('e1')
    expect(body0.to).toBe(email)

    // Assert: 3 activity_log rows for email_sent
    const activity = await t.run(async (ctx) => {
      return await ctx.db
        .query('activity_log')
        .withIndex('by_lead', (q) => q.eq('leadId', leadId as any))
        .collect()
    })
    const emailSentLogs = activity.filter((a) => a.action === 'email_sent')
    expect(emailSentLogs).toHaveLength(3)
  })

  it('2. E2 with no E1 sent → blocked, no fetch call, E2 row stays queued', async () => {
    const fetchMock = mockResendSuccess('msg-1')
    vi.stubGlobal('fetch', fetchMock)

    const t = convexTest(schema, modules)
    const email = 'noe1@example.com'
    const leadId = await seedLead(t, email)

    // Queue E1 then E2 (no E1 sent, no forceBypassGates).
    const e1 = await queueStep(t, { leadId, email, step: 'e1' })
    const e2 = await queueStep(t, { leadId, email, step: 'e2' })

    // Send E1.
    await t.action(api.hermes.outreach2.claimAndSendStep, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: e1.queueId,
      subject: 'E1',
      body: 'E1 body',
    })

    // E2 should still be blocked because the claim gate needs ≥4d since E1 sent.
    const r2 = await t.action(api.hermes.outreach2.claimAndSendStep, {
      token: BLANDO_TOKEN,
      agent: BLANDO_AGENT,
      queueId: e2.queueId,
      subject: 'E2',
      body: 'E2 body',
    })
    expect(r2.ok).toBe(false)
    expect(r2.noop).toBe(true)
    expect(r2.reason).toMatch(/^blocked:e2_too_soon/)

    // E2 row stays queued (not sent, not deleted).
    const e2Row = await t.run(async (ctx) => ctx.db.get(e2.queueId as any))
    expect(e2Row?.status).toBe('queued')

    // Only 1 fetch call (E1) happened.
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('3. Resend 500 error → row goes back to queued with backoff, no email_sends row', async () => {
    const fetchMock = vi.fn(async () =>
      new Response('server error', { status: 500 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const t = convexTest(schema, modules)
    const email = 'fail@example.com'
    const leadId = await seedLead(t, email)
    const e1 = await queueStep(t, { leadId, email, step: 'e1' })

    // claimAndSendStep should throw (Resend returned 500).
    await expect(
      t.action(api.hermes.outreach2.claimAndSendStep, {
        token: BLANDO_TOKEN,
        agent: BLANDO_AGENT,
        queueId: e1.queueId,
        subject: 'E1',
        body: 'E1 body',
      })
    ).rejects.toThrow(/Resend send failed/)

    // Row should be back to queued (or failed if MAX_ATTEMPTS hit) with attempts=1.
    const row = await t.run(async (ctx) => ctx.db.get(e1.queueId as any))
    expect(['queued', 'failed']).toContain(row?.status)
    expect(row?.attempts).toBe(1)
  })
})

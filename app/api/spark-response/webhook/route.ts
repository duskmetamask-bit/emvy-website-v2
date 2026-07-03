import { NextRequest, NextResponse } from 'next/server'

const CONVEX_URL = process.env.CONVEX_URL ?? ''
const CONVEX_ADMIN_KEY = process.env.CONVEX_ADMIN_KEY ?? ''
const VAPI_WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET ?? ''

/**
 * VAPI sends call events here as POST requests when:
 *   - call.completed  (call ended — primary log trigger)
 *   - call.failed     (call errored)
 *
 * VAPI docs: https://docs.vapi.ai/webhooks/overview
 */
export async function POST(req: NextRequest) {
  if (VAPI_WEBHOOK_SECRET && req.headers.get('x-vapi-secret') !== VAPI_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = body.type as string

  if (eventType !== 'call.completed' && eventType !== 'call.failed') {
    return NextResponse.json({ received: true })
  }

  const call = body.call as Record<string, unknown> | undefined
  if (!call) {
    return NextResponse.json({ error: 'Missing call object' }, { status: 400 })
  }

  const callSid = call.id as string
  const durationSeconds = call.duration as number | undefined
  const status = call.status as string | undefined

  const customer = call.customer as Record<string, unknown> | undefined
  const callerPhone = (
    customer?.number ??
    ((customer?.raw as Record<string, string | undefined>)?.number ?? '')
  ) as string
  const callerName = (customer?.name ?? customer?.verified_name ?? '') as string

  const metadata = (call.metadata ?? call.custom_metadata ?? {}) as Record<string, string>
  const jobType = metadata.jobType ?? ''
  const address = metadata.address ?? ''
  const ownerPhone = metadata.ownerPhone ?? ''
  const ownerTelegramChatId = metadata.ownerTelegramChatId ?? ''
  const calBookingUrl = metadata.calBookingUrl ?? ''

  let outcome: string
  if (eventType === 'call.failed') {
    outcome = 'failed'
  } else {
    const endedReason = (call.endedReason ?? call.end_reason ?? '') as string
    if (endedReason === 'NO_ANSWER') {
      outcome = 'no_answer'
    } else if (endedReason === 'TRANSFERRED' || calBookingUrl) {
      outcome = 'booked'
    } else {
      outcome = 'message_taken'
    }
  }

  if (!CONVEX_URL || !CONVEX_ADMIN_KEY) {
    console.error('[spark-response webhook] Missing CONVEX_URL or CONVEX_ADMIN_KEY env vars')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONVEX_ADMIN_KEY}`,
      },
      body: JSON.stringify({
        path: 'sparkResponse/writeCall',
        args: {
          callSid,
          callerName: callerName || undefined,
          callerPhone: callerPhone || undefined,
          jobType: jobType || undefined,
          address: address || undefined,
          outcome,
          ownerPhone: ownerPhone || '',
          ownerTelegramChatId: ownerTelegramChatId || undefined,
          durationSeconds: durationSeconds ?? undefined,
          calBookingUrl: calBookingUrl || undefined,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[spark-response webhook] Convex mutation failed:', res.status, text)
      return NextResponse.json({ error: 'Write failed' }, { status: 500 })
    }
  } catch (err) {
    console.error('[spark-response webhook] Network error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

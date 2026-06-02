import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function getWebhookSecret(): string {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('RESEND_WEBHOOK_SECRET env var is not set')
  }
  return secret
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()

    // Resend uses svix-* headers (svix-id, svix-timestamp, svix-signature).
    // standardwebhooks accepts the unbranded webhook-* keys, so we map here.
    const headers = {
      'webhook-id': req.headers.get('webhook-id') ?? req.headers.get('svix-id') ?? '',
      'webhook-timestamp':
        req.headers.get('webhook-timestamp') ?? req.headers.get('svix-timestamp') ?? '',
      'webhook-signature':
        req.headers.get('webhook-signature') ?? req.headers.get('svix-signature') ?? '',
    }
    if (!headers['webhook-id'] || !headers['webhook-timestamp'] || !headers['webhook-signature']) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 })
    }

    let payload: any
    try {
      const wh = new Webhook(getWebhookSecret())
      payload = wh.verify(body, headers)
    } catch (err) {
      console.error('Resend webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { type, created_at, recipient, email_id, user_agent, ip, data } = payload

    if (!type) {
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
    }

    const result = await convex.mutation(api.webhooks.resend.handleEmailEvent, {
      type,
      created_at: created_at || Date.now(),
      recipient,
      email_id,
      user_agent,
      ip,
      data,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Resend webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

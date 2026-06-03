import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function getSecret(): string {
  const secret = process.env.EMAIL_INBOUND_SECRET
  if (!secret) {
    throw new Error('EMAIL_INBOUND_SECRET env var is not set')
  }
  return secret
}

function verifyHmac(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== signature.length) return false
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('x-emvy-signature') || ''

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!verifyHmac(body, sig, getSecret())) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    if (!payload.messageId || !payload.from || !payload.to || !payload.receivedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await convex.mutation(api.email_inbox.recordInboundEmail, {
      messageId: payload.messageId,
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      body: payload.body,
      htmlBody: payload.htmlBody,
      inReplyTo: payload.inReplyTo,
      references: payload.references,
      receivedAt: payload.receivedAt,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Email inbound webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

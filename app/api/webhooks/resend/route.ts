import { NextRequest, NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Resend sends: { type, created_at, recipient, email_id, user_agent, ip, data: { ... } }
    const { type, created_at, recipient, email_id, user_agent, ip, data } = body

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

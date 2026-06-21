import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { email, name } = data

    if (!email || !name) {
      return NextResponse.json({ error: 'name_and_email_required' }, { status: 400 })
    }

    // Forward to the VPS webhook
    const webhookUrl = process.env.WEBHOOK_URL || 'https://localhost:9445'
    const res = await fetch(`${webhookUrl}/api/pre-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      console.error('Webhook returned error:', res.status)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Pre-strategy API error:', e)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

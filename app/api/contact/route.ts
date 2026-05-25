import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const resend = getResend()

    if (!resend) {
      return NextResponse.json({ error: 'Email is not configured.' }, { status: 501 })
    }

    await resend.emails.send({
      from: process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com',
      to: process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com',
      subject: `New enquiry from ${body.name ?? 'EMVY site'}`,
      text: JSON.stringify(body, null, 2),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send message.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}


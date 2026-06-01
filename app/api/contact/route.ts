import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ConvexHttpClient } from 'convex/browser'

export const runtime = 'nodejs'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // Save to Convex
    const contactResult = await convex.mutation('webhooks/contact:submit', {
      name: body.name,
      email: body.email,
      phone: body.phone || body.role,
      company: body.company,
      message: body.message,
      source: 'contact-form',
    })

    // Send email notification
    const resend = getResend()
    if (resend) {
      await resend.emails.send({
        from: process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com',
        to: process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com',
        subject: `New enquiry from ${body.name ?? 'EMVY site'}`,
        text: JSON.stringify(body, null, 2),
      })
    }

    return NextResponse.json({ ok: true, contactResult }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send message.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}


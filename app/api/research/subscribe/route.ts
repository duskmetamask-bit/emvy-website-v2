import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ResearchSubscriber, computeLeadScore } from '@/lib/research'

export const runtime = 'nodejs'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<ResearchSubscriber>

    if (!body.email || !body.source) {
      return NextResponse.json({ error: 'Email and source are required.' }, { status: 400 })
    }

    const leadScore = computeLeadScore({
      role: body.role,
      company: body.company,
    })

    const resend = getResend()
    if (resend) {
      await resend.emails.send({
        from: process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com',
        to: process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com',
        subject: `Research subscriber: ${body.email}`,
        text: JSON.stringify(
          {
            ...body,
            leadScore,
            subscribedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      })
    }

    return NextResponse.json({
      ok: true,
      leadScore,
      subscriber: body,
      delivery: resend ? 'sent' : 'captured_without_email_service',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to subscribe.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


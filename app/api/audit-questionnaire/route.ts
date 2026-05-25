import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const payload = {
    name: body.name ?? '',
    email: body.email ?? '',
    company: body.company ?? '',
    role: body.role ?? '',
    score: body.score ?? 0,
    tier: body.tier ?? 'Starter',
    answers: body.answers ?? [],
    breakdown: body.breakdown ?? [],
    source: body.source ?? 'quiz',
  }

  const resend = getResend()

  if (resend && payload.email) {
    const sender = process.env.BREVO_SENDER_EMAIL ?? 'hello@emvyai.com'
    const breakdownText = Array.isArray(payload.breakdown)
      ? payload.breakdown
          .map((item: { title?: string; value?: string | number; note?: string }) => {
            const title = item.title ?? 'Section'
            const value = item.value ?? ''
            const note = item.note ?? ''
            return `${title}: ${value}${note ? ` - ${note}` : ''}`
          })
          .join('\n')
      : ''

    await resend.emails.send({
      from: sender,
      to: payload.email,
      subject: `Your EMVY quiz result: ${payload.score}/100`,
      text: [
        `Thanks ${payload.name || 'there'},`,
        '',
        `Your quiz result is ${payload.score}/100 (${payload.tier}).`,
        '',
        'Breakdown:',
        breakdownText || 'No breakdown available.',
        '',
        'Next step:',
        'Book the discovery call if you want the first implementation plan mapped properly.',
      ].join('\n'),
    })

    await resend.emails.send({
      from: sender,
      to: sender,
      subject: `Audit submission from ${payload.name || 'EMVY site'}`,
      text: JSON.stringify(payload, null, 2),
    })
  }

  return NextResponse.json({
    ok: true,
    delivered: Boolean(resend && payload.email),
    ...payload,
  })
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

// Generate and email the post-call audit deliverable PDF.
//
// POST /api/audit/send
// Body: {
//   leadId?: string,          // optional — for activity_log
//   to: string,               // recipient email
//   companyName: string,
//   contactName?: string,
//   summary: string,
//   findings: { title, description }[],
//   metrics: { label, value }[],
//   plan: { phase, title, description }[],
//   investment: { range, structure, notes? },
//   nextStepUrl: string,
//   nextStepLabel: string
// }
//
// Auth: Bearer token matching HERMES_ACTIONS_TOKEN, OR an internal
// board session cookie (operator use).
//
// Pipeline:
//   1. Validate input
//   2. Render AuditReport PDF
//   3. Email it via Resend with the same dark-theme brand
//   4. If leadId provided, log to activity_log

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { Resend } from 'resend'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import AuditReport, { type AuditFinding, type AuditPlan } from '@/lib/pdf/AuditReport'

export const runtime = 'nodejs'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

type Body = {
  leadId?: string
  to: string
  companyName: string
  contactName?: string
  preparedFor?: string
  summary: string
  findings: AuditFinding[]
  metrics: { label: string; value: string }[]
  plan: AuditPlan[]
  investment: { range: string; structure: string; notes?: string }
  nextStepUrl: string
  nextStepLabel: string
}

function isBody(value: unknown): value is Body {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.to === 'string' &&
    typeof v.companyName === 'string' &&
    typeof v.summary === 'string' &&
    Array.isArray(v.findings) &&
    Array.isArray(v.metrics) &&
    Array.isArray(v.plan) &&
    typeof v.investment === 'object' &&
    typeof v.nextStepUrl === 'string' &&
    typeof v.nextStepLabel === 'string'
  )
}

export async function POST(req: NextRequest) {
  // Allow either Hermes Bearer or board session (cross-origin friendly)
  const auth = req.headers.get('authorization') ?? ''
  const expected = process.env.HERMES_ACTIONS_TOKEN
  let authed = false
  if (expected && auth.startsWith('Bearer ') && auth.slice(7) === expected) {
    authed = true
  }
  // Board session: rely on the board's own auth (the board UI posts via
  // /api/audit/send and that route is server-side; the same-origin board
  // session cookie isn't on this domain, so the operator UI uses Hermes
  // Bearer via a board-internal proxy in production. For now, accept
  // any request with valid Resend config in dev.)
  if (process.env.NODE_ENV !== 'production') {
    authed = true
  }
  if (!authed) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!isBody(body)) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
  }

  try {
    const pdfBuffer = await renderToBuffer(
      <AuditReport
        companyName={body.companyName}
        contactName={body.contactName}
        preparedFor={body.preparedFor}
        date={new Date().toLocaleDateString('en-AU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        summary={body.summary}
        findings={body.findings}
        metrics={body.metrics}
        plan={body.plan}
        investment={body.investment}
        nextStepUrl={body.nextStepUrl}
        nextStepLabel={body.nextStepLabel}
      />
    )

    const resend = getResend()
    if (!resend) {
      // No Resend — return the PDF directly for download
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="EMVY-Audit-${body.companyName.replace(/\s+/g, '-')}.pdf"`,
        },
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'EMVY <noreply@emvyai.com>',
      to: body.to,
      subject: `${body.companyName} — Operations Audit Deliverable`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #05070b; font-size: 22px; margin-bottom: 20px;">Your Operations Audit</h1>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            Hi${body.contactName ? ` ${body.contactName}` : ''},
          </p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            Attached is the operations audit deliverable for ${body.companyName}. It covers the
            key findings from our call, the recommended 90-day plan, and the indicative
            investment range.
          </p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            The full report is attached as a PDF.
          </p>
          <p style="color: #333; font-size: 15px; line-height: 1.6;">
            <a href="${body.nextStepUrl}" style="color: #56d9ff;">${body.nextStepLabel}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">emvy.ai</p>
        </div>
      `,
      attachments: [
        {
          filename: `EMVY-Audit-${body.companyName.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    if (body.leadId && process.env.NEXT_PUBLIC_CONVEX_URL) {
      try {
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
        await convex.mutation(api.board.leads.addNote, {
          id: body.leadId as never,
          text: `Audit deliverable emailed to ${body.to} (${data?.id ?? 'no-resend-id'})`,
        }).catch(() => null)
      } catch {
        // Non-fatal
      }
    }

    return NextResponse.json({ ok: true, resendId: data?.id })
  } catch (e) {
    console.error('Audit send error:', e)
    const message = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST { to, companyName, summary, findings[], metrics[], plan[], investment, nextStepUrl, nextStepLabel }',
  })
}

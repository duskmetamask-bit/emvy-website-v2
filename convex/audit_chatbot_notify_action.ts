"use node";

// audit_chatbot_notify_action — node-runtime action that fires the
// operator email (Resend) + VPS webhook on audit_chatbot_leads:create.
// Split from audit_chatbot_notify.ts because Convex requires node-only
// actions to live in a `"use node"` file with no other exports.

import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import { internal } from './_generated/api'
import { createHmac } from 'node:crypto'

const RESEND_API = 'https://api.resend.com/emails'

export const notifyOperator = internalAction({
  args: { chatbotLeadId: v.id('audit_chatbot_leads') },
  handler: async (ctx, { chatbotLeadId }) => {
    const row = await ctx.runQuery(internal.audit_chatbot_notify.getRow, {
      id: chatbotLeadId,
    })
    if (!row) {
      console.warn('[audit_chatbot_notify] row not found', { chatbotLeadId })
      return { ok: false, reason: 'row_not_found' as const }
    }
    if (row.notifiedAt) {
      return { ok: true, noop: true, reason: 'already_notified' as const }
    }

    const errors: string[] = []

    // --- (1) Operator email via Resend ---
    const resendKey = process.env.RESEND_API_KEY
    const operatorEmail = process.env.NOTIFY_OPERATOR_EMAIL ?? 'jake@emvyai.com'
    const fromAddress =
      process.env.NOTIFY_FROM_ADDRESS ?? 'EMVY Audit Bot <audit@emvyai.com>'

    if (!resendKey) {
      errors.push('RESEND_API_KEY not set on Convex deployment')
    } else {
      const summary = auditSummary(row)
      try {
        const res = await fetch(RESEND_API, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: operatorEmail,
            subject: `[Audit] ${row.name ?? 'Unknown'} — ${row.businessName ?? row.company ?? 'No company'} (${row.industry ?? 'unspecified'})`,
            text: summary,
          }),
        })
        if (!res.ok) {
          const errText = await res.text().catch(() => 'unknown')
          errors.push(`Resend ${res.status}: ${errText.slice(0, 200)}`)
        }
      } catch (e) {
        errors.push(`Resend fetch failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // --- (2) VPS webhook ---
    const webhookUrl =
      process.env.WEBHOOK_URL ?? 'https://100.103.229.74:9445/webhook/assessment'
    const hmacSecret = process.env.EMVY_INBOUND_HMAC_SECRET ?? ''

    const payload = {
      email: row.email,
      name: row.name,
      company: row.businessName ?? row.company ?? '',
      industry: row.industry ?? '',
      // The existing _handle_assessment reads `score` even though v2
      // dropped it. Send 0 so the Telegram alert renders cleanly.
      score: 0,
      source: 'audit_chatbot',
      chatbotLeadId,
    }
    const body = JSON.stringify(payload)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (hmacSecret) {
      const sig = createHmac('sha256', hmacSecret).update(body).digest('hex')
      headers['X-EMVY-Signature'] = `sha256=${sig}`
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body,
        // 8s budget — past that, treat as failure so the action
        // doesn't hang and the operator gets notified eventually
        // via the email side.
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown')
        errors.push(`Webhook ${res.status}: ${errText.slice(0, 200)}`)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const cause = e instanceof Error && e.cause ? ` (cause: ${String(e.cause)})` : ''
      errors.push(`Webhook fetch failed: ${msg}${cause} [${webhookUrl}]`)
    }

    // Mark notified regardless of partial failure so we don't spam the
    // operator on every retry. Errors are recorded in notificationErrors.
    await ctx.runMutation(internal.audit_chatbot_notify.markNotified, {
      id: chatbotLeadId,
      errors,
    })

    return {
      ok: errors.length === 0,
      errors: errors.length ? errors : undefined,
    }
  },
})

function auditSummary(row: {
  name?: string
  email: string
  businessName?: string
  company?: string
  industry?: string
  teamSize?: string
  summary?: string
  quickWin?: string
  nextStep?: string
  painPoints?: string[]
  findings?: Array<{ category: string; text: string }>
  opportunities?: Array<{ title: string; whatItIs?: string }>
}): string {
  const lines: string[] = []
  lines.push(`Name:     ${row.name ?? '—'}`)
  lines.push(`Email:    ${row.email}`)
  lines.push(`Business: ${row.businessName ?? row.company ?? '—'}`)
  lines.push(`Industry: ${row.industry ?? '—'}`)
  if (row.teamSize) lines.push(`Size:     ${row.teamSize}`)
  if (row.summary) {
    lines.push('')
    lines.push('Summary:')
    lines.push(row.summary)
  }
  if (row.quickWin) {
    lines.push('')
    lines.push(`Quick win: ${row.quickWin}`)
  }
  if (row.nextStep) {
    lines.push(`Next step: ${row.nextStep}`)
  }
  if (row.painPoints && row.painPoints.length > 0) {
    lines.push('')
    lines.push('Pain points:')
    for (const p of row.painPoints) lines.push(`  - ${p}`)
  }
  if (row.findings && row.findings.length > 0) {
    lines.push('')
    lines.push('Findings:')
    for (const f of row.findings) lines.push(`  [${f.category}] ${f.text}`)
  }
  if (row.opportunities && row.opportunities.length > 0) {
    lines.push('')
    lines.push('Opportunities:')
    for (const o of row.opportunities) {
      lines.push(`  - ${o.title}`)
      if (o.whatItIs) lines.push(`      ${o.whatItIs}`)
    }
  }
  return lines.join('\n')
}

// Shared email template helper for the outreach flow.
//
// Wraps a draft body in a consistent HTML + plain-text layout with the
// EMVY brand footer (logo + tagline + contact + ABN). Used by both the
// mass-send path (autoSend, FROM hello@emvyai.com) and the operator
// board-send path (sendEditedFromBoard, FROM jake@emvyai.com) so the
// recipient sees the same brand in both cases.
//
// The Resend payload is built by the caller from the returned {html, text}.

const DEFAULT_LOGO_URL = 'https://emvyai.com/brand/logo.png'
const TAGLINE = 'We identify, build, and maintain practical AI systems for Australian SMBs.'
const CONTACT_EMAIL = 'jake@emvyai.com'
const WEBSITE_URL = 'https://emvyai.com'
const WEBSITE_DISPLAY = 'emvyai.com'
const ABN = '82 488 276 510'

const ACCENT = '#56d9ff'
const TEXT = '#0f172a'
const MUTED = '#6b7280'
const FAINT = '#9ca3af'
const RULE = '#e5e7eb'

// Override the logo URL via env (useful for staging or after a brand swap).
// OUTREACH_LOGO_URL is read at module load — re-deploy to pick up changes.
const LOGO_URL = process.env.OUTREACH_LOGO_URL || DEFAULT_LOGO_URL

// Inline-styled footer table. Outlook + Gmail strip <style> blocks, so
// everything must be inline. Table-based layout for max client compat.
const FOOTER_HTML = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:32px;padding-top:24px;border-top:1px solid ${RULE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${MUTED};font-size:13px;line-height:1.6;">
  <tr>
    <td style="padding-bottom:16px;">
      <img src="${LOGO_URL}" alt="EMVY — AI Consultancy" width="120" height="auto" style="display:block;border:0;outline:none;text-decoration:none;" />
    </td>
  </tr>
  <tr>
    <td style="padding-bottom:12px;color:${TEXT};">${TAGLINE}</td>
  </tr>
  <tr>
    <td>
      <a href="mailto:${CONTACT_EMAIL}" style="color:${ACCENT};text-decoration:none;">${CONTACT_EMAIL}</a>
      <span style="color:${FAINT};">&nbsp;&middot;&nbsp;</span>
      <a href="${WEBSITE_URL}" style="color:${ACCENT};text-decoration:none;">${WEBSITE_DISPLAY}</a>
    </td>
  </tr>
  <tr>
    <td style="padding-top:8px;color:${FAINT};font-size:12px;">ABN ${ABN}</td>
  </tr>
</table>`

const FOOTER_TEXT = `

--
EMVY — AI Consultancy
${TAGLINE}
${CONTACT_EMAIL} · ${WEBSITE_DISPLAY}
ABN ${ABN}`

export function wrapEmailBody(body: string): { html: string; text: string } {
  const bodyHtml = body.replace(/\n/g, '<br/>')
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT};font-size:15px;line-height:1.6;">${bodyHtml}${FOOTER_HTML}</div>`
  const text = `${body}${FOOTER_TEXT}`
  return { html, text }
}

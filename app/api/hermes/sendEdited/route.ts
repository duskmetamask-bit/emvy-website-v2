// Board operator-send bridge.
//
// POST /api/hermes/sendEdited
// Headers: Authorization: Bearer <HERMES_ACTIONS_TOKEN>  (forwarded from board)
// Content-Type: application/json
// Body: { draftId, leadId, to, subject, body }
//
// Forwards the operator's edited draft to hermes.outreach.sendEditedFromBoard,
// which validates the recipient, fires Resend from FROM_ADDRESS_BOARD
// (jake@emvyai.com), and atomically writes email_sends + draft flip +
// activity_log + learnings row + lead stage bump + followup/queue cancel.
//
// Returns the action's result pass-through.

import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const runtime = 'nodejs'

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL not set')
  return new ConvexHttpClient(url)
}

function checkAuth(req: Request): boolean {
  const auth = req.headers.get('authorization') ?? ''
  const expected = process.env.HERMES_ACTIONS_TOKEN
  if (!expected) return false
  if (auth.startsWith('Bearer ') && auth.slice(7) === expected) return true
  return false
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { draftId, leadId, to, subject, body: emailBody } = body ?? {}
    if (!draftId || !leadId || !to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'missing_fields', required: ['draftId', 'leadId', 'to', 'subject', 'body'] },
        { status: 400 },
      )
    }
    const convex = getConvex()
    const token = process.env.HERMES_ACTIONS_TOKEN!
    const result = await convex.action(api.hermes.outreach2.sendEditedFromBoard, {
      token,
      agent: 'mewy',
      draftId,
      leadId,
      to,
      subject,
      body: emailBody,
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST JSON { draftId, leadId, to, subject, body } with Bearer auth',
  })
}

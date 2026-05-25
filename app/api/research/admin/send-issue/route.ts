import { NextResponse } from 'next/server'
import { getNewsletterIssue } from '@/lib/research'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  if (!body.slug) {
    return NextResponse.json({ error: 'Issue slug is required.' }, { status: 400 })
  }

  const issue = getNewsletterIssue(body.slug)

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found.' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    issue,
    message: 'Newsletter send workflow scaffolded. Wire Resend audience sending when production list management is ready.',
  })
}

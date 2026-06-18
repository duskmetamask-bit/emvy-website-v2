// Manual trigger for the daily runner.
// Useful for testing without waiting for the 9am AEST cron.
// Also lets Hermes re-fire if the cron failed.
//
// POST /api/hermes/runDaily        — runs the daily cadence
// POST /api/hermes/runDaily?action=followups — runs the follow-up cadence
//
// Auth: Bearer token matching HERMES_ACTIONS_TOKEN env var, OR a
// session cookie for the operator (admin only).

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
    const convex = getConvex()
    const url = new URL(req.url)
    const action = url.searchParams.get('action') ?? 'daily'
    const token = process.env.HERMES_ACTIONS_TOKEN!
    if (action === 'followups') {
      const result = await convex.action(api.hermes.runner.runFollowups, {
        token,
        agent: 'blando',
      })
      return NextResponse.json({ ok: true, mode: 'followups', result })
    }
    const result = await convex.action(api.hermes.runner.runDaily, {
      token,
      agent: 'blando',
    })
    return NextResponse.json({ ok: true, mode: 'daily', result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST with Authorization: Bearer <HERMES_ACTIONS_TOKEN>',
    actions: ['daily', 'followups'],
  })
}

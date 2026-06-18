// CSV seeder for the outreach queue.
//
// POST /api/hermes/seedTradies
// Headers: Authorization: Bearer <HERMES_ACTIONS_TOKEN>
// Content-Type: text/csv
// Body: CSV with header row
//   company,contact,email,phone,website,location,sector
//
// Upserts each row into Convex `leads` (matched on email), then enqueues
// in `outreach_queue` with status=queued. Staggers scheduledFor across
// the next 7 days so the 40/day cadence drains the batch naturally
// instead of piling up on day 1.
//
// Also creates a `leads` row first (using the public hermes upsert so
// activity_log records actor=hermes), then enqueues.

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

type CsvRow = {
  company: string
  contact?: string
  email: string
  phone?: string
  website?: string
  location?: string
  sector?: string
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)
  const required = ['company', 'email']
  for (const r of required) {
    if (idx(r) < 0) {
      throw new Error(`CSV missing required column: ${r}`)
    }
  }
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim())
    const row: CsvRow = {
      company: cols[idx('company')] ?? '',
      email: cols[idx('email')] ?? '',
    }
    const iContact = idx('contact')
    if (iContact >= 0 && cols[iContact]) row.contact = cols[iContact]
    const iPhone = idx('phone')
    if (iPhone >= 0 && cols[iPhone]) row.phone = cols[iPhone]
    const iWeb = idx('website')
    if (iWeb >= 0 && cols[iWeb]) row.website = cols[iWeb]
    const iLoc = idx('location')
    if (iLoc >= 0 && cols[iLoc]) row.location = cols[iLoc]
    const iSec = idx('sector')
    if (iSec >= 0 && cols[iSec]) row.sector = cols[iSec]
    if (row.company && row.email) rows.push(row)
  }
  return rows
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const text = await req.text()
    const rows = parseCsv(text)
    if (rows.length === 0) {
      return NextResponse.json({ ok: true, enqueued: 0, total: 0 })
    }
    const convex = getConvex()
    const token = process.env.HERMES_ACTIONS_TOKEN!
    const now = Date.now()
    const horizon = 7 * 24 * 60 * 60 * 1000 // spread over 7 days
    const step = Math.floor(horizon / Math.max(rows.length, 1))

    const results: { email: string; leadId?: string; queueId?: string; error?: string }[] = []
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const scheduledFor = now + i * step
      try {
        const upsert = await convex.mutation(api.hermes.leads.upsert, {
          token,
          agent: 'blando',
          email: r.email,
          company: r.company,
          contact: r.contact,
          phone: r.phone,
          website: r.website,
          location: r.location,
          sector: r.sector ?? 'trades',
          source: 'csv_seed',
          stage: 'discover',
        })
        const queueId = await convex.mutation(api.hermes.runner.enqueue, {
          token,
          agent: 'blando',
          leadId: upsert.id,
          company: r.company,
          contact: r.contact,
          email: r.email,
          phone: r.phone,
          website: r.website,
          location: r.location,
          sector: r.sector ?? 'trades',
          source: 'csv_seed',
          scheduledFor,
        })
        results.push({ email: r.email, leadId: upsert.id, queueId })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        results.push({ email: r.email, error: msg.slice(0, 200) })
      }
    }
    const ok = results.filter((r) => !r.error).length
    const failed = results.filter((r) => r.error).length
    return NextResponse.json({
      ok: true,
      total: rows.length,
      enqueued: ok,
      failed,
      horizon: '7d',
      results: results.slice(0, 50),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage:
      'POST CSV with header company,contact,email,phone,website,location,sector',
    example: 'company,contact,email,phone,website,location,sector\n' +
      'Joe\'s Plumbing,Joe,joe@joesplumb.com.au,0400...,https://joesplumb.com.au,Brisbane,plumber',
  })
}

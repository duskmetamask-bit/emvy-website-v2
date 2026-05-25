import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  if (!body.slug) {
    return NextResponse.json({ error: 'Slug is required.' }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    slug: body.slug,
    status: body.status ?? 'published',
    message: 'Publishing endpoint scaffolded for reviewed Hermes content.',
  })
}


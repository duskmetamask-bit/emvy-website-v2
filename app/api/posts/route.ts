import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ posts: [] })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return NextResponse.json({ ok: true, post: body }, { status: 201 })
}


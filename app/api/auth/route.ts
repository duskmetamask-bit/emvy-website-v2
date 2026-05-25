import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    user: body.user ?? null,
    role: body.role ?? null,
  })
}

export async function GET() {
  return NextResponse.json({ ok: true })
}


import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    pages: [],
  })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return NextResponse.json({
    ok: true,
    page: body,
  })
}


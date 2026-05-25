import { NextResponse } from 'next/server'
import { researchPosts } from '@/lib/research'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  return NextResponse.json({
    ok: true,
    mode: body.mode ?? 'manual',
    imported: researchPosts.length,
    reviewQueue: researchPosts.filter((post) => post.draftStatus !== 'published').length,
    message: 'Hermes ingestion scaffold completed. Connect Supabase persistence and scheduler next.',
  })
}


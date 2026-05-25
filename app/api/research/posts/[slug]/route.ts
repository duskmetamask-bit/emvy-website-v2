import { NextResponse } from 'next/server'
import { getResearchPost } from '@/lib/research'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const post = getResearchPost(params.slug)

  if (!post) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  return NextResponse.json({ post })
}


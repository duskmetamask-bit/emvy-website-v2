import { NextResponse } from 'next/server'
import { getPostsForTopic, getResearchTopic } from '@/lib/research'

export const runtime = 'nodejs'

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const topic = getResearchTopic(params.slug)

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found.' }, { status: 404 })
  }

  return NextResponse.json({
    topic,
    posts: getPostsForTopic(params.slug),
  })
}


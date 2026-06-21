import { NextResponse } from 'next/server'

// Blog posts data — Maya's cron publishes to this JSON file.
// The blog page fetches from /api/blog to display current posts.
// Maya adds new posts by appending to this list.
export const dynamic = 'force-static'

// In-memory fallback for build time
const DEFAULT_POSTS: Post[] = [
  {
    slug: '5-things-before-ai-agents',
    title: '5 Things I Wish I Had Known Before Starting with AI Agents',
    summary: 'What I learned from running AI agents in production — the misconceptions, the surprises, and what actually matters.',
    vertical: 'general',
    publishedAt: Date.now() - 86400000 * 3,
  },
  {
    slug: 'ai-agent-memory-problem',
    title: 'The Memory Problem in AI Agents Is Not What You Think',
    summary: 'Why most AI agents forget everything after every session and how to fix it.',
    vertical: 'professional-services',
    publishedAt: Date.now() - 86400000 * 2,
  },
  {
    slug: 'measure-ai-roi-small-business',
    title: 'How to Measure AI ROI for Your Small Business',
    summary: 'A practical framework for figuring out if an AI tool is actually saving you money or just adding noise.',
    vertical: 'trades',
    publishedAt: Date.now() - 86400000,
  },
]

export type Post = {
  slug: string
  title: string
  summary: string
  body?: string
  vertical: string
  targetKeyword?: string
  publishedAt?: number
}

// Runtime data - updated by Maya's cron via API call
let runtimePosts: Post[] = [...DEFAULT_POSTS]

export async function GET() {
  return NextResponse.json({ posts: runtimePosts })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, slug, summary, body: postBody, vertical, targetKeyword } = body
    
    if (!title || !slug || !summary) {
      return NextResponse.json({ error: 'title, slug, and summary required' }, { status: 400 })
    }
    
    const newPost: Post = {
      slug,
      title,
      summary,
      body: postBody,
      vertical: vertical || 'general',
      targetKeyword,
      publishedAt: Date.now(),
    }
    
    // Replace if slug exists, otherwise append
    const idx = runtimePosts.findIndex(p => p.slug === slug)
    if (idx >= 0) {
      runtimePosts[idx] = newPost
    } else {
      runtimePosts.push(newPost)
    }
    
    return NextResponse.json({ ok: true, post: newPost })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  return POST(req)
}

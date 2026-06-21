import Link from 'next/link'
import { notFound } from 'next/navigation'

const posts: Record<string, { title: string; summary: string }> = {
  '5-things-before-ai-agents': {
    title: '5 Things I Wish I Had Known Before Starting with AI Agents',
    summary: 'What I learned from running AI agents in production — the misconceptions, the surprises, and what actually matters.',
  },
  'ai-agent-memory-problem': {
    title: 'The Memory Problem in AI Agents Is Not What You Think',
    summary: 'Why most AI agents forget everything after every session and how to fix it.',
  },
  'measure-ai-roi-small-business': {
    title: 'How to Measure AI ROI for Your Small Business',
    summary: 'A practical framework for figuring out if an AI tool is actually saving you money or just adding noise.',
  },
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]

  if (!post) notFound()

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
        &larr; Back to blog
      </Link>
      <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 600, lineHeight: 1.15, marginBottom: 12 }}>
        {post.title}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
        {post.summary}
      </p>
      <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)' }}>
        <p>Full article coming soon. Maya is writing this up.</p>
      </div>
    </div>
  )
}

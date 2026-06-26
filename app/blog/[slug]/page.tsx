import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import JsonLd from '@/components/JsonLd'
import MarkdownLite from '@/components/MarkdownLite'
import { blogPosting, breadcrumbList, faqPage } from '@/lib/schema/jsonld'

const SITE_URL = 'https://emvyai.com' as const
const SITE_NAME = 'EMVY' as const

type BlogPost = {
  _id: string
  title: string
  slug: string
  summary: string
  body?: string
  targetKeyword?: string
  vertical: 'trades' | 'professional-services' | 'general'
  status: 'draft' | 'published'
  publishedAt?: number
  updatedAt?: number
  agentId?: 'maya'
  sourcePath?: string
  heroImageUrl?: string
  readingTimeMinutes?: number
}

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
  return new ConvexHttpClient(url)
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const convex = getConvex()
    const post = await convex.query(api.blog.getBySlug, { slug })
    return (post as BlogPost | null) ?? null
  } catch {
    return null
  }
}

async function getRelated(vertical: BlogPost['vertical'], excludeId: string): Promise<BlogPost[]> {
  try {
    const convex = getConvex()
    const rows = (await convex.query(api.blog.list, {})) as unknown as BlogPost[]
    return rows.filter((p) => p.vertical === vertical && p._id !== excludeId).slice(0, 3)
  } catch {
    return []
  }
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s
  return s.slice(0, max - 1).trimEnd() + '…'
}

function formatDate(ts?: number) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function readingTime(body?: string): number {
  if (!body) return 1
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

const VERTICAL_PILL: Record<BlogPost['vertical'], { bg: string; fg: string; label: string }> = {
  trades: { bg: 'rgba(6, 182, 212, 0.1)', fg: 'var(--accent)', label: 'Trades' },
  'professional-services': {
    bg: 'rgba(99, 102, 241, 0.1)',
    fg: '#818cf8',
    label: 'Professional Services',
  },
  general: { bg: 'rgba(148, 163, 184, 0.1)', fg: 'var(--text-secondary)', label: 'General' },
}

const VERTICAL_CTA: Record<BlogPost['vertical'], { label: string; href: string }> = {
  trades: { label: 'Talk to a trades AI strategist', href: '/services/discovery-call' },
  'professional-services': {
    label: 'Book an AI strategy call',
    href: '/services/ai-strategy-call',
  },
  general: { label: 'Take the free AI Strategy Audit', href: '/assessment' },
}

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Not found' }
  const url = `${SITE_URL}/blog/${post.slug}`
  const title = truncate(post.title, 60)
  const description = truncate(post.summary, 160)
  const image = post.heroImageUrl ?? `${SITE_URL}/brand/exports/og-image.png`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image }],
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: ['Jake Wun'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPost(params.slug)
  if (!post) notFound()

  const minutes = post.readingTimeMinutes ?? readingTime(post.body)
  const pill = VERTICAL_PILL[post.vertical] ?? VERTICAL_PILL.general
  const cta = VERTICAL_CTA[post.vertical] ?? VERTICAL_CTA.general
  const related = await getRelated(post.vertical, post._id)
  const url = `${SITE_URL}/blog/${post.slug}`

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
      <JsonLd
        data={[
          blogPosting({
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            body: post.body,
            heroImageUrl: post.heroImageUrl,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            targetKeyword: post.targetKeyword,
            url,
          }),
          breadcrumbList([
            { name: 'Home', url: SITE_URL },
            { name: 'Blog', url: `${SITE_URL}/blog` },
            { name: post.title, url },
          ]),
        ]}
      />

      <Link
        href="/blog"
        style={{
          fontSize: 14,
          color: 'var(--accent)',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 24,
        }}
      >
        ← Back to blog
      </Link>

      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            background: pill.bg,
            color: pill.fg,
          }}
        >
          {pill.label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {minutes} min read · {formatDate(post.publishedAt) || 'Draft'}
        </span>
      </div>

      <h1
        style={{
          fontSize: 'clamp(28px, 3.8vw, 44px)',
          fontWeight: 600,
          lineHeight: 1.15,
          marginBottom: 16,
        }}
      >
        {post.title}
      </h1>

      <p
        style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: 32,
        }}
      >
        {post.summary}
      </p>

      {post.heroImageUrl ? (
        <div
          style={{
            marginBottom: 40,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: '#0a0e14',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          <img
            src={post.heroImageUrl}
            alt=""
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              aspectRatio: '1200 / 630',
              objectFit: 'cover',
            }}
          />
        </div>
      ) : null}

      {post.body ? (
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
          }}
        >
          <MarkdownLite source={post.body} />
        </div>
      ) : (
        <div
          style={{
            padding: 24,
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-secondary)',
          }}
        >
          <p>Full article coming soon. Maya is writing this up.</p>
        </div>
      )}

      <div
        style={{
          marginTop: 48,
          padding: '24px 24px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          background: 'var(--surface-alt)',
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            margin: 0,
            marginBottom: 6,
          }}
        >
          Want this kind of work in your business?
        </p>
        <Link
          href={cta.href}
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--accent)',
            textDecoration: 'none',
          }}
        >
          {cta.label} →
        </Link>
      </div>

      {related.length > 0 ? (
        <div style={{ marginTop: 64 }}>
          <p
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              margin: 0,
              marginBottom: 16,
            }}
          >
            Related
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.map((r) => (
              <Link
                key={r._id}
                href={`/blog/${r.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    {r.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}
                  >
                    {r.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

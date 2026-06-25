import type { Metadata } from 'next'
import Link from 'next/link'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Blog | EMVY',
  description: 'AI strategy, workflows, and honest takes from the build.',
  alternates: { canonical: 'https://emvyai.com/blog' },
  openGraph: {
    title: 'EMVY Blog — AI strategy, workflows, and honest takes from the build.',
    description:
      'AI strategy, workflows, and honest takes from the build. Real Hermes + OpenClaw content, no generic AI theory.',
    url: 'https://emvyai.com/blog',
    siteName: 'EMVY',
    type: 'website',
    images: [{ url: 'https://emvyai.com/brand/exports/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMVY Blog — AI strategy, workflows, and honest takes from the build.',
    description:
      'AI strategy, workflows, and honest takes from the build. Real Hermes + OpenClaw content, no generic AI theory.',
  },
}

type BlogPost = {
  _id: string
  title: string
  slug: string
  summary: string
  vertical: 'trades' | 'professional-services' | 'general'
  publishedAt?: number
  updatedAt?: number
  heroImageUrl?: string
  readingTimeMinutes?: number
}

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set')
  return new ConvexHttpClient(url)
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const convex = getConvex()
    const rows = await convex.query(api.blog.list, {})
    return rows as BlogPost[]
  } catch {
    return []
  }
}

function formatDate(ts?: number) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getPosts()

  const itemList: import('schema-dts').Thing = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://emvyai.com/blog/${p.slug}`,
      name: p.title,
    })),
  } as import('schema-dts').WithContext<import('schema-dts').ItemList> as unknown as import('schema-dts').Thing

  return (
    <div className="section" style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
      <JsonLd data={itemList} />

      <p className="section-kicker">Blog</p>
      <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, lineHeight: 1.1, marginBottom: 16 }}>
        AI strategy, workflows, and honest takes from the build.
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.5, marginBottom: 8 }}>
        Real Hermes and OpenClaw builds. No generic AI theory. Posts go live
        when Maya&apos;s daily bundle ships.
      </p>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', marginTop: 48 }}>Articles coming soon.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48 }}>
          {posts.map((post) => {
            const pill = VERTICAL_PILL[post.vertical] ?? VERTICAL_PILL.general
            return (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article
                  style={{
                    padding: '20px 24px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    transition: 'border-color 120ms ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 6,
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
                    {post.readingTimeMinutes ? (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {post.readingTimeMinutes} min read
                      </span>
                    ) : null}
                  </div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>
                    {post.title}
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {post.summary}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 8,
                    }}
                  >
                    {formatDate(post.publishedAt)}
                  </p>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
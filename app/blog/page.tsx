import type { Metadata } from 'next'
import Link from 'next/link'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'AI for Small Business — guides, costs, and prompt patterns | EMVY',
  description:
    'Plain-spoken guides on AI for Australian small business. Cost breakdowns, prompt patterns, and deployment lessons.',
  alternates: { canonical: 'https://emvyai.com/blog' },
  openGraph: {
    title: 'AI for Small Business — guides, costs, and prompt patterns | EMVY',
    description:
      'Plain-spoken guides on AI for Australian small business. Cost breakdowns, prompt patterns, and deployment lessons.',
    url: 'https://emvyai.com/blog',
    siteName: 'EMVY',
    type: 'website',
    images: [{ url: 'https://emvyai.com/brand/exports/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI for Small Business — guides, costs, and prompt patterns | EMVY',
    description:
      'Plain-spoken guides on AI for Australian small business. Cost breakdowns, prompt patterns, and deployment lessons.',
  },
}

type BlogPost = {
  _id: string
  title: string
  slug: string
  summary: string
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
    const rows = (await convex.query(api.blog.list, {})) as BlogPost[]
    return rows
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

export const revalidate = 3600

export default async function BlogPage() {
  const posts = await getPosts()

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://emvyai.com/blog/${p.slug}`,
      name: p.title,
    })),
  }

  return (
    <>
      <section className="section" style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 32px' }}>
        <JsonLd data={itemList as unknown as Parameters<typeof JsonLd>[0]['data']} />

        <p className="section-kicker">AI for small business</p>
        <h1
          style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.1,
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          Plain-spoken guides on AI for Australian small business.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.55, marginBottom: 8 }}>
          Cost breakdowns, prompt patterns, and deployment lessons for owners and operators
          considering AI — not building it. Read these before you spend a dollar on a tool, an
          agency, or an intern.
        </p>
      </section>

      <section className="section" style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 64px' }}>
        {posts.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', marginTop: 32 }}>
            No guides published yet. Take the free Mini AI Strategy to get notified when new
            guides go live.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <article
                  className="blog-card"
                  style={{
                    padding: 0,
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'var(--surface)',
                    transition: 'border-color 160ms ease, transform 160ms ease',
                  }}
                >
                  {post.heroImageUrl ? (
                    <div
                      style={{
                        background: '#0a0e14',
                        borderBottom: '1px solid var(--border)',
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
                  <div style={{ padding: '20px 24px 22px' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        marginBottom: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      {post.readingTimeMinutes ? (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {post.readingTimeMinutes} min read
                        </span>
                      ) : null}
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          marginLeft: 'auto',
                        }}
                      >
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        margin: '0 0 8px',
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {post.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {post.summary}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        className="section"
        style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}
      >
        <p className="section-kicker">Need help applying this?</p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: '4px 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          Bring one of these guides to your business.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, margin: '0 0 20px' }}>
          One hour with us. We map the three AI moves that would actually save you time or money,
          send you the writeup, and you keep it whether we work together or not.
        </p>
        <div className="hero-actions">
          <Link href="/services/ai-strategy-call" className="button primary">
            Book a $500 Strategy Call →
          </Link>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, alignSelf: 'center' }}>
            Or start with the free Mini AI Strategy — 5 questions, instant read.
          </span>
        </div>
      </section>
    </>
  )
}
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog | EMVY',
  description: 'AI strategy, workflows, and honest takes from the build.',
}

type Post = {
  slug: string
  title: string
  summary: string
  vertical: string
  publishedAt?: number
}

// Fetch posts from the API at build time
async function getPosts(): Promise<Post[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://emvyai.com'
    const res = await fetch(`${baseUrl}/api/blog`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.posts || []
  } catch {
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="section" style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
      <p className="section-kicker">Blog</p>
      <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, lineHeight: 1.1, marginBottom: 16 }}>
        AI strategy, workflows, and honest takes from the build.
      </h1>

      {posts.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', marginTop: 48 }}>Articles coming soon.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48 }}>
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article style={{ padding: '20px 24px', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                {post.vertical === 'trades' && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)' }}>Trades</span>}
                {post.vertical === 'professional-services' && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>Professional Services</span>}
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 6px' }}>{post.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{post.summary}</p>
              {post.publishedAt && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  {new Date(post.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}

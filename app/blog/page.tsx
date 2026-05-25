import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practical writing for teams that want AI to be useful, not noisy.',
}

const posts = [
  {
    slug: 'ai-agents-business',
    title: 'How AI agents actually fit into a business',
    summary: 'A practical guide to where agents help, where they do not, and how to deploy them well.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=90&auto=format&fit=crop',
  },
  {
    slug: 'ai-automation-stacks',
    title: 'What a good automation stack looks like',
    summary: 'The tools, handoffs, and controls that matter when you want automation to be reliable.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
]

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Straightforward writing for teams that want AI to be useful."
        description="These articles help clients decide where AI fits, what to avoid, and what a sensible first project looks like."
        image="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/why-ai" className="button light">
          Read Why AI
        </Link>
        <Link href="/quiz" className="button secondary">
          Start the quiz
        </Link>
      </PageHero>

      <section className="section blog-feature-section">
        <article className="blog-feature-card">
          <div className="blog-feature-image">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1600&q=90&auto=format&fit=crop"
              alt="AI strategy and workflow planning"
            />
          </div>
          <div className="blog-feature-copy">
            <p className="post-meta">Featured article</p>
            <h2 className="section-title">How AI fits into a business without creating more noise.</h2>
            <p>
              The blog is here to make the next decision easier. Each post should help a reader
              understand what matters, what doesn’t, and when it makes sense to move forward.
            </p>
            <Link href="/blog/ai-agents-business" className="button secondary" style={{ width: 'fit-content' }}>
              Read the featured piece
            </Link>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="blog-grid">
          {posts.map((post) => (
            <article key={post.slug} className="blog-card">
              <div className="blog-card-image">
                <img src={post.image} alt={post.title} />
              </div>
              <div className="blog-card-body">
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <Link href={`/blog/${post.slug}`} className="button secondary" style={{ width: 'fit-content' }}>
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section blog-cta-section">
        <div className="blog-cta-band">
          <div>
            <p className="section-kicker">Next step</p>
            <h2 className="section-title">If the writing feels relevant, start with the quiz.</h2>
          </div>
          <Link href="/quiz" className="button primary">
            Start the quiz
          </Link>
        </div>
      </section>
    </>
  )
}

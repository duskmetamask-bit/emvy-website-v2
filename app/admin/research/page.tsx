import Link from 'next/link'
import { newsletterIssues, researchPosts, researchTopics } from '@/lib/research'

export default function AdminResearchPage() {
  const draftQueue = researchPosts.filter((post) => post.draftStatus !== 'published')
  const publishedCount = researchPosts.filter((post) => post.draftStatus === 'published').length

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-copy">
          <p className="section-kicker">Admin research</p>
          <h1>Research operations console.</h1>
          <p>
            Review Hermes outputs, monitor the daily feed, and manage the weekly digest publishing
            cadence from one operational surface.
          </p>
          <div className="hero-actions">
            <Link href="/research" className="button secondary">
              View research hub
            </Link>
            <Link href="/admin/login" className="button primary">
              Admin login
            </Link>
          </div>
        </div>
      </section>

      <section className="section research-section">
        <div className="research-admin-grid">
          <article className="research-admin-card">
            <p className="section-kicker">Status</p>
            <h2>{publishedCount} published items</h2>
            <span>{draftQueue.length} items waiting for review or scheduling</span>
          </article>
          <article className="research-admin-card">
            <p className="section-kicker">Topics</p>
            <h2>{researchTopics.length} active hubs</h2>
            <span>Models, agents, tooling, enterprise AI, and regulation</span>
          </article>
          <article className="research-admin-card">
            <p className="section-kicker">Digest</p>
            <h2>{newsletterIssues.length} issue records</h2>
            <span>Weekly assembly from approved daily cards</span>
          </article>
        </div>
      </section>

      <section className="section research-section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Draft queue</p>
            <h2 className="section-title">Items that still need human approval.</h2>
          </div>
        </div>
        <div className="admin-list">
          {draftQueue.map((post) => (
            <article key={post.slug} className="admin-list__item">
              <div>
                <strong>{post.title}</strong>
                <p>{post.summary}</p>
              </div>
              <div className="admin-list__meta">
                <span>{post.draftStatus}</span>
                <span>{post.editorPriority}</span>
                <span>{post.sourceName}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

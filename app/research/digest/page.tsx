import type { Metadata } from 'next'
import ResearchDigestCard from '@/components/ResearchDigestCard'
import ResearchSubscribeForm from '@/components/ResearchSubscribeForm'
import { getLockedIssues, getPublicIssues, getPostsForIssue } from '@/lib/research'

export const metadata: Metadata = {
  title: 'Research Digest',
  description: 'The weekly EMVY AI digest: operator-focused summaries of the most important shifts in the AI space.',
  alternates: {
    canonical: 'https://emvyai.com/research/digest',
  },
}

export default function ResearchDigestPage() {
  const publicIssues = getPublicIssues()
  const lockedIssues = getLockedIssues()

  return (
    <>
      <section className="research-page-hero">
        <div className="research-page-hero__copy">
          <p className="research-kicker">Weekly digest</p>
          <h1>The weekly signal, not the daily noise.</h1>
          <p>
            Every issue distills the strongest items from the daily research feed into one clear,
            operator-focused briefing.
          </p>
        </div>
      </section>

      <section className="section research-section">
        <div className="digest-stack">
          {publicIssues.map((issue) => {
            const posts = getPostsForIssue(issue)

            return (
              <article key={issue.slug} id={issue.slug} className="digest-issue">
                <div className="digest-issue__header">
                  <div>
                    <p className="section-kicker">Issue {issue.issueNumber}</p>
                    <h2>{issue.title}</h2>
                  </div>
                  <span>{new Date(issue.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p>{issue.openingNote}</p>
                <div className="digest-issue__highlight">
                  <strong>This week in AI</strong>
                  <p>{issue.thisWeekInAI}</p>
                </div>
                <div className="digest-issue__posts">
                  {posts.map((post) => (
                    <div key={post.slug} className="digest-issue__post">
                      <h3>{post.title}</h3>
                      <p>{post.summary}</p>
                      <span>{post.operatorTakeaway}</span>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section research-section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Subscriber archive</p>
            <h2 className="section-title">Earlier issues stay behind a soft gate.</h2>
          </div>
          <p className="section-text">
            The newest issues remain public for SEO and trust; deeper archive access is used as a
            subscriber unlock.
          </p>
        </div>
        <div className="digest-grid">
          {lockedIssues.map((issue) => (
            <ResearchDigestCard key={issue.slug} issue={issue} />
          ))}
        </div>
      </section>

      <section className="section research-section">
        <ResearchSubscribeForm
          source="digest_archive"
          title="Unlock the archive."
          description="Join the list to access deeper digest history and stay current through the weekly operator briefing."
        />
      </section>
    </>
  )
}

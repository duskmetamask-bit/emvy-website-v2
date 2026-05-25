import Link from 'next/link'
import type { ResearchIssue } from '@/lib/research'

type ResearchDigestCardProps = {
  issue: ResearchIssue
}

export default function ResearchDigestCard({ issue }: ResearchDigestCardProps) {
  const locked = issue.access === 'subscriber'

  return (
    <article className={`digest-card ${locked ? 'is-locked' : 'is-open'}`}>
      <div className="digest-card__header">
        <p className="section-kicker">Issue {issue.issueNumber}</p>
        {locked ? <span className="digest-card__lock">Subscriber</span> : <span>Public</span>}
      </div>
      <h3>{issue.title}</h3>
      <p>{issue.openingNote}</p>
      <div className="digest-card__meta">
        <span>{new Date(issue.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <Link href={`/research/digest#${issue.slug}`}>Open issue</Link>
      </div>
    </article>
  )
}

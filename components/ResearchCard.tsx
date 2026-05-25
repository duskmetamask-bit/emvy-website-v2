import Link from 'next/link'
import type { ResearchPost } from '@/lib/research'

type ResearchCardProps = {
  post: ResearchPost
  variant?: 'featured' | 'topic'
}

export default function ResearchCard({ post, variant = 'featured' }: ResearchCardProps) {
  return (
    <article className={`research-card ${variant === 'featured' ? 'is-featured' : 'is-topic'}`}>
      <div className="research-card__media">
        <img src={post.heroImage} alt={post.title} />
      </div>
      <div className="research-card__body">
        <div className="research-card__meta">
          <span>{post.sourceName}</span>
          <span>{new Date(post.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        <div className="research-card__footer">
          <span>{post.topics.join(' • ')}</span>
          <Link href={`/research/posts/${post.slug}`}>Read more</Link>
        </div>
      </div>
    </article>
  )
}

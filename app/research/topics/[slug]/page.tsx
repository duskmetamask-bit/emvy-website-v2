import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ResearchCard from '@/components/ResearchCard'
import ResearchSubscribeForm from '@/components/ResearchSubscribeForm'
import { getPostsForTopic, getResearchTopic } from '@/lib/research'

type TopicPageProps = {
  params: { slug: string }
}

export function generateMetadata({ params }: TopicPageProps): Metadata {
  const topic = getResearchTopic(params.slug)

  if (!topic) {
    return {}
  }

  return {
    title: `${topic.name} Research`,
    description: topic.description,
    alternates: {
      canonical: `https://emvyai.com/research/topics/${params.slug}`,
    },
  }
}

export default function ResearchTopicPage({ params }: TopicPageProps) {
  const topic = getResearchTopic(params.slug)

  if (!topic) {
    notFound()
  }

  const posts = getPostsForTopic(params.slug)

  return (
    <>
      <section className="research-page-hero">
        <div className="research-page-hero__copy">
          <p className="research-kicker">Topic hub</p>
          <h1>{topic.name}</h1>
          <p>{topic.overview}</p>
          <div className="topic-signal-row">
            {topic.keySignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section research-section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Latest in {topic.name}</p>
            <h2 className="section-title">Daily research feed</h2>
          </div>
          <Link href="/research/overview" className="button secondary">
            Back to overview
          </Link>
        </div>
        <div className="research-card-grid">
          {posts.map((post) => (
            <ResearchCard key={post.slug} post={post} variant="topic" />
          ))}
        </div>
      </section>

      <section className="section research-section">
        <ResearchSubscribeForm
          source="overview_cta"
          title={`Get the ${topic.name.toLowerCase()} signals weekly.`}
          description="Subscribe for a concise digest of the most important developments across the AI market and their business implications."
        />
      </section>
    </>
  )
}

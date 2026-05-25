import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import ResearchSubscribeForm from '@/components/ResearchSubscribeForm'
import { getResearchPost, getResearchTopic } from '@/lib/research'

type ResearchPostPageProps = {
  params: { slug: string }
}

export function generateMetadata({ params }: ResearchPostPageProps): Metadata {
  const post = getResearchPost(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `https://emvyai.com/research/posts/${params.slug}`,
    },
  }
}

export default function ResearchPostPage({ params }: ResearchPostPageProps) {
  const post = getResearchPost(params.slug)

  if (!post || post.draftStatus !== 'published') {
    notFound()
  }

  const topic = getResearchTopic(post.topics[0])

  return (
    <>
      <section className="research-post-hero">
        <div className="research-post-hero__media">
          <img src={post.heroImage} alt={post.title} />
        </div>
        <div className="research-post-hero__overlay" aria-hidden="true" />
        <div className="research-post-hero__content">
          <div className="research-post-hero__meta">
            <span className={`research-tag accent-${topic?.accent ?? 'cyan'}`}>{topic?.name ?? 'Research'}</span>
            <span>{post.sourceName}</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.deck}</p>
        </div>
      </section>

      <section className="section research-post-layout">
        <article className="research-article">
          <div className="research-article__intro">
            <p>{post.summary}</p>
          </div>

          <div className="research-article__signal-block">
            <h2>Why this matters</h2>
            <p>{post.whyItMatters}</p>
          </div>

          {post.sections.map((section) => (
            <section key={section.heading} className="research-article__section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="research-article__signal-block">
            <h2>Operator takeaway</h2>
            <p>{post.operatorTakeaway}</p>
          </div>

          <div className="research-article__source">
            <Link href={post.sourceUrl} target="_blank" rel="noreferrer">
              View primary source <ExternalLink size={14} />
            </Link>
          </div>
        </article>

        <aside className="research-rail">
          <div className="research-rail__card">
            <p className="research-rail__label">Watch next</p>
            <ul>
              {post.watchNext.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <ResearchSubscribeForm
            source="article_inline"
            compact
            title="Stay ahead of the next shift."
            description="Get the weekly digest built from Hermes-assisted daily research runs."
          />
          <div className="research-rail__card">
            <p className="research-rail__label">Need implementation support?</p>
            <Link href="/services/ai-agents" className="button secondary">
              Explore AI assessment
            </Link>
          </div>
        </aside>
      </section>
    </>
  )
}

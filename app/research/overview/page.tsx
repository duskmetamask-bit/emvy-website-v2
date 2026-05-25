import type { Metadata } from 'next'
import Link from 'next/link'
import ResearchSubscribeForm from '@/components/ResearchSubscribeForm'
import { researchTopics } from '@/lib/research'

export const metadata: Metadata = {
  title: 'Research Overview',
  description: 'A structured overview of the AI space across models, agents, tooling, enterprise adoption, and regulation.',
  alternates: {
    canonical: 'https://emvyai.com/research/overview',
  },
}

export default function ResearchOverviewPage() {
  return (
    <>
      <section className="research-page-hero">
        <div className="research-page-hero__copy">
          <p className="research-kicker">AI Space Overview</p>
          <h1>The AI market makes more sense when you read it as a system.</h1>
          <p>
            This overview is designed to reduce fragmentation. Instead of isolated headlines, it
            groups the AI landscape into the operating layers that actually matter for strategy,
            adoption, and delivery.
          </p>
        </div>
      </section>

      <section className="section research-section">
        <div className="overview-grid">
          {researchTopics.map((topic) => (
            <article key={topic.slug} className={`overview-card accent-${topic.accent}`}>
              <div className="overview-card__topline">
                <span className="research-tag accent-neutral">{topic.name}</span>
                <Link href={`/research/topics/${topic.slug}`}>Open topic</Link>
              </div>
              <h2>{topic.description}</h2>
              <p>{topic.overview}</p>
              <ul>
                {topic.keySignals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section research-section">
        <ResearchSubscribeForm
          source="overview_cta"
          title="Get the weekly market map."
          description="A weekly briefing that turns the daily feed into one concise view of what shifted across the AI landscape."
        />
      </section>
    </>
  )
}

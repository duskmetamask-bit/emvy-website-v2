import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bot, BriefcaseBusiness, Globe2, Layers3, ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import ResearchCard from '@/components/ResearchCard'
import ResearchSubscribeForm from '@/components/ResearchSubscribeForm'
import { getFeaturedResearch, researchTopics } from '@/lib/research'

export const metadata: Metadata = {
  title: 'Research',
  description:
    'A cleaner EMVY research hub covering the AI landscape through operator-ready analysis and featured briefings.',
  alternates: {
    canonical: 'https://emvyai.com/research',
  },
}

const iconMap = {
  models: Layers3,
  agents: Bot,
  tooling: Wrench,
  'enterprise-ai': BriefcaseBusiness,
  regulation: ShieldCheck,
}

export default function ResearchPage() {
  const featured = getFeaturedResearch()

  return (
    <>
      <section className="research-hero">
        <div className="research-hero__grid">
          <div className="research-hero__copy">
            <p className="research-kicker">EMVY Research</p>
            <h1>Understand the AI space without drowning in noise.</h1>
            <p>
              A cleaner intelligence layer for founders, operators, and teams trying to keep up
              with AI without reading a wall of noise every day.
            </p>
            <div className="research-hero__actions">
              <Link href="/research/overview" className="button primary">
                Explore the AI landscape <ArrowRight size={18} />
              </Link>
              <Link href="/services/ai-agents" className="button secondary">
                Turn signal into implementation
              </Link>
            </div>
          </div>

          <div className="research-hero__panel">
            <div className="research-panel">
              <div className="research-panel__heading">
                <Globe2 size={18} />
                <span>State of AI right now</span>
              </div>
              <ul>
                <li>Model choice matters less than workflow fit and reliability.</li>
                <li>Agent products are being judged on supervision and control, not hype.</li>
                <li>AI ops and observability are becoming part of the expected stack.</li>
                <li>Governance is now a commercial requirement for serious rollouts.</li>
              </ul>
            </div>
            <ResearchSubscribeForm source="research_hero" compact />
          </div>
        </div>
      </section>

      <section className="section research-section">
        <div className="section-header">
          <p className="section-kicker">Landscape map</p>
          <h2 className="section-title">Five lenses for reading the market clearly.</h2>
          <p className="section-text">
            Use these topic areas to move through the market in a cleaner way instead of reading
            disconnected updates.
          </p>
        </div>
        <div className="research-topic-grid">
          {researchTopics.map((topic) => {
            const Icon = iconMap[topic.slug as keyof typeof iconMap] ?? Sparkles
            return (
              <Link key={topic.slug} href={`/research/topics/${topic.slug}`} className={`topic-card accent-${topic.accent}`}>
                <div className="topic-card__icon">
                  <Icon size={20} />
                </div>
                <h3>{topic.name}</h3>
                <p>{topic.description}</p>
                <span>{topic.keySignals.join(' • ')}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section research-section">
        <div className="section-header">
          <p className="section-kicker">Featured briefings</p>
          <h2 className="section-title">A tighter set of high-signal briefings.</h2>
          <p className="section-text">
            The strongest recent updates, shortened and cleaned up so they are easier to scan.
          </p>
          <Link href="/research/digest" className="button secondary">
            View digest archive
          </Link>
        </div>
        <div className="research-card-grid featured">
          {featured.map((post) => (
            <ResearchCard key={post.slug} post={post} variant="featured" />
          ))}
        </div>
      </section>

      <section className="section research-cta-band">
        <div className="research-cta-band__copy">
          <p className="section-kicker">From research to rollout</p>
          <h2 className="section-title">Need help implementing what the signal points toward?</h2>
          <p className="section-text">
            EMVY uses the same research layer to guide AI assessments, implementation priorities,
            and operational rollout planning.
          </p>
        </div>
        <div className="research-cta-band__actions">
          <Link href="/services/ai-agents" className="button primary">
            Start with an AI assessment
          </Link>
          <Link href="/services/automations" className="button secondary">
            See AI builds
          </Link>
        </div>
      </section>
    </>
  )
}

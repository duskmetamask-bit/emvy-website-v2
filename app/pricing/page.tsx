import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Pricing follows the service stage: discovery, assessment, builds, or maintenance.',
}

const pricingCards = [
  {
    title: 'Discovery Call',
    body: 'Best for businesses that need a fast, qualified conversation to confirm fit and identify the right next step.',
  },
  {
    title: 'AI Assessment',
    body: 'Best for teams that need workflow analysis, technical readiness review, and a practical implementation plan.',
  },
  {
    title: 'AI Builds and Maintenance',
    body: 'Best for scoped delivery work, operational rollout, and ongoing support after launch.',
  },
]

const pricingFactors = [
  'How many workflows are involved',
  'How complex the integrations and data sources are',
  'Whether governance, approvals, or QA layers are required',
  'Whether the work is a one-off build or ongoing support',
]

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Pricing is scoped to the stage, the workflow, and the level of support required."
        description="The investment depends on whether the business needs discovery, assessment, implementation, or ongoing maintenance."
        image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services" className="button light">
          Review services
        </Link>
        <Link href="/services/discovery-call" className="button secondary">
          Book Free Discovery Call
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">How pricing works</p>
            <h2 className="section-title">Each engagement is matched to the work being done.</h2>
          </div>
          <p className="section-text">
            EMVY does not treat every client problem as the same shape. Pricing follows the scope,
            risk, and delivery load needed to create a dependable result.
          </p>
        </div>

        <div className="about-values">
          {pricingCards.map((card) => (
            <article key={card.title} className="proof-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">What affects cost</p>
            <h2 className="section-title">Scope is shaped by the workflow, not by hype.</h2>
          </div>
          <p className="section-text">
            The main cost drivers are usually operational complexity, integration work, governance
            needs, and how much ongoing support the system will require.
          </p>
        </div>

        <div className="lead-grid">
          {pricingFactors.map((factor) => (
            <article key={factor} className="proof-card">
              <h3>{factor}</h3>
              <p>Pricing is aligned to real delivery effort and business risk.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Engagement standard</p>
            <h2 className="section-title">After the discovery call, the next step is always clear.</h2>
          </div>
          <p className="section-text">
            We follow a simple flow: recommendation email, payment link or invoice, audit or build
            call, documented output, review call, implementation, and maintenance if required.
          </p>
        </div>

        <div className="hero-actions">
          <Link href="/process" className="button secondary">
            See the full flow
          </Link>
          <Link href="/services/discovery-call" className="button light">
            Book discovery call
          </Link>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Builds — AI systems that run your business.',
  description:
    'Build the AI systems that run your business. Voice AI, chat, workflow automation, data, and integrations — scoped from your strategy session.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const buildCategories = [
  {
    title: 'Voice AI',
    body: 'Phone agents, reception, outbound calling, and voice assistants that handle conversations at any scale.',
  },
  {
    title: 'Chat & messaging',
    body: 'Chatbots, SMS, inbox automation, and conversational interfaces that keep your business responsive.',
  },
  {
    title: 'Workflow automation',
    body: 'Multi-step processes, triggers, routing, and approvals — from simple sequences to complex operations.',
  },
  {
    title: 'Data & analytics',
    body: 'Dashboards, reporting, data pipelines, and insights that turn your business data into decisions.',
  },
  {
    title: 'Integrations',
    body: 'Connect your tools — CRM, inbox, calendar, forms, accounting, and anything else in your stack.',
  },
]

const outcomes = [
  {
    title: 'The system, in production, connected to your stack',
  },
  {
    title: 'The knowledge transfer — runbook, training, and full ownership',
  },
  {
    title: 'A safety net — 30 days of post-launch support',
  },
]

const faqs = [
  {
    q: 'What is an AI operating system?',
    a: 'The integrated layer of voice, chat, workflows, and integrations that runs your day-to-day. Not one tool — the layer that connects them.',
  },
  {
    q: 'Who owns it?',
    a: 'You do. Everything. Source, accounts, runbook, training — yours on day one.',
  },
  {
    q: 'Do you push a specific platform?',
    a: 'No. The recommendation follows the problem.',
  },
  {
    q: 'Is the strategy call fee credited?',
    a: 'Yes. If the strategy call was completed within 60 days, the fee is credited in full toward the build.',
  },
  {
    q: 'What if I only need one small system?',
    a: 'That is fine. We scope the build to what you actually need — no upsell, no minimum.',
  },
]

export default function AIBuildsPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-builds'])} />
      <PageHero
        eyebrow="AI Builds"
        title="AI systems that run your business. Built, shipped, handed over."
        image="https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href={CAL_BOOKING_URL}
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a call
          <FileText size={16} style={{ marginLeft: 6, verticalAlign: '-2px' }} />
        </a>
        <Link href="/services/ai-strategy-call" className="button secondary">
          Start with a strategy session
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What we build</p>
          <h2 className="section-title">Voice AI, chat, automation, data, integrations — whatever your strategy calls for.</h2>
          <p className="section-text">
            Scoped from your strategy session. One capability or several — the build fits the need.
          </p>
        </div>
        <div className="lead-grid">
          {buildCategories.map((cat) => (
            <article key={cat.title} className="proof-card">
              <h3>{cat.title}</h3>
              <p>{cat.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you walk away with</p>
          <h2 className="section-title">Three outcomes, all yours on day one.</h2>
        </div>
        <div className="lead-grid">
          {outcomes.map((o, i) => (
            <article key={i} className="proof-card">
              <p className="service-flow-number">{String(i + 1).padStart(2, '0')}</p>
              <h3>{o.title}</h3>
            </article>
          ))}
        </div>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
          <Link href="/services/ai-strategy-call" className="button secondary">
            Not scoped yet? Start with the $500 strategy session
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">The honest answers.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready to build</p>
          <h2 className="section-title">Book a call to get started.</h2>
          <p className="section-text">
            We will confirm the scope, timeline, and price — no surprises.
          </p>
        </div>
        <div className="hero-actions">
          <a
            className="button primary"
            href={CAL_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Book a call
          </a>
          <Link href="/services" className="button secondary">
            See full service flow
          </Link>
        </div>
      </section>
    </>
  )
}
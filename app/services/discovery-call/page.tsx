import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'Free Discovery Call',
  description: 'A free 15-minute call to see where AI fits your business.',
}

const phases = [
  {
    number: '01',
    title: 'Context',
    points: [
      'We learn about your business and what you do day-to-day',
      'We explain what EMVY actually does (and will not do)',
      'We set the agenda for the rest of the call',
    ],
  },
  {
    number: '02',
    title: 'Deep dive',
    points: [
      'The specific workflow or process you want to improve',
      'The bottlenecks, delays, or manual tasks eating your time',
      'What you have already tried and what did (or did not) work',
    ],
  },
  {
    number: '03',
    title: 'Direction',
    points: [
      'Our honest take on whether AI is worth pursuing here',
      'If yes, what the AI Strategy Call covers and why it is the next step',
      'What happens after the call — a clear email with next steps and pricing',
    ],
  },
]

const faqs = [
  {
    q: 'Is this a sales pitch?',
    a: 'No. The call is a short conversation to understand your business and whether EMVY is the right fit. If it is not, we say so directly.',
  },
  {
    q: 'Do I need to prepare anything?',
    a: 'No. Just show up and describe how your business runs. The conversation guides itself.',
  },
  {
    q: 'What happens after the call?',
    a: 'You get a short email with the recommended next step, a scope summary if relevant, and a link to book or pay if you want to proceed.',
  },
  {
    q: 'What if I am not ready for a call?',
    a: 'Start with the free Mini AI Strategy Assessment — 5 minutes, no call needed, and you get a personalised report by email.',
  },
]

export default function DiscoveryCallPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['discovery-call'])} />
      <PageHero
        eyebrow="Free Discovery Call"
        title="A free 15-minute call to see where AI fits your business."
        description="Short, focused, and easy to act on. Walk away with a clear next step."
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href="https://cal.com/jake-emvy/discovery-call"
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a discovery call
        </a>
        <Link href="/services" className="button secondary">
          See full service flow
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What the call covers</p>
          <h2 className="section-title">Three short segments.</h2>
          <p className="section-text">
            A quick consult to understand your business, identify what we can do for you, and lay
            out the options — including the AI Strategy Call if it is the right next step.
          </p>
        </div>

        <div className="lead-grid discovery-outcomes">
          {phases.map((phase) => (
            <article key={phase.number} className="proof-card discovery-card">
              <div className="discovery-phase">
                <span className="discovery-phase__number">{phase.number}</span>
              </div>
              <h3>{phase.title}</h3>
              <ul className="discovery-list">
                {phase.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">What to expect before you book.</h2>
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
          <p className="section-kicker">Ready to talk</p>
          <h2 className="section-title">Book your free 15-minute discovery call.</h2>
          <p className="section-text">
            Pick a slot that works for you — no preparation needed.
          </p>
        </div>
        <div className="hero-actions">
          <a
            className="button primary"
            href="https://cal.com/jake-emvy/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a discovery call
          </a>
          <Link href="/assessment" className="button secondary">
            Not ready? Try the free assessment
          </Link>
        </div>
      </section>
    </>
  )
}
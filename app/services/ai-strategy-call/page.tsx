import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, CreditCard } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Strategy Call — $500 AUD',
  description:
    'A paid 60-minute AI strategy session with EMVY — scope, sequencing, and an implementation plan for an AI build.',
}

// The board owns the paid booking funnel end-to-end — it has the slot
// picker, Stripe Checkout, webhook, and Cal.com createBooking all on its
// own domain. The website landing just deep-links into it.
const BOARD_BOOKING_URL = 'https://board.emvyai.com/book/ai-strategy'

const outcomes = [
  {
    title: 'Scope',
    points: [
      'What we are actually building (and what we are explicitly not)',
      'The one workflow where this AI lands first',
      'Risks, dependencies, and what to leave for a later phase',
    ],
  },
  {
    title: 'Sequencing',
    points: [
      'A staged plan: discovery → build → ship → maintain',
      'Estimated time-to-first-working-system',
      'Where you can keep moving while we build',
    ],
  },
  {
    title: 'Approach',
    points: [
      'The specific stack we would use (models, infra, integrations)',
      'What success looks like in week 1, week 4, week 12',
      'Cost ranges so the next decision is a business decision, not a guess',
    ],
  },
]

const facts = [
  { icon: Clock, label: '60 minutes', detail: 'One focused session, not an open-ended intro call' },
  { icon: CreditCard, label: '$500 AUD', detail: 'Paid via Stripe at booking — refundable up to 24h before' },
  { icon: CheckCircle2, label: 'Written follow-up', detail: 'A short written summary of scope, sequence, and next steps' },
]

export default function AIStrategyCallPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-strategy-call'])} />
      <PageHero
        eyebrow="AI Strategy Call · $500 AUD"
        title="A 60-minute AI strategy session for a real build."
        description="For when you already know AI is on the table and you want a concrete scope, sequence, and approach — not another intro call. Pick a time and pay below."
        image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1800&q=90&auto=format&fit=crop"
      >
        <a href={BOARD_BOOKING_URL} className="button primary">
          Pick a time — $500
        </a>
        <Link href="/services" className="button secondary">
          See service flow
        </Link>
      </PageHero>

      <section className="section" id="book">
        <div className="section-header">
          <p className="section-kicker">Book</p>
          <h2 className="section-title">Pick a 60-minute slot. Payment is collected at booking.</h2>
          <p className="section-text">
            You'll choose your time on the board — Stripe collects the $500 AUD
            before the slot is locked in on Cal.com. Refundable up to 24 hours
            before the call.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <a href={BOARD_BOOKING_URL} className="button primary">
            Open the booking page →
          </a>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">At a glance</p>
          <h2 className="section-title">What you get for the $500.</h2>
        </div>
        <div className="lead-grid discovery-outcomes">
          {facts.map((fact) => {
            const Icon = fact.icon
            return (
              <article key={fact.label} className="proof-card discovery-card">
                <div className="discovery-icon">
                  <Icon size={24} />
                </div>
                <h3>{fact.label}</h3>
                <p style={{ color: 'var(--muted-foreground, #94a3b8)', marginTop: '0.5rem' }}>{fact.detail}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What To Expect</p>
          <h2 className="section-title">Scope, sequence, and approach.</h2>
          <p className="section-text">
            The session is structured so you walk away with decisions you can act on — not a
            transcript you have to parse later.
          </p>
        </div>

        <div className="lead-grid discovery-outcomes">
          {outcomes.map((item) => (
            <article key={item.title} className="proof-card discovery-card">
              <div className="discovery-icon">
                <CheckCircle2 size={24} />
              </div>
              <h3>{item.title}</h3>
              <ul className="discovery-list">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready To Book</p>
          <h2 className="section-title">Lock in your 60-minute AI strategy session.</h2>
          <p className="section-text">
            Scroll back up and pick a time. Payment is collected by Stripe when you confirm.
          </p>
        </div>
        <a href="#book" className="button primary">
          Pick a time
        </a>
      </section>
    </>
  )
}

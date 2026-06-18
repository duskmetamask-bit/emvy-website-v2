import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import CalInlineEmbed from '../../../components/CalInlineEmbed'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Strategy Call — $500 AUD',
  description:
    'A paid 60-minute AI strategy session with EMVY — scope, sequencing, and an implementation plan for an AI build.',
}

// Cal.com owns the booking + Stripe payment flow end-to-end via its
// inline embed + Stripe App integration. The board receives the
// BOOKING_CREATED webhook for the operator's view; the customer never
// leaves the website.
const CAL_ACCOUNT = 'jake-emvy'
const CAL_EVENT_SLUG = 'ai-strategy'

const deliverables = [
  {
    number: '01',
    title: 'AI Assessment',
    detail: 'A mapped view of your workflows with findings and recommendations specific to your business.',
  },
  {
    number: '02',
    title: 'Findings & Recommendations',
    detail: 'Where AI will actually pay off for you — and where it won’t.',
  },
  {
    number: '03',
    title: 'Pathway & Implementation',
    detail: 'A staged 0–30 / 30–90 / 90–180 day plan with the future state mapped out.',
  },
]

export default function AIStrategyCallPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-strategy-call'])} />
      <PageHero
        eyebrow="AI Strategy Call · $500 AUD"
        title="A 60-minute AI strategy session for a real build."
        description="For when you already know AI is on the table and you want a concrete scope, sequence, and approach — not another intro call. Pick a time below."
        image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1800&q=90&auto=format&fit=crop"
      >
        <a href="#book" className="button primary">
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
            Stripe collects the $500 AUD when you confirm the booking.
          </p>
        </div>
        <CalInlineEmbed
          eventSlug={CAL_EVENT_SLUG}
          accountSlug={CAL_ACCOUNT}
          paid
          minHeight={760}
        />
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you get for the $500</p>
          <h2 className="section-title">Three deliverables, one session.</h2>
        </div>
        <div className="lead-grid discovery-outcomes">
          {deliverables.map((item) => (
            <article key={item.number} className="proof-card discovery-card">
              <div className="discovery-phase">
                <span className="discovery-phase__number">{item.number}</span>
              </div>
              <h3>{item.title}</h3>
              <p style={{ color: 'var(--muted-foreground, #94a3b8)', marginTop: '0.5rem' }}>{item.detail}</p>
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

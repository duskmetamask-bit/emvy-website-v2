import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'Free Discovery Call',
  description: 'Book a free 15-minute discovery call with EMVY.',
}

const phases = [
  {
    number: '01',
    title: 'Introductions',
    duration: '~3 min',
    points: [
      'Quick round of who you are and who we are',
      'What EMVY actually does (and what we don’t)',
      'Why a short call beats a long proposal',
    ],
  },
  {
    number: '02',
    title: 'Your business',
    duration: '~7 min',
    points: [
      'What your business does day-to-day',
      'The workflow or bottleneck you’d most like to improve',
      'Any pain points eating into your week',
    ],
  },
  {
    number: '03',
    title: 'Next step',
    duration: '~5 min',
    points: [
      'We share the direction we think fits best',
      'No pressure — the decision to proceed is yours',
      'A follow-up email with next steps and pricing',
    ],
  },
]

export default function DiscoveryCallPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['discovery-call'])} />
      <PageHero
        eyebrow="Free Discovery Call"
        title="A free 15-minute call to explore where AI could help your business."
        description="This is a short introduction call to understand your business, what you want to improve, and what the best next step looks like. Pick a time below."
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
          See service flow
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What To Expect</p>
          <h2 className="section-title">Short, focused, and easy to act on.</h2>
          <p className="section-text">
            The call is designed to quickly understand your business and whether we are the right
            fit for the opportunity you are exploring.
          </p>
        </div>

        <div className="lead-grid discovery-outcomes">
          {phases.map((phase) => (
            <article key={phase.number} className="proof-card discovery-card">
              <div className="discovery-phase">
                <span className="discovery-phase__number">{phase.number}</span>
                <span className="discovery-phase__duration">{phase.duration}</span>
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

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready To Book</p>
          <h2 className="section-title">Lock in your free 15-minute discovery call.</h2>
          <p className="section-text">
            Pick a 15-minute slot that works for you.
          </p>
        </div>
        <a
          className="button primary"
          href="https://cal.com/jake-emvy/discovery-call"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a discovery call
        </a>
      </section>
    </>
  )
}

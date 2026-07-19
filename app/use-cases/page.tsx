import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'Examples of practical AI systems for growing businesses.',
}

const studies = [
  {
    title: 'Lead response system',
    metric: 'Lead handling',
    body: 'Connect intake, routing, booking, and follow-up around the way your team works.',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Internal workflow automation',
    metric: 'Workflow automation',
    body: 'Support handovers, reporting, approvals, and routine work with better-connected steps.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Custom AI systems',
    metric: 'A focused operating layer',
    body: 'Build a practical system around a specific service, team, or operational workflow.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'AI receptionists',
    metric: 'A clearer front door',
    body: 'Help handle calls, messages, bookings, and common enquiries in a way that fits the business.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Integrations',
    metric: 'Connected information',
    body: 'Bring the right tools and information together around everyday work.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Ongoing improvement',
    metric: 'Useful over time',
    body: 'Review and refine a live system as the business changes.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90&auto=format&fit=crop',
  },
]

export default function UseCasesPage() {
  return (
    <>
      <PageHero
        eyebrow="Use Cases"
        title="Examples of practical AI systems for everyday work."
        description="These are capability examples, not fixed products. The right system depends on the business and its workflow."
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1800&q=90&auto=format&fit=crop"
      >
        <a href="https://cal.com/jake-emvy/discovery-call" className="button light" target="_blank" rel="noopener noreferrer">Book a 20-minute AI Consult</a>
        <Link href="/services" className="button secondary">View services</Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Use Cases</p>
          <h2 className="section-title">Capability examples, shaped around the work.</h2>
          <p className="section-text">
            Each system is tailored to the people, tools, and workflow already in place.
          </p>
        </div>

        <div className="case-grid">
          {studies.map((study) => (
            <article key={study.title} className="case-card">
              <div className="case-image">
                <img src={study.image} alt={study.title} />
              </div>
              <div className="case-body">
                <p>{study.metric}</p>
                <h3>{study.title}</h3>
                <span>{study.body}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Get Started</p>
          <h2 className="section-title">Talk through the work you want to improve.</h2>
          <p className="section-text">
            Start with a free 20-minute AI Consult, then decide what makes sense.
          </p>
        </div>
        <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a 20-minute AI Consult</a>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import PageHero from '../../../components/PageHero'

export const metadata: Metadata = {
  title: 'Systems Maintenance',
  description: 'Ongoing maintenance and support for AI systems after launch.',
}

const maintenancePoints = [
  'Ongoing improvements and support',
  'Monitoring, issue handling, and performance review',
  'Refinement as systems and workflows evolve',
  'A stable operating layer after launch',
]

const maintenanceReasons = [
  {
    title: 'Workflows change over time',
    body: 'The business evolves, tools change, and new edge cases appear. Ongoing support keeps the system aligned with that reality.',
  },
  {
    title: 'Systems need ownership',
    body: 'Someone should be responsible for reviewing performance, handling issues, and recommending improvements when needed.',
  },
  {
    title: 'Support is optional',
    body: 'If you only want the system built and handed over, that is fine. Maintenance is there for teams that want continued support.',
  },
]

export default function SystemsMaintenancePage() {
  return (
    <>
      <PageHero
        eyebrow="Maintenance"
        title="Keep the system useful, stable, and aligned after launch."
        description="An add on service to custom builds. Keeping the system stable and improving features over time"
        image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/discovery-call" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/services" className="button secondary">
          See service flow
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Why Maintenance Matters</p>
          <h2 className="section-title">Useful systems need care after they go live.</h2>
          <p className="section-text">
            Maintenance helps the system stay reliable as your workflow changes, your team grows,
            and the operating environment becomes more complex.
          </p>
        </div>

        <div className="four-card-grid">
          {maintenancePoints.map((point) => (
            <article key={point} className="proof-card detail-card">
              <CheckCircle2 size={18} />
              <h3>{point}</h3>
              <ul className="detail-list">
                <li>keeps the live workflow stable</li>
                <li>gives your team a clear support path</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Outcome</p>
          <h2 className="section-title">Support when you want it, handover when you do not.</h2>
          <p className="section-text">
            Maintenance is part of the service flow, but it is not mandatory. The level of
            involvement can match what your business actually needs.
          </p>
        </div>

        <div className="about-values">
          {maintenanceReasons.map((item) => (
            <article key={item.title} className="proof-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Existing System Review</p>
          <h2 className="section-title">Have an existing system that needs reviewing or maintaining?</h2>
          <p className="section-text">
            Share a few details about your current setup and what needs attention.
          </p>
        </div>
        <Link href="/contact" className="button primary">
          Contact Us
        </Link>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore the EMVY service flow: Discovery, AI Strategy, Build, and Systems Maintenance.',
}

const services = [
  {
    number: '01',
    href: '/services/discovery-call',
    title: 'Discovery',
    summary:
      'A free 15-minute call to understand your business, the workflow you want to improve, and the right next step.',
  },
  {
    number: '02',
    href: '/services/ai-strategy-call',
    title: 'AI Strategy',
    summary:
      'A $500, 60-minute structured AI readiness assessment — surfaces the highest-ROI opportunities and lays out a 0–30 / 30–90 / 90–180 day plan.',
  },
  {
    number: '03',
    href: '/services/ai-builds',
    title: 'Build',
    summary:
      'Scoped implementation of the AI systems, automations, and workflow improvements from your strategy — $3K to $5K depending on scope.',
  },
  {
    number: '04',
    href: '/services/systems-maintenance',
    title: 'Maintenance',
    summary:
      '$500/month retainer for ongoing optimisation, monitoring, and roadmap updates after launch.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="A clear path from AI opportunity to working system."
        description="We help Australian SMBs figure out where AI pays off — then build only what's worth building. Platform-agnostic, honest pricing, real outcomes."
        image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/discovery-call" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/contact" className="button secondary">
          Contact us
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Service Flow</p>
          <h2 className="section-title">Start at the stage that matches your business.</h2>
          <p className="section-text">
            Some clients only need the audit. Some want the build completed and handed over. Others
            want EMVY to stay involved after launch.
          </p>
        </div>

        <div className="service-flow-grid service-flow-grid-compact">
          {services.map((service) => (
            <article key={service.href} className="service-flow-card">
              <p className="service-flow-number">{service.number}</p>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <Link href={service.href} className="button secondary" style={{ width: 'fit-content' }}>
                See more
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">What happens next</p>
            <h2 className="section-title">Discovery is only the first step in the engagement.</h2>
          </div>
          <p className="section-text">
            After the discovery call, EMVY sends a simple decision email with the recommended path,
            scope summary, and payment link or invoice. From there the client either enters the
            audit flow or the build flow.
          </p>
        </div>

        <div className="hero-actions">
          <Link href="/process" className="button secondary">
            View full process
          </Link>
          <Link href="/services/discovery-call" className="button light">
            Book discovery call
          </Link>
        </div>
      </section>
    </>
  )
}

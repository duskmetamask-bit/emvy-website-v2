import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'The full EMVY service flow — free assessment, discovery call, AI strategy session, custom builds, and ongoing maintenance for Australian small businesses.',
}

const services = [
  {
    number: '00',
    href: '/assessment',
    title: 'Mini AI Strategy Assessment',
    summary:
      'A free 5-minute self-assessment that analyses key areas of your business and emails you a personalised strategy report — no call needed.',
  },
  {
    number: '01',
    href: '/services/discovery-call',
    title: 'Discovery Call',
    summary:
      'A free 15-minute call to understand your business, the workflow you want to improve, and the right next step.',
  },
  {
    number: '02',
    href: '/services/ai-strategy-call',
    title: 'AI Strategy',
    summary:
      'A 60-minute structured session that maps your operations across four workflow boxes. You get an 8-section written report with dollar-first findings.',
  },
  {
    number: '03',
    href: '/services/ai-builds',
    title: 'AI Builds',
    summary:
      'Scoped implementation — from a single system to a full AI operating layer. Shipped in weeks, owned by you on day one.',
  },
  {
    number: '04',
    href: '/services/systems-maintenance',
    title: 'Maintenance',
    summary:
      'Ongoing monitoring, monthly reviews, quarterly evolution, and support after launch. Cancel any month.',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* Custom hero: constellation SVG right, text left */}
      <section className="services-hero">
        <div className="services-hero__media" aria-hidden="true">
          <Image
            src="/brand/services/services-constellation.svg"
            alt=""
            width={800}
            height={640}
            priority
          />
        </div>
        <div className="services-hero__copy">
          <p className="section-kicker">Services</p>
          <h1>
            <span className="services-hero__accent" aria-hidden="true" />
            A clear path from AI opportunity to working system.
          </h1>
          <p>
            Start with a free 5-minute assessment, a 15-minute call, or go straight to a structured
            strategy session. Platform-agnostic, honest pricing, real outcomes.
          </p>
          <div className="services-hero__actions">
            <Link href="/assessment" className="button light">
              Start Free Assessment
            </Link>
            <Link href="/services/discovery-call" className="button secondary">
              Book Free Discovery Call
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Service Flow</p>
          <h2 className="section-title">Start at the stage that matches where your business is today.</h2>
          <p className="section-text">
            Not sure yet? Start with the free assessment. Know what you need? Book a call or a
            strategy session directly. Each stage leads into the next — or stand alone if that's
            all you need.
          </p>
        </div>

        <div className="services-icon-row" aria-hidden="true">
          <Image
            src="/brand/services/service-icons.svg"
            alt=""
            width={1200}
            height={140}
          />
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
        <div className="section-header">
          <p className="section-kicker">What happens next</p>
          <h2 className="section-title">The first conversation is only the start of the engagement.</h2>
          <p className="section-text">
            After the discovery call, you get a simple decision email with the recommended path,
            scope summary, and payment link. From there it is either the audit flow or straight
            into the build — and maintenance after launch if you want ongoing support.
          </p>
        </div>

        <div className="services-pathway" aria-hidden="true">
          <Image
            src="/brand/services/services-pathway.svg"
            alt=""
            width={1200}
            height={320}
          />
        </div>

        <div className="hero-actions">
          <Link href="/assessment" className="button light">
            Start Free Assessment
          </Link>
          <Link href="/process" className="button secondary">
            View full process
          </Link>
          <Link href="/services/discovery-call" className="button secondary">
            Book discovery call
          </Link>
        </div>
      </section>
    </>
  )
}

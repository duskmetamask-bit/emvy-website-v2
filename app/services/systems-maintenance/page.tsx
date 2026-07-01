import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI OS Maintenance — from $300/mo, cancel any month.',
  description:
    'Monthly review, daily oversight, continuous optimisation, and quarterly evolution. For AI operating systems built by EMVY or taken over after a 1-week audit. Cancel any month.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const pillars = [
  {
    title: 'Monthly review',
    detail: 'performance check, priorities, next month plan',
  },
  {
    title: 'Daily oversight',
    detail: 'monitoring, health checks, quick fixes',
  },
  {
    title: 'Continuous optimisation',
    detail: 'tune, improve, evolve based on real usage',
  },
  {
    title: 'Quarterly evolution',
    detail: 'business review, system adjustments',
  },
]

const faqs = [
  {
    q: 'What is an AI operating system maintenance retainer?',
    a: 'Ongoing care of the integrated layer that runs your business. The team that built it stays responsible for keeping it healthy.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Month-to-month. No exit fee.',
  },
  {
    q: 'What if I did not get the system from EMVY?',
    a: 'We can maintain it after a 1-week audit. The audit fee is credited toward the first month of the retainer.',
  },
  {
    q: 'What happens if I want to add another build?',
    a: 'Retainer clients get 10% off additional builds.',
  },
]

export default function SystemsMaintenancePage() {
  return (
    <>
      <JsonLd data={service(SERVICES['systems-maintenance'])} />
      <PageHero
        eyebrow="AI OS Maintenance · from $300/mo"
        title="Keep your AI operating system running, evolving, and aligned."
        description="Your AI system, maintained and improved. Cancel any month."
        image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href={CAL_BOOKING_URL}
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe
          <FileText size={16} style={{ marginLeft: 6, verticalAlign: '-2px' }} />
        </a>
        <Link href="/services/ai-strategy-call" className="button secondary">
          Not built yet? Start with a strategy session
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The four pillars</p>
          <h2 className="section-title">What is in the retainer.</h2>
          <p className="section-text">
            Ongoing care for your AI operating system — scaled to match the complexity of your setup.
          </p>
        </div>
        <div className="lead-grid">
          {pillars.map((p, i) => (
            <article key={p.title} className="proof-card">
              <p className="service-flow-number">{String(i + 1).padStart(2, '0')}</p>
              <h3>{p.title}</h3>
              <p>{p.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">Scope, pricing, and what happens if it is not an EMVY-built system.</h2>
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
          <p className="section-kicker">Ready to subscribe</p>
          <h2 className="section-title">Keep your AI OS running, evolving, aligned.</h2>
          <p className="section-text">Month-to-month. Cancel any month.</p>
        </div>
        <div className="hero-actions">
          <a
            className="button primary"
            href={CAL_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Subscribe
          </a>
          <Link href="/services" className="button secondary">
            See full service flow
          </Link>
        </div>
      </section>
    </>
  )
}
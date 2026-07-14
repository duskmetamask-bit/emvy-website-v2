import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Builds',
  description: 'Tailored AI systems built around the way your business actually runs.',
}

const capabilities = [
  ['Voice reception', 'Help handle calls, messages, bookings, and common enquiries.'],
  ['Lead handling', 'Support the path from a new enquiry through to the right next step.'],
  ['Workflow automation', 'Connect routine work, handoffs, and follow-up in a practical way.'],
  ['Integrations and information', 'Bring the right tools, information, and reporting together around the work.'],
]

export default function AIBuildsPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-builds'])} />
      <PageHero
        eyebrow="AI Builds"
        title="Systems built around the way your business actually runs."
        description="EMVY designs and builds practical AI systems around a clear operational need, using the tools and processes your team already works with."
        image="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1800&q=90&auto=format&fit=crop"
      >
        <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
        <Link href="/services" className="button secondary">View services</Link>
      </PageHero>

      <section className="section">
        <div className="section-header"><p className="section-kicker">What we can build</p><h2 className="section-title">A tailored build can bring the right parts of the operation together.</h2><p className="section-text">The final system depends on the workflow, people, and existing tools — not a pre-set package.</p></div>
        <div className="service-flow-grid service-flow-grid-compact">
          {capabilities.map(([title, body], index) => <article key={title} className="service-flow-card"><p className="service-flow-number">0{index + 1}</p><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="section cta-band"><div><p className="section-kicker">Start here</p><h2 className="section-title">Talk through the work first.</h2><p className="section-text">A consult gives us a useful starting point for a tailored build.</p></div><a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a></section>
    </>
  )
}

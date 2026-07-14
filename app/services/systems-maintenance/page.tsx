import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'Systems Maintenance',
  description: 'Ongoing support, refinement, and expansion for AI systems after they are live.',
}

const support = [
  ['Review', 'Look at what is happening across the system and where attention is useful.'],
  ['Refine', 'Improve the parts that need adjustment as the team uses the system.'],
  ['Adapt', 'Extend or change the system as the business and its priorities change.'],
]

export default function SystemsMaintenancePage() {
  return (
    <>
      <JsonLd data={service(SERVICES['systems-maintenance'])} />
      <PageHero eyebrow="Systems Maintenance" title="Keep useful systems useful as the business changes." description="After a system is live, EMVY can provide ongoing support, refinement, and expansion around the way your team works." image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1800&q=90&auto=format&fit=crop">
        <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
        <Link href="/services" className="button secondary">View services</Link>
      </PageHero>
      <section className="section"><div className="section-header"><p className="section-kicker">Ongoing improvement</p><h2 className="section-title">Support that stays close to the real work.</h2><p className="section-text">The focus is simple: review what is happening, improve what needs attention, and adapt as the business changes.</p></div><div className="lead-grid">{support.map(([title, body]) => <article key={title} className="proof-card"><h3>{title}</h3><p>{body}</p></article>)}</div></section>
      <section className="section cta-band"><div><p className="section-kicker">Next step</p><h2 className="section-title">Talk through the system and the support you need.</h2></div><a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a></section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Workflow Assessment',
  description: 'A practical look at how your business works before deciding what to build.',
}

const areas = [
  ['How work moves', 'The day-to-day flow of calls, leads, admin, information, and handoffs.'],
  ['What is already in place', 'The tools, systems, and team knowledge your business already relies on.'],
  ['Where a system could help', 'The opportunities worth considering before any build is scoped.'],
]

export default function AIWorkflowAssessmentPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-strategy-call'])} />
      <PageHero
        eyebrow="AI Workflow Assessment"
        title="Understand the workflow before deciding what to build."
        description="An AI Workflow Assessment is a deeper look at how the business operates, the tools already in place, and the areas that may be worth improving."
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1800&q=90&auto=format&fit=crop"
      >
        <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
        <Link href="/services" className="button secondary">View services</Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">A practical starting point</p>
          <h2 className="section-title">Take a clearer look at the work before choosing a direction.</h2>
          <p className="section-text">The assessment is useful when the team needs more context before moving into a tailored AI build.</p>
        </div>
        <div className="lead-grid">
          {areas.map(([title, body]) => (
            <article key={title} className="proof-card"><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div><p className="section-kicker">Next step</p><h2 className="section-title">Start with a conversation.</h2><p className="section-text">We can work out whether an assessment is useful for your business.</p></div>
        <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
      </section>
    </>
  )
}

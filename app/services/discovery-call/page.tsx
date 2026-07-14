import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'Book a consult',
  description: 'Book a short EMVY consult about a workflow, system, or operational issue.',
}

const topics = [
  ['Your business', 'A little context about the business and how the work is currently handled.'],
  ['What you want to improve', 'The call, lead, admin, information, or handoff issue you would like to discuss.'],
  ['A sensible next step', 'Whether a consult is enough, an assessment would help, or a tailored build is worth exploring.'],
]

export default function DiscoveryCallPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['discovery-call'])} />
      <PageHero
        eyebrow="Book a consult"
        title="A short conversation about the work you want to improve."
        description="Talk through the workflow, system, or operational issue on your mind. We will help identify a sensible next step."
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href="https://cal.com/jake-emvy/discovery-call"
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a consult
        </a>
        <Link href="/services" className="button secondary">
          See service flow
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What To Expect</p>
          <h2 className="section-title">A straightforward conversation about the business and the work.</h2>
          <p className="section-text">
            We will listen to the context, understand what you want to improve, and help identify a sensible next step.
          </p>
        </div>

        <div className="lead-grid discovery-outcomes">
          {topics.map(([title, body], index) => (
            <article key={title} className="proof-card discovery-card"><div className="discovery-phase"><span className="discovery-phase__number">0{index + 1}</span></div><h3>{title}</h3><p>{body}</p></article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready To Book</p>
          <h2 className="section-title">Choose a time that works for you.</h2>
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
          Book a consult
        </a>
      </section>
    </>
  )
}

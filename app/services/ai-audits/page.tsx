import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import CalBookingGate from '../../../components/CalBookingGate'

export const metadata: Metadata = {
  title: 'Free Discovery Call',
  description: 'Book a free 15-minute discovery call with EMVY.',
}

const outcomes = [
  'A brief introduction to your business and what EMVY can help with',
  'A clearer view of the workflow, admin pressure, or efficiency gap you want to improve',
  'A sensible next step, whether that is an audit, a build, or a different recommendation',
]

export default function DiscoveryCallPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Discovery Call"
        title="A free 15-minute call to explore where AI could help your business."
        description="This is a short introduction call to understand your business, what you want to improve, and what the best next step looks like."
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1800&q=90&auto=format&fit=crop"
      >
        <CalBookingGate triggerLabel="Book Free Discovery Call" className="button primary" />
        <Link href="/services" className="button secondary">
          See service flow
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What To Expect</p>
          <h2 className="section-title">Short, focused, and easy to act on.</h2>
          <p className="section-text">
            The call is designed to quickly understand your business and whether EMVY is the right
            fit for the opportunity you are exploring.
          </p>
        </div>

        <div className="lead-grid">
          {outcomes.map((item) => (
            <article key={item} className="proof-card">
              <CheckCircle2 size={18} />
              <h3>{item}</h3>
              <p>Clear, practical direction without unnecessary complexity.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready To Book</p>
          <h2 className="section-title">Book your free discovery call.</h2>
          <p className="section-text">
            Share a few details first, then choose a time that suits you.
          </p>
        </div>
        <CalBookingGate triggerLabel="Continue to booking" className="button primary" />
      </section>
    </>
  )
}

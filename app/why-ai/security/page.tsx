import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'

export const metadata: Metadata = {
  title: 'Security',
  description: 'Security, governance, and sensible controls for AI delivery.',
}

const relatedServices = [
  {
    href: '/services/ops-systems',
    title: 'Ops Systems',
    body: 'Operational AI for handover, reporting, approvals, and visibility — built with sensible access and review controls.',
  },
  {
    href: '/assessment',
    title: 'Mini AI Strategy Assessment',
    body: 'A structured questionnaire that produces a written AI strategy report, not a sales pitch.',
  },
  {
    href: '/services/integrations',
    title: 'Integrations',
    body: 'Connect AI workflows to the systems that already hold the data, with clear access boundaries.',
  },
  {
    href: '/services/ai-strategy-call',
    title: 'AI Strategy Call',
    body: 'A paid 60-minute session that maps your workflow, surfaces the strongest opportunities, and lays out a 0–30 / 30–90 / 90–180 day plan.',
  },
  {
    href: '/services/systems-maintenance',
    title: 'Systems Maintenance',
    body: 'Ongoing support, model review, and access audits after the system is live.',
  },
]

export default function WhyAISecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="Security, governance, and sensible controls."
        description="Trust is part of the service. This page can grow into the supporting detail for data handling, access, review, and rollout controls."
        image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/discovery-call" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/why-ai" className="button secondary">
          Back to Why AI
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Related Services</p>
          <h2 className="section-title">Where security shows up in the delivery.</h2>
          <p className="section-text">
            These services are the places where the controls above get designed, applied, and reviewed.
          </p>
        </div>

        <div className="about-values">
          {relatedServices.map((svc) => (
            <article key={svc.href} className="proof-card">
              <h3>
                <Link href={svc.href}>{svc.title}</Link>
              </h3>
              <p>{svc.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'Selected outcomes and implementation stories for EMVY clients.',
}

const studies = [
  {
    title: 'Lead response system',
    metric: 'Faster follow-up',
    body: 'Unified intake, routing, and follow-up so qualified leads stop going cold between touchpoints.',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Internal workflow automation',
    metric: 'Less manual work',
    body: 'Reduced repetitive admin across handover, reporting, approvals, and status chasing.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'AI-assisted service delivery',
    metric: 'More capacity',
    body: 'A practical assist layer that helps a service team move faster without losing visibility or control.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Lead generation & outreach',
    metric: 'Automated engagement',
    body: 'Streamlined lead generation and outreach processes to connect with more prospects efficiently.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Repetitive process automation',
    metric: 'Reduced friction',
    body: 'Identify and automate repetitive tasks that create bottlenecks and drain team productivity.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Custom workflow replacement',
    metric: 'Cost efficiency',
    body: 'Replace expensive off-the-shelf software with tailored workflows built around your actual needs.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90&auto=format&fit=crop',
  },
]

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Examples of the outcomes a well-scoped AI system should create."
        description="These examples show the kinds of operational gains EMVY is designed to create: quicker responses, cleaner delivery, and more time back for the team."
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services" className="button light">
          View services
        </Link>
        <Link href="/assessment" className="button secondary">
          Start the quiz
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Case Studies</p>
          <h2 className="section-title">Outcomes first, technology second.</h2>
          <p className="section-text">
            Each example focuses on the business result, not just the tooling behind it.
          </p>
        </div>

        <div className="case-grid">
          {studies.map((study) => (
            <article key={study.title} className="case-card">
              <div className="case-image">
                <img src={study.image} alt={study.title} />
              </div>
              <div className="case-body">
                <p>{study.metric}</p>
                <h3>{study.title}</h3>
                <span>{study.body}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Get Started</p>
          <h2 className="section-title">Ready to explore how AI can help your business?</h2>
          <p className="section-text">
            Get in touch to discuss your workflow and see how we can help.
          </p>
        </div>
        <Link href="/contact" className="button primary">
          Contact Us
        </Link>
      </section>
    </>
  )
}

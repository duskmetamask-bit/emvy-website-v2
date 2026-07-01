import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Strategy Call — $500, 60 minutes, a written report.',
  description:
    'Your operations, fully mapped. Every gap, every dollar, in a written report. A 60-minute working session with EMVY.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const workflowBoxes = [
  {
    number: '01',
    title: 'Acquisition & Inbound',
  },
  {
    number: '02',
    title: 'Fulfillment & Delivery',
  },
  {
    number: '03',
    title: 'Admin & Back-Office',
  },
  {
    number: '04',
    title: 'Resources & Supply',
  },
]

const reportSections = [
  { section: 'Section 1', title: 'Business Context' },
  { section: 'Section 2', title: 'Operations Map (4-Box)' },
  { section: 'Section 3', title: 'Findings (Dollar-First)' },
  { section: 'Section 4', title: 'Recommendations' },
  { section: 'Section 5', title: 'Implementation Roadmap' },
  { section: 'Section 6', title: 'Investment & ROI' },
  { section: 'Section 7', title: 'What Happens Next' },
  { section: 'Section 8', title: 'Pre-Build Gaps' },
]

const faqs = [
  {
    q: 'What is the AI Strategy Call?',
    a: 'A 60-minute working session that audits your business across four workflow boxes. You walk away with a written report — every gap, every dollar.',
  },
  {
    q: 'Why $500?',
    a: 'Because the report is the product. The $500 is credited toward any build within 60 days.',
  },
  {
    q: 'Do you push a specific platform?',
    a: 'No. The recommendation follows the problem.',
  },
  {
    q: 'What if I do not want to build?',
    a: 'That is a fine outcome. The report is yours — hand it to your team, a VA, or another builder.',
  },
  {
    q: 'Not sure if you need the call?',
    a: 'Start with the free Mini AI Strategy Assessment — 5 minutes, no call needed, personalised report by email.',
  },
]

export default function AIStrategyCallPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-strategy-call'])} />
      <PageHero
        eyebrow="AI Strategy Call · $500"
        title="Your operations, fully mapped. Every gap, every dollar, in a written report."
        description="A written report delivered within 5 business days. $500, credited toward your build."
        image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href={CAL_BOOKING_URL}
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book the call
          <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: '-2px' }} />
        </a>
        <Link href="/services" className="button secondary">
          See full service flow
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What the call covers</p>
          <h2 className="section-title">Four areas we audit.</h2>
          <p className="section-text">
            We look at how work actually moves through your business — not just the tools you use.
          </p>
        </div>
        <div className="lead-grid workflow-cards">
          {workflowBoxes.map((box) => (
            <article key={box.number} className="proof-card workflow-card">
              <span className="workflow-card__number">{box.number}</span>
              <h3>{box.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you walk away with</p>
          <h2 className="section-title">An 8-section written report, delivered within 5 business days.</h2>
          <p className="section-text">
            Yours to keep, share, or hand to another builder — no strings.
          </p>
        </div>
        <div className="lead-grid report-cards">
          {reportSections.map((item) => (
            <article key={item.section} className="proof-card report-card">
              <span className="report-card__number">{item.section.replace('Section ', '')}</span>
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">The honest answers.</h2>
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
          <p className="section-kicker">Ready to book</p>
          <h2 className="section-title">Lock in your 60-minute call.</h2>
          <p className="section-text">$500 paid at confirmation. Report within 5 business days.</p>
        </div>
        <div className="hero-actions">
          <a
            className="button primary"
            href={CAL_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Book the call
          </a>
          <Link href="/assessment" className="button secondary">
            Not sure? Start the free assessment
          </Link>
        </div>
      </section>
    </>
  )
}
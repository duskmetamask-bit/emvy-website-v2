import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import PageHero from '../../../components/PageHero'

export const metadata: Metadata = {
  title: 'AI Builds',
  description: 'Build AI systems, products, and automations around the workflow that matters most.',
}

const buildPoints = [
  'One meaningful workflow implemented first',
  'Clear inputs, outputs, approvals, and handoffs',
  'AI, automation, and systems chosen around the job',
  'Measurement, QA, and oversight built into delivery',
]

const buildStages = [
  {
    title: 'Map the workflow in detail',
    body: 'Before building begins, we confirm the owner, decision points, data flow, and what success should look like.',
  },
  {
    title: 'Build the right system',
    body: 'We implement the automation, AI workflow, or product layer needed to improve the process in a practical way.',
  },
  {
    title: 'Launch and hand over well',
    body: 'Once live, the system can be handed over to your team or supported further by EMVY if ongoing involvement is needed.',
  },
]

export default function AIBuildsPage() {
  return (
    <>
      <PageHero
        eyebrow="Build"
        title="Build the systems, workflows, and automations that support the opportunity."
        description="This is where the assessment turns into delivery. EMVY builds practical AI systems that help your business run more efficiently."
        image="https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/ai-audits" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/services/maintenance" className="button secondary">
          See maintenance
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What Is Built</p>
          <h2 className="section-title">Delivery stays focused on useful operational improvement.</h2>
          <p className="section-text">
            The aim is not to add AI for the sake of it. The aim is to build a system that improves
            the workflow and can actually be used by the business.
          </p>
        </div>

        <div className="four-card-grid">
          {buildPoints.map((point) => (
            <article key={point} className="proof-card detail-card">
              <CheckCircle2 size={18} />
              <h3>{point}</h3>
              <ul className="detail-list">
                <li>scoped against one clear business outcome</li>
                <li>built to be usable by the team day to day</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Outcome</p>
          <h2 className="section-title">A structured path from design to launch.</h2>
          <p className="section-text">
            Good systems are built with enough detail upfront to make implementation calmer and
            more dependable.
          </p>
        </div>

        <div className="process-grid process-grid-strong">
          {buildStages.map((stage, index) => (
            <article key={stage.title} className="process-card process-card-strong">
              <span>0{index + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

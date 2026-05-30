import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, FileText, Receipt, Sparkles } from 'lucide-react'
import { auditQuestions, buildQuestions, engagementFlow, noteTakingFlow, paymentStandard } from '@/lib/emvy-process'

export const metadata: Metadata = {
  title: 'Process',
  description: 'The EMVY client journey after the discovery call: audit, build, implementation, and maintenance.',
}

const notes = [
  { title: 'Why this order matters', body: 'Paying before detailed work protects time and keeps the engagement serious.', icon: Receipt },
  { title: 'Documented meetings', body: 'Every call should create structured notes, action items, and a client summary.', icon: FileText },
  { title: 'Future automation', body: 'Later, an agent can take notes live and draft the outputs for review.', icon: Sparkles },
  { title: 'No loose ends', body: 'Each step ends with a decision, a deliverable, or a next scheduled action.', icon: CheckCircle2 },
]

export default function ProcessPage() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero__media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1800&q=90&auto=format&fit=crop"
            alt=""
          />
        </div>
        <div className="page-hero__overlay" />
        <div className="page-hero-copy">
          <p className="section-kicker">Client journey</p>
          <h1>What happens after the first call.</h1>
          <p>
            The standard path is discovery call, decision email, payment, audit or build deep-dive,
            findings review, build kickoff, implementation, and maintenance.
          </p>
          <div className="page-hero-actions">
            <Link href="/services/discovery-call" className="button light">
              Book discovery call
            </Link>
            <Link href="/services" className="button secondary">
              View services
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Standard flow</p>
          <h2 className="section-title">A clear path from first conversation to monthly support.</h2>
          <p className="section-text">
            This is the standard EMVY engagement flow for now, before the whole thing is automated.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {engagementFlow.map((step) => (
            <article key={step.title} className="process-card process-card-strong">
              <span>Phase {step.phase}</span>
              <h3>{step.title}</h3>
              <p>{step.summary}</p>
              <strong>{step.owner}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Payment standard</p>
            <h2 className="section-title">The standard is a simple scope summary plus a payment link or invoice.</h2>
          </div>
          <p className="section-text">
            For audit work, collect payment before detailed work begins. For builds, collect a
            deposit or milestone payment before kickoff, then continue on staged payments if the
            scope is larger.
          </p>
        </div>
        <div className="lead-grid">
          {paymentStandard.map((item) => (
            <article key={item} className="proof-card">
              <h3>{item}</h3>
              <p>Use clear wording, an explicit scope, and a deadline so the handoff is frictionless.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Call questions</p>
            <h2 className="section-title">The questions we should ask on audit and build calls.</h2>
          </div>
          <p className="section-text">
            These sets can later be handled by an agent, but they should be human-led now so we
            capture the right detail from the start.
          </p>
        </div>
        <div className="process-grid">
          {[auditQuestions, buildQuestions].map((set) => (
            <article key={set.title} className="process-card">
              <span>{set.title}</span>
              <h3>{set.purpose}</h3>
              <ul className="detail-list">
                {set.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Documentation</p>
            <h2 className="section-title">Every meeting should produce notes, actions, and a usable client summary.</h2>
          </div>
        </div>
        <div className="lead-grid">
          {notes.map((item) => (
            <article key={item.title} className="proof-card">
              <item.icon size={18} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <div className="section" style={{ paddingTop: '2rem' }}>
          <div className="hero-ribbon">
            <strong>Meeting note flow</strong>
            <span>{noteTakingFlow.join(' · ')}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">End state</p>
          <h2 className="section-title">Discovery becomes audit, audit becomes build, build becomes support.</h2>
          <p className="section-text">
            That is the operating pattern we can now automate step by step with Hermes and meeting
            agents later.
          </p>
        </div>
      </section>
    </>
  )
}

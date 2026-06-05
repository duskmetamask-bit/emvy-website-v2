import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Assessment',
  description: 'AI assessment services for identifying the right workflow and opportunity areas.',
}

const assessmentPoints = [
  'Workflow mapping and bottleneck review',
  'Current systems, tooling, and data readiness',
  'Operational risks, governance, and handoff requirements',
  'A shortlist of the strongest opportunities to act on first',
]

const assessmentOutcomes = [
  {
    title: 'Clear opportunity areas',
    body: 'You leave with a practical view of where AI is most likely to reduce admin, improve efficiency, or support a better process.',
  },
  {
    title: 'A sensible action plan',
    body: 'The assessment gives you a clearer route into a build, an internal improvement phase, or a more focused next conversation.',
  },
  {
    title: 'Confidence before implementation',
    body: 'It is easier to move forward when the opportunity, workflow detail, and delivery priorities have been properly reviewed.',
  },
]

export default function AIAssessmentPage() {
  return (
    <>
      <JsonLd data={service(SERVICES['ai-assessment'])} />
      <PageHero
        eyebrow="Audit"
        title="Identify the areas where AI can genuinely help before anything is built."
        description="This assessment looks at the workflow, systems, and operating reality behind the opportunity so the next step is clear and commercially useful."
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/contact" className="button light">
          Contact Us
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What We Review</p>
          <h2 className="section-title">A practical assessment of the workflow, not a generic AI brainstorm.</h2>
          <p className="section-text">
            The goal is to understand where AI fits, what needs more structure first, and where the
            strongest operational return is likely to come from.
          </p>
        </div>

        <div className="four-card-grid">
          {assessmentPoints.map((point) => (
            <article key={point} className="proof-card detail-card">
              <CheckCircle2 size={18} />
              <h3>{point}</h3>
              <ul className="detail-list">
                <li>mapped against the live workflow</li>
                <li>reviewed for operational risk and ownership</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Outcome</p>
          <h2 className="section-title">A clearer decision on what should happen next.</h2>
          <p className="section-text">
            Some businesses use the assessment to move into a build. Others use it to clarify
            priorities and take the next step internally.
          </p>
        </div>

        <div className="about-values">
          {assessmentOutcomes.map((item) => (
            <article key={item.title} className="proof-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready To Get Started</p>
          <h2 className="section-title">Speak to us about your assessment.</h2>
          <p className="section-text">
            Share a few details about your business and what you are looking to improve.
          </p>
        </div>
        <Link href="/contact" className="button primary">
          Contact us
        </Link>
      </section>
    </>
  )
}

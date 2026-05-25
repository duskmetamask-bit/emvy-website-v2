import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Why AI',
  description: 'A practical guide to where AI creates value in a business and how to approach it well.',
}

const whyCards = [
  {
    title: 'Where AI usually helps first',
    body: 'Repetitive admin, lead handling, reporting, process handoffs, and structured workflows where speed and consistency matter.',
  },
  {
    title: 'Where more care is needed',
    body: 'Sensitive decisions, weak data quality, unclear process ownership, and areas where human review should stay central.',
  },
  {
    title: 'What makes implementation work',
    body: 'A clear workflow, a defined outcome, sensible oversight, and a system built around the way the business actually operates.',
  },
]

export default function WhyAIPage() {
  return (
    <>
      <PageHero
        eyebrow="Why AI"
        title="Use AI where it improves the workflow, not where it only adds noise."
        description="The strongest AI projects usually start in the parts of the business that are repetitive, time-heavy, and ready for a better operating system."
        image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/ai-audits" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/services" className="button secondary">
          See services
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">The Basics</p>
            <h2 className="section-title">A useful AI project starts with a real business problem.</h2>
          </div>
          <p className="section-text">
            The goal is not to add AI everywhere. The goal is to identify the area where it can
            create the most value, then build the right system around it.
          </p>
        </div>

        <div className="about-values">
          {whyCards.map((card) => (
            <article key={card.title} className="proof-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="about-split">
          <div className="about-story">
            <p className="section-kicker">How To Think About It</p>
            <h2 className="section-title">Start with the workflow, then decide how much system is needed.</h2>
            <p className="section-text">
              Some businesses are ready for a full build. Some need an audit first. Others just
              need a clearer view of where AI could help reduce admin or improve efficiency.
            </p>
            <p className="section-text">
              The important part is choosing the right opportunity first, then implementing it in a
              way that is practical for the business to use.
            </p>
          </div>

          <div className="about-visual">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=90&auto=format&fit=crop"
              alt="AI planning and operations workflow"
            />
          </div>
        </div>
      </section>
    </>
  )
}

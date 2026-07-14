import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn how EMVY approaches practical AI systems for growing Australian businesses.',
}

const aboutCards = [
  {
    title: 'Why EMVY exists',
    body: 'EMVY exists to turn useful opportunities into systems that make everyday work easier to run.',
  },
  {
    title: 'How we work',
    body: 'We start with the workflow, then build the smallest practical system that can be understood and improved over time.',
  },
  {
    title: 'What you can expect',
    body: 'Clear communication, practical advice, and a system your team can keep using after it is live.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="AI systems should make the work clearer, not more complicated."
        description="EMVY helps Australian businesses assess workflows, build practical systems, and improve operations over time."
        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1800&q=90&auto=format&fit=crop"
      >
        <a href="https://cal.com/jake-emvy/discovery-call" className="button light" target="_blank" rel="noopener noreferrer">Book a consult</a>
        <Link href="/contact" className="button secondary">
          Get in touch
        </Link>
      </PageHero>

      <section className="section">
        <div className="about-split">
          <div className="about-story">
            <p className="section-kicker">A little more context</p>
            <h2 className="section-title">The aim is simple: make the work easier to understand and run.</h2>
            <p className="section-text">
              EMVY is shaped around a practical belief: if a system cannot improve a real workflow,
              support the team, protect quality, or support better decisions, it is not the right
              thing to build yet.
            </p>
            <p className="section-text">
              That is why the client journey starts with a short assessment or consult, moves into
              an AI Workflow Assessment when needed, and only then into the right build.
            </p>
          </div>

          <div className="about-visual">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=90&auto=format&fit=crop"
              alt="Modern consultancy workspace"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="lead-grid">
          {aboutCards.map((card) => (
            <article key={card.title} className="proof-card">
              <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
                {card.title}
              </h2>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Working style</p>
            <h2 className="section-title">Clear thinking, practical delivery, no unnecessary theatre.</h2>
          </div>
          <p className="section-text">
            Good consultancy work should feel steady and easy to follow. The process matters as
            much as the outcome, so every page is designed to be direct, confident, and simple to
            act on.
          </p>
        </div>

        <div className="about-values">
          <article className="proof-card">
            <h3>Calm process</h3>
            <p>We keep the first step simple so clients can understand what happens next without effort.</p>
          </article>
          <article className="proof-card">
            <h3>Practical advice</h3>
            <p>Every recommendation should connect back to a workflow, the people doing the work, and a practical next step.</p>
          </article>
          <article className="proof-card">
            <h3>Clean handover</h3>
            <p>Useful systems should be easy to keep using after launch, not difficult for a client team to inherit.</p>
          </article>
        </div>
      </section>
    </>
  )
}

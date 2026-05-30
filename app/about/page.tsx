import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn how EMVY approaches AI delivery for modern teams.',
}

const aboutCards = [
  {
    title: 'Why EMVY exists',
    body: 'A lot of AI firms talk about possibility. EMVY exists to turn that possibility into a working operating layer with real ownership and real outcomes.',
  },
  {
    title: 'How we work',
    body: 'We start with the actual process, not the shiny tool. Then we build the smallest system that creates useful leverage and can be maintained properly.',
  },
  {
    title: 'What you can expect',
    body: 'Clear communication, commercially grounded advice, and delivery that moves the business forward instead of adding noise.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built for teams that want AI to feel practical, commercially useful, and well run."
        description="EMVY helps growing businesses turn AI into structured systems that support delivery, sales, and operations without creating extra complexity."
        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/assessment" className="button light">
          Start the quiz
        </Link>
        <Link href="/contact" className="button secondary">
          Get in touch
        </Link>
      </PageHero>

      <section className="section">
        <div className="about-split">
          <div className="about-story">
            <p className="section-kicker">A little more context</p>
            <h2 className="section-title">The aim is simple: make AI feel useful, credible, and worth paying for.</h2>
            <p className="section-text">
              EMVY is shaped around a practical belief: if a system cannot improve a real workflow,
              reduce friction, protect quality, or support better decisions, it is not the right
              thing to build yet.
            </p>
            <p className="section-text">
              That is why the client journey starts with a short quiz or discovery call, moves into
              assessment when needed, and only then suggests the right implementation path.
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
            <p>Every recommendation should connect back to a workflow, a measurable result, or a commercial gain.</p>
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

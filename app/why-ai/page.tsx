import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Why AI',
  description: 'A practical guide to where AI creates value in a business and how to approach it well.',
}

const whyCards = [
  {
    title: 'Handle the repetitive work',
    body: 'AI takes care of the admin tasks that eat up your time so you can focus on the work that actually matters.',
  },
  {
    title: 'Work faster without cutting corners',
    body: 'AI can process, organise, and respond at scale while maintaining quality and consistency across your operations.',
  },
  {
    title: 'Free up your team',
    body: 'When AI handles the routine, your team has more capacity for strategy, creativity, and the work that drives the business forward.',
  },
]

export default function WhyAIPage() {
  return (
    <>
      <PageHero
        eyebrow="Why AI"
        title="AI is here to help your business run better."
        description="Used well, AI handles the repetitive work, frees up your team, and helps your business operate more efficiently."
        image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/discovery-call" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/services" className="button secondary">
          See services
        </Link>
      </PageHero>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">What AI Does Well</p>
            <h2 className="section-title">AI works best when it handles the tasks that slow you down.</h2>
          </div>
          <p className="section-text">
            The best AI implementations focus on freeing up time and capacity, not on replacing the
            human judgment that keeps your business running well.
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
            <p className="section-kicker">Getting Started</p>
            <h2 className="section-title">The right AI solution starts with understanding your workflow.</h2>
            <p className="section-text">
              Before recommending anything, we look at how your business actually works. The goal is
              to find where AI can genuinely help, not to force it where it does not fit.
            </p>
            <p className="section-text">
              Whether you need a full build or just a clearer view of where to start, we help you
              move forward in a way that makes sense for your business.
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

      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready To Explore</p>
          <h2 className="section-title">See how AI could work for your business.</h2>
          <p className="section-text">
            Book a free discovery call to discuss your workflow and see where AI could help.
          </p>
        </div>
        <Link href="/services/discovery-call" className="button primary">
          Book Free Discovery Call
        </Link>
      </section>
    </>
  )
}

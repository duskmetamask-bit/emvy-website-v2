import Link from 'next/link'
import TrackedLink from '@/components/TrackedLink'

const helpAreas = [
  {
    title: 'Calls and enquiries',
    body: 'Answer common questions, take messages and help people get to the right next step.',
  },
  {
    title: 'Follow-up and admin',
    body: 'Keep routine work moving without relying on someone to remember every task.',
  },
  {
    title: 'Information and handoffs',
    body: 'Make it easier for the right person to find what they need and know what happens next.',
  },
]

const steps = [
  { number: '01', title: 'Consult', body: 'Start with a focused conversation.' },
  { number: '02', title: 'Assess', body: 'Look more closely where clarity is useful.' },
  { number: '03', title: 'Build', body: 'Create the right system for the work.' },
  { number: '04', title: 'Improve', body: 'Keep refining it as the business changes.' },
]

export default function Home() {
  return (
    <>
      <section className="hero-shell">
        <div className="hero-banner">
          <div className="hero-media" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1800&q=90&auto=format&fit=crop"
              alt=""
              width={1800}
              height={1012}
              sizes="100vw"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="hero-copy consult-hero-copy">
            <p className="section-kicker">AI built for your business</p>
            <h1>Systems that make work easier.</h1>
            <p>EMVY helps small businesses use AI where it genuinely makes a difference.</p>
            <div className="hero-actions">
              <TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary" eventName="book_consult_click" eventLabel="home_hero">
                Book a consult
              </TrackedLink>
            </div>
            <p className="hero-support">A focused 20-minute conversation about your business.</p>
          </div>
        </div>
      </section>

      <section className="section belief-section">
        <div className="belief-copy">
          <p className="section-kicker">The approach</p>
          <h2 className="section-title">The right system fits the business.</h2>
          <p className="section-text">It should work with the people, tools and processes you already rely on—not make the day more complicated.</p>
        </div>
        <div className="belief-image">
          <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=85&auto=format&fit=crop" alt="A team discussing how work gets done" />
        </div>
      </section>

      <section className="section public-section">
        <div className="section-header">
          <p className="section-kicker">Where EMVY can help</p>
          <h2 className="section-title">Make the important parts of the day easier to manage.</h2>
        </div>
        <div className="simple-grid three">
          {helpAreas.map((area) => <article className="simple-card" key={area.title}><h3>{area.title}</h3><p>{area.body}</p></article>)}
        </div>
        <Link href="/services" className="inline-link section-link">Explore services</Link>
      </section>

      <section className="section public-section">
        <div className="section-header">
          <p className="section-kicker">How the work starts</p>
          <h2 className="section-title">A simple path from the first conversation.</h2>
        </div>
        <Link href="/services" className="step-strip" aria-label="Explore EMVY services">
          {steps.map((step) => <article key={step.title}><span>{step.number}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}
        </Link>
      </section>

      <section className="section final-consult-section">
        <p className="section-kicker">Start here</p>
        <h2 className="section-title">Let’s talk about your business.</h2>
        <p className="section-text">A focused 20-minute consult is a simple place to start.</p>
        <div className="hero-actions">
          <TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary" eventName="book_consult_click" eventLabel="home_close">
            Book a consult
          </TrackedLink>
        </div>
        <Link href="/contact" className="inline-link">Prefer to send an enquiry? Contact EMVY.</Link>
      </section>
    </>
  )
}

import TrackedLink from '@/components/TrackedLink'

const services = [
  { number: '01', title: 'Consult', first: 'A focused 20-minute conversation about your business and what you would like to make easier.', second: 'Bring a question, a process that is frustrating, or simply an idea worth exploring.' },
  { number: '02', title: 'Assess', first: 'When more clarity is useful, we look more closely at how the work moves and what is already in place.', second: 'The aim is to understand the business before deciding what to build.' },
  { number: '03', title: 'Build', first: 'EMVY builds AI around a clear need, using the tools and processes your business already relies on.', second: 'That might involve calls, enquiries, follow-up, admin, information or handoffs.' },
  { number: '04', title: 'Improve', first: 'Once a system is live, it can be reviewed, refined and extended as the business changes.', second: 'Useful systems should keep fitting the work over time.' },
]

export default function ServicesPage() {
  return <>
    <section className="hero-shell">
      <div className="hero-banner services-hero">
        <div className="hero-media" aria-hidden="true"><img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1800&q=90&auto=format&fit=crop" alt="" width={1800} height={1012} sizes="100vw" fetchPriority="high" /></div>
        <div className="hero-copy consult-hero-copy">
          <p className="section-kicker">Services</p>
          <h1>AI built around the way your business runs.</h1>
          <p>EMVY helps small businesses make calls, enquiries, follow-up, admin and handoffs easier to manage.</p>
          <div className="hero-actions"><TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary" eventName="book_consult_click" eventLabel="services_hero">Book a consult</TrackedLink></div>
        </div>
      </div>
    </section>

    <section className="section services-intro">
      <p className="section-kicker">How EMVY works</p>
      <h2 className="section-title">Not a collection of tools. A better way for work to move.</h2>
      <p className="section-text">The aim is not to add more software to the business. It is to make the work clearer, more consistent and easier for your team to run.</p>
    </section>

    <section className="section"><div className="service-feature-grid">{services.map((service) => <article className="service-feature-card" key={service.number}><span>{service.number}</span><h2>{service.title}</h2><p>{service.first}</p><p>{service.second}</p></article>)}</div></section>

    <section className="section final-consult-section">
      <p className="section-kicker">A useful first step</p>
      <h2 className="section-title">Not sure where to start? Start with a conversation.</h2>
      <p className="section-text">A consult can lead to a clearer next step, an assessment where it is useful, or a focused build.</p>
      <TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary" eventName="book_consult_click" eventLabel="services_close">Book a consult</TrackedLink>
    </section>
  </>
}

import type { Metadata } from 'next'
import PageHero from '../../components/PageHero'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore the EMVY service flow: consult, AI Workflow Assessment, build, and ongoing improvement.',
}

const stages = [
  {
    number: '01', id: 'consult', title: 'Consult', imageSide: 'left',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'People having a focused business conversation',
    description: 'A focused conversation about the part of the business you would like to make easier. We start with the real work, not a pre-set package.',
    points: ['Bring a question, frustrating process, or idea worth exploring.', 'Talk through what is happening now and what a better next step could look like.', 'Leave with a clearer sense of whether to assess, build, or keep things simple.'],
  },
  {
    number: '02', id: 'assessment', title: 'Assessment', imageSide: 'right',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A team mapping a business workflow',
    description: 'When more clarity is useful, we look more closely at how work moves, where information is held, and what is already in place.',
    points: ['Map the people, tools, handoffs, and recurring work involved.', 'Identify where a clearer system could genuinely help.', 'Understand the business before deciding what is worth building.'],
  },
  {
    number: '03', id: 'builds', title: 'Build', imageSide: 'left',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A person working with connected business systems',
    description: 'EMVY builds AI around a clear need, using the tools and processes your business already relies on.',
    points: ['Shape the system around a defined workflow and outcome.', 'Connect calls, enquiries, follow-up, admin, information, or handoffs where useful.', 'Keep the work practical for the people who will use it every day.'],
  },
  {
    number: '04', id: 'improvement', title: 'Improve', imageSide: 'right',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&q=90&auto=format&fit=crop',
    imageAlt: 'A team reviewing and improving a system together',
    description: 'Useful systems should keep fitting the work as the business changes. Once a system is live, it can be reviewed, refined, and extended over time.',
    points: ['Review what is working and where the next improvement is useful.', 'Refine the system as people, tools, and priorities change.', 'Keep a clear path for support and future additions.'],
  },
]

export default function ServicesPage() {
  return <>
    <PageHero eyebrow="Services" title="A clear path from workflow to useful system." description="EMVY helps Australian businesses assess the work, build what helps, and improve operations over time." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=90&auto=format&fit=crop">
      <a href="https://cal.com/jake-emvy/discovery-call" className="button light" target="_blank" rel="noopener noreferrer">Book a consult</a>
    </PageHero>

    <section className="section service-flow-intro">
      <p className="section-kicker">The service flow</p>
      <h2 className="section-title">Start with the work. Move only where it helps.</h2>
      <p className="section-text">Each stage gives the next one a clearer foundation. Some businesses start with a consult; others need a closer assessment before a focused build.</p>
    </section>

    {stages.map((stage) => <section className="section service-stage" id={stage.id} key={stage.id}>
      <div className={`service-stage__grid ${stage.imageSide === 'right' ? 'service-stage__grid--reverse' : ''}`}>
        <div className="service-stage__image"><img src={stage.image} alt={stage.imageAlt} /></div>
        <div className="service-stage__copy">
          <p className="section-kicker">{stage.number} — {stage.title}</p>
          <h2>{stage.title}</h2>
          <p>{stage.description}</p>
          <ul>{stage.points.map((point) => <li key={point}>{point}</li>)}</ul>
          {stage.id === 'consult' ? <a href="https://cal.com/jake-emvy/discovery-call" className="inline-link" target="_blank" rel="noopener noreferrer">Book a consult</a> : null}
        </div>
      </div>
    </section>)}

    <section className="section final-cta-section">
      <div className="section-header"><p className="section-kicker">Start here</p><h2 className="section-title">Not sure which stage fits? Start with a conversation.</h2><p className="section-text">A consult is a simple place to start. We can work out the useful next step together.</p></div>
      <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
    </section>
  </>
}

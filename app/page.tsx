import { ArrowRight } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import { localBusiness, webSite } from '@/lib/schema/jsonld'
import { engagementFlow } from '@/lib/emvy-process'

const services = [
  {
    number: '01',
    title: 'Start',
    subtitle: 'A short consult to understand the work',
    description:
      'Talk through the workflow, system, or operational issue you would like to improve.',
    href: '/services#consult',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=90&auto=format&fit=crop',
  },
  {
    number: '02',
    title: 'Assess',
    subtitle: 'Map the workflow before a build',
    description:
      'An AI Workflow Assessment can map the workflow, current systems, and priorities before deciding what to build.',
    href: '/services#assessment',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=90&auto=format&fit=crop',
  },
  {
    number: '03',
    title: 'Build',
    subtitle: 'Build the system the workflow calls for',
    description:
      'We build practical AI systems, automations, and integrations around a clear operational need.',
    href: '/services#builds',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
  {
    number: '04',
    title: 'Improve',
    subtitle: 'Keep useful systems useful',
    description:
      'Review, refine, and extend the system as priorities and the business change.',
    href: '/services#improvement',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=90&auto=format&fit=crop',
  },
]

const expertiseAreas = [
  {
    title: 'Workflow mapping',
    body: 'We understand how the work moves before recommending a system.',
    points: ['handoffs and decisions', 'admin work and delays', 'owners, approvals, and edge cases'],
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'AI systems',
    body: 'The system follows the job; the tools come second.',
    points: ['OpenAI, Claude, Gemini', 'prompt and workflow design', 'cost, speed, and reliability fit'],
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Automation and integrations',
    body: 'We connect useful systems to the tools your team already uses.',
    points: ['CRM, inbox, forms, docs', 'Zapier, Make, n8n', 'routing, alerts, and follow-up flows'],
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Operational clarity',
    body: 'Ownership and review points stay clear so the system is useful to run.',
    points: ['review points and approvals', 'access and permissions', 'audit trail and sensible controls'],
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=90&auto=format&fit=crop',
  },
]

const caseStudies = [
  {
    title: 'Lead handling',
    metric: 'A clearer front door',
    body: 'Connect intake, routing, booking, and follow-up around the way your team works.',
    image:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Workflow automation',
    metric: 'Less repeat admin',
    body: 'Support handovers, reporting, approvals, and routine work with better-connected steps.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Custom AI systems',
    metric: 'A focused operating layer',
    body: 'Build a practical system around a specific service, team, or operational workflow.',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=90&auto=format&fit=crop',
  },
]

function HeroCtas() {
  return <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
}

export default function Home() {

  return (
    <>
      <JsonLd data={[webSite(), localBusiness()]} />
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

          <div className="hero-copy">
            <p className="section-kicker hero-kicker">AI systems for growing businesses</p>
            <h1>Systems that make work easier.</h1>
            <p>
              EMVY helps Australian businesses assess workflows, build practical AI systems, and
              improve operations.
            </p>

            <div className="hero-actions">
              <HeroCtas />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-header">
          <p className="section-kicker">Services</p>
          <h2 className="section-title">Assess the work. Build what helps. Improve it over time.</h2>
          <p className="section-text">
            Start with a conversation, then move into deeper assessment or a build only when it makes sense.
          </p>
        </div>

        <div className="service-flow-grid">
          {services.map((service) => (
            <a key={service.title} href={service.href} className="service-flow-card">
              <article className="service-flow-card__inner">
                <div className="content-card-image">
                  <img
                    src={service.image}
                    alt={service.title}
                    width={1200}
                    height={675}
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="service-flow-number">{service.number}</p>
                <h3>{service.title}</h3>
                <strong>{service.subtitle}</strong>
                <p>{service.description}</p>
                <span>
                  See more <ArrowRight size={14} />
                </span>
              </article>
            </a>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What we work with</p>
          <h2 className="section-title">The work follows the workflow, systems, and decisions that matter.</h2>
        </div>

        <div className="expertise-grid expertise-grid-wide">
          {expertiseAreas.map((item) => (
            <article key={item.title} className="expertise-card detail-card">
              <div className="content-card-image content-card-image--short">
                <img
                  src={item.image}
                  alt={item.title}
                  width={1200}
                  height={675}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <ul className="detail-list">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="solutions">
        <div className="section-header">
          <p className="section-kicker">Capability areas</p>
          <h2 className="section-title">Practical systems for the work that needs a clearer path.</h2>
        </div>

        <div className="case-grid">
          {caseStudies.map((study) => (
            <article key={study.title} className="case-card">
              <div className="case-image">
                <img
                  src={study.image}
                  alt={study.title}
                  width={1200}
                  height={675}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="case-body">
                <p>{study.metric}</p>
                <h3>{study.title}</h3>
                <span>{study.body}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section final-cta-section" id="contact">
        <div className="section-header">
          <p className="section-kicker">Next Step</p>
          <h2 className="section-title">Start with a conversation about the work.</h2>
          <p className="section-text">
            Book a consult to talk through the workflow, system, or operational issue you want to improve.
          </p>
        </div>

        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>Book a consult</h3>
            <p>
              A short conversation about the workflow, system, or operational issue you would like to improve.
            </p>
            <a href="https://cal.com/jake-emvy/discovery-call" className="button primary" target="_blank" rel="noopener noreferrer">Book a consult</a>
          </article>

        </div>
      </section>
    </>
  )
}

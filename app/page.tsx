import { ArrowRight } from 'lucide-react'
import TrackedLink from '../components/TrackedLink'
import CalBookingGate from '../components/CalBookingGate'
import JsonLd from '@/components/JsonLd'
import { localBusiness, webSite } from '@/lib/schema/jsonld'
import { engagementFlow } from '@/lib/emvy-process'

const services = [
  {
    number: '01',
    title: 'Discovery',
    subtitle: 'Free 15-minute introduction call',
    description:
      'A quick conversation to understand your business, the workflow you want to improve, and the best next step.',
    href: '/services/discovery-call',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=90&auto=format&fit=crop',
  },
  {
    number: '02',
    title: 'Strategy',
    subtitle: 'Find the strongest AI opportunities',
    description:
      'We assess the workflow, systems, and operational constraints so you know where AI will genuinely help.',
    href: '/services/ai-strategy-call',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=90&auto=format&fit=crop',
  },
  {
    number: '03',
    title: 'Build',
    subtitle: 'Design and implement the right system',
    description:
      'We build AI systems, automations, and workflow improvements that reduce admin and improve efficiency.',
    href: '/services/ai-builds',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
  {
    number: '04',
    title: 'Maintenance',
    subtitle: 'Support after launch when needed',
    description:
      'If you want ongoing support, we maintain, refine, and improve the system as your business grows.',
    href: '/services/systems-maintenance',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=90&auto=format&fit=crop',
  },
]

const expertiseAreas = [
  {
    title: 'Workflow mapping',
    body: 'We map how the work actually moves before recommending anything.',
    points: ['handoffs and bottlenecks', 'admin load and delays', 'owners, approvals, and edge cases'],
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'AI tools and models',
    body: 'Model choice depends on the job, not on whatever is trending.',
    points: ['OpenAI, Claude, Gemini', 'prompt and workflow design', 'cost, speed, and reliability fit'],
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Automation and integrations',
    body: 'We connect AI into the systems your team already uses.',
    points: ['CRM, inbox, forms, docs', 'Zapier, Make, n8n', 'routing, alerts, and follow-up flows'],
    image:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Data and governance',
    body: 'Oversight stays visible so the system is useful and safe to run.',
    points: ['review points and approvals', 'access and permissions', 'audit trail and sensible controls'],
    image:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=90&auto=format&fit=crop',
  },
]

const caseStudies = [
  {
    title: 'Lead response system',
    metric: 'Faster follow-up',
    body: 'Unified intake, routing, and follow-up so qualified leads stop going cold between touchpoints.',
    image:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'Internal workflow automation',
    metric: 'Less manual work',
    body: 'Reduced repetitive admin across handover, reporting, approvals, and status chasing.',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&auto=format&fit=crop',
  },
  {
    title: 'AI-assisted service delivery',
    metric: 'More capacity',
    body: 'A practical assist layer that helps a service team move faster without losing visibility or control.',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&q=90&auto=format&fit=crop',
  },
]

function HeroCtas() {
  return (
    <>
      <CalBookingGate triggerLabel="Book Free Discovery Call" className="button primary" />
      <TrackedLink
        href="/assessment"
        className="button secondary"
        eventName="quiz_start"
        eventLabel="homepage hero"
      >
        Start the Mini AI Strategy Assessment
      </TrackedLink>
    </>
  )
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
            <p className="section-kicker hero-kicker">AI strategy for Australian small businesses</p>
            <h1>We identify where your business can leverage AI, then build the systems to make it work.</h1>
            <p>
              We help small businesses in Australia remove bottlenecks and admin tasks by
              leveraging AI.
            </p>

            <div className="hero-ribbon">
              <strong>Strategy before investment. $500 — the only structured AI assessment in this price band.</strong>
              <span>
                Free 2-min Mini AI Strategy Assessment → $500 AI Strategy → $3K–$5K build. No
                fluff, no follow-up unless you ask.
              </span>
            </div>

            <div className="hero-actions">
              <HeroCtas />
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-header">
          <p className="section-kicker">Services</p>
          <h2 className="section-title">A clear service flow from first conversation to live system.</h2>
          <p className="section-text">
            Start at the stage you need now, then move forward only if the next step makes sense.
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
          <p className="section-kicker">Expertise Areas</p>
          <h2 className="section-title">The work is scoped around the workflow, tools, and controls that actually matter.</h2>
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
          <p className="section-kicker">Solutions</p>
          <h2 className="section-title">Examples of the kinds of outcomes the right system should create.</h2>
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
          <h2 className="section-title">Choose the starting point that suits you best.</h2>
          <p className="section-text">
            Book a free discovery call if you want to talk through the opportunity, or take the
            quiz if you want a simple first step.
          </p>
        </div>

        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>Book Free Discovery Call</h3>
            <p>
              A short 15-minute introduction to understand your business, what you want AI to help
              with, and what the best next step looks like.
            </p>
            <CalBookingGate triggerLabel="Book Free Discovery Call" className="button primary" />
          </article>

          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>Start the Mini AI Strategy Assessment</h3>
            <p>
              A free 2-minute self-assessment that surfaces exactly where your business is losing
              time and money — and emails you a personalised strategy report.
            </p>
            <TrackedLink
              href="/assessment"
              className="button secondary"
              eventName="quiz_start"
              eventLabel="homepage final cta"
            >
              Start the quiz
            </TrackedLink>
          </article>
        </div>
      </section>
    </>
  )
}

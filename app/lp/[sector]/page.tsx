import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  Phone,
  Receipt,
  Wrench,
} from 'lucide-react'
import TrackedLink from '../../../components/TrackedLink'
import CalBookingGate from '../../../components/CalBookingGate'
import { engagementFlow } from '@/lib/emvy-process'

const SECTOR_CONTENT: Record<
  string,
  {
    name: string
    hero: {
      eyebrow: string
      title: string
      subtitle: string
      image: string
    }
    pains: { icon: typeof Clock; title: string; body: string }[]
    outcomes: { metric: string; title: string; body: string }[]
    flow: { step: string; title: string; body: string }[]
    audit: { title: string; items: string[] }
  }
> = {
  trades: {
    name: 'Trades & Construction',
    hero: {
      eyebrow: 'For plumbers, sparkies, builders, and tradies',
      title: 'Get 8+ hours a week back. Stop losing jobs to slow follow-ups.',
      subtitle:
        'EMVY builds AI systems for tradies who want to do less admin and book more work. Quotes, follow-ups, inbox, and bookings — handled while you are on the tools.',
      image:
        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1800&q=90&auto=format&fit=crop',
    },
    pains: [
      {
        icon: ClipboardList,
        title: 'Quoting eats your evenings',
        body: 'You finish a job at 5pm, then spend two hours writing quotes that may not even convert.',
      },
      {
        icon: Phone,
        title: 'Missed calls = missed jobs',
        body: 'When you are under a house or on a roof, the phone goes to voicemail and the customer calls the next tradie on the list.',
      },
      {
        icon: Clock,
        title: 'Follow-ups fall through',
        body: 'Quotes go out and never get chased. The job goes to whoever bothered to ring back.',
      },
      {
        icon: Inbox,
        title: 'Inbox is chaos',
        body: 'Customer questions, supplier replies, council emails — all mixed together, all urgent, none triaged.',
      },
      {
        icon: Receipt,
        title: 'Bookkeeping is a Sunday job',
        body: 'Reconciling receipts, chasing invoices, and updating Xero is eating the only day off you have.',
      },
      {
        icon: FileText,
        title: 'Compliance and forms',
        body: 'SWMS, insurances, safety docs — the paperwork keeps stacking while the work waits.',
      },
    ],
    outcomes: [
      {
        metric: '8+ hrs/week',
        title: 'Less admin',
        body: 'Quoting, follow-ups, and inbox triage handled automatically so you can stay on the tools.',
      },
      {
        metric: '2x faster',
        title: 'Quote turnaround',
        body: 'AI-generated quotes from your templates, sent the same day you finish the walkthrough.',
      },
      {
        metric: '24/7',
        title: 'Lead capture',
        body: 'A voice and chat assistant that books the job or takes a message when you cannot pick up.',
      },
      {
        metric: '90 days',
        title: 'To a system that runs',
        body: 'A phased build that delivers value in week 1 and compounds through week 12.',
      },
    ],
    flow: [
      {
        step: '01',
        title: 'Free 15-minute discovery call',
        body: 'A short call to understand your trade, your admin load, and where AI will save you the most time. No pitch, no follow-up spam.',
      },
      {
        step: '02',
        title: 'Tradies Ops Audit ($1,500)',
        body: 'We map your quoting, follow-up, inbox, booking, and bookkeeping workflows. You get a written report with a 90-day plan and a clear investment range.',
      },
      {
        step: '03',
        title: 'Build and run',
        body: 'We implement the highest-ROI automations first, then expand. You keep trading while the system runs in the background.',
      },
    ],
    audit: {
      title: 'What is in the free 15-minute call',
      items: [
        'A quick read on where you are losing the most time and money right now',
        'One specific AI workflow that would save you 3+ hours a week',
        'A clear answer on whether the full audit is worth $1,500 for your business',
        'Honest take — if EMVY is not the right fit, we will tell you on the call',
      ],
    },
  },
}

type Props = { params: { sector: string } }

export function generateMetadata({ params }: Props): Metadata {
  const content = SECTOR_CONTENT[params.sector]
  if (!content) {
    return { title: 'Sector' }
  }
  return {
    title: `AI for ${content.name} — EMVY`,
    description: `AI systems and admin automation for ${content.name.toLowerCase()}. Free discovery call, no pitch.`,
  }
}

export default function SectorLandingPage({ params }: Props) {
  const content = SECTOR_CONTENT[params.sector]
  if (!content) {
    if (params.sector === 'trades') notFound()
    redirect('/lp')
  }

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__media" aria-hidden="true">
          <img src={content.hero.image} alt="" />
        </div>
        <div className="page-hero__overlay" />
        <div className="page-hero-copy">
          <p className="section-kicker">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.subtitle}</p>
          <div className="page-hero-actions">
            <CalBookingGate
              triggerLabel="Book Free Discovery Call"
              className="button primary"
              eventLabel={`sector-${params.sector}-hero`}
            />
            <TrackedLink
              href="/assessment"
              className="button secondary"
              eventName="quiz_start"
              eventLabel={`sector-${params.sector}-hero`}
            >
              Take the 2-min ops quiz
            </TrackedLink>
          </div>
          <div className="hero-ribbon">
            <strong>No pitch, no spam.</strong>
            <span>One short call to see if EMVY is a fit. Honest answer either way.</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The problem</p>
          <h2 className="section-title">You did not start a trade to do admin.</h2>
          <p className="section-text">
            These are the workflows eating your week. Every one of them is fixable with the right
            AI system.
          </p>
        </div>
        <div className="lead-grid">
          {content.pains.map((pain) => (
            <article key={pain.title} className="proof-card">
              <pain.icon size={18} />
              <h3>{pain.title}</h3>
              <p>{pain.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What changes</p>
          <h2 className="section-title">What the right system actually delivers.</h2>
          <p className="section-text">
            These are the numbers we target on every trades engagement. Real outcomes, not vanity
            metrics.
          </p>
        </div>
        <div className="case-grid">
          {content.outcomes.map((outcome) => (
            <article key={outcome.title} className="case-card">
              <div className="case-image" aria-hidden="true">
                <Wrench size={48} strokeWidth={1.2} />
              </div>
              <div className="case-body">
                <p>{outcome.metric}</p>
                <h3>{outcome.title}</h3>
                <span>{outcome.body}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">How it works</p>
          <h2 className="section-title">Three steps from first call to running system.</h2>
        </div>
        <div className="process-grid process-grid-strong">
          {content.flow.map((step) => (
            <article key={step.step} className="process-card process-card-strong">
              <span>Step {step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <div className="section" style={{ paddingTop: '2rem' }}>
          <div className="hero-ribbon">
            <strong>Want the long version?</strong>
            <span>
              See the full engagement flow:{' '}
              <Link href="/process" className="inline-link">
                /process <ArrowRight size={14} />
              </Link>
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The free call</p>
          <h2 className="section-title">{content.audit.title}</h2>
        </div>
        <div className="lead-grid">
          {content.audit.items.map((item) => (
            <article key={item} className="proof-card">
              <CheckCircle2 size={18} />
              <p>{item}</p>
            </article>
          ))}
        </div>
        <div
          className="section"
          style={{ paddingTop: '2rem', display: 'flex', justifyContent: 'center' }}
        >
          <CalBookingGate
            triggerLabel="Book Free Discovery Call"
            className="button primary"
            eventLabel={`sector-${params.sector}-audit-cta`}
          />
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="section-header">
          <p className="section-kicker">Next step</p>
          <h2 className="section-title">Two ways to start. Both are free.</h2>
        </div>
        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>
              <Calendar size={18} /> Book the free call
            </h3>
            <p>15 minutes, no pitch. Find out if AI is a fit for your trade.</p>
            <CalBookingGate
              triggerLabel="Book Free Discovery Call"
              className="button primary"
              eventLabel={`sector-${params.sector}-final-cta-1`}
            />
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>
              <MessageSquare size={18} /> Take the ops quiz
            </h3>
            <p>2-minute quiz that scores your admin load and emails you the result.</p>
            <TrackedLink
              href="/assessment"
              className="button secondary"
              eventName="quiz_start"
              eventLabel={`sector-${params.sector}-final-cta-2`}
            >
              Start the quiz
            </TrackedLink>
          </article>
        </div>
      </section>
    </>
  )
}

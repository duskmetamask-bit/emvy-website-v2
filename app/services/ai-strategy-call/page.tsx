import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, FileText, ArrowRight } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service, faqPage } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Strategy Call — $500 for a 60-minute session + 5-page roadmap',
  description:
    'A paid 60-minute AI strategy session with EMVY + a 5-page written roadmap delivered within 5 business days. Where you are now, where AI can take you, and a 0–30 / 30–90 / 90–180 day plan with build cost, tool cost, and ROI.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const agenda = [
  {
    number: '01',
    title: 'Where you are now',
    duration: '~10 min',
    points: [
      'What your business does day-to-day and where the friction actually lives',
      'The tools, systems, and automations already in place',
      'What you have already tried with AI and what stuck',
    ],
  },
  {
    number: '02',
    title: 'Where AI could take you',
    duration: '~25 min',
    points: [
      'The two or three workflows where AI would pay off fastest — and why',
      'What to leave alone: where AI is a distraction or a risk',
      'Platform-agnostic tool fit: the right model, the right cost, the right owner',
    ],
  },
  {
    number: '03',
    title: 'The pathway',
    duration: '~20 min',
    points: [
      'A staged 0–30 / 30–90 / 90–180 day plan with concrete milestones',
      'Build cost, tool cost, and an honest ROI statement',
      'What you can hand to a builder, a VA, or your team — and what needs EMVY',
    ],
  },
  {
    number: '04',
    title: 'Next step',
    duration: '~5 min',
    points: [
      'You decide whether the build or retainer is the right next move',
      'If yes — the $500 is credited in full toward any $3K+ build within 60 days',
      'If no — the roadmap is yours to use however you want',
    ],
  },
]

const roadmapPages = [
  {
    page: 'Page 1',
    title: 'Where you are now',
    detail:
      'A snapshot of the business today — workflows, tools, owners, and the operational pain that is costing you time or money.',
  },
  {
    page: 'Page 2',
    title: 'Where AI could take you',
    detail:
      'The two or three highest-ROI opportunities, ranked. Each one is mapped to a specific workflow with a clear before-and-after.',
  },
  {
    page: 'Page 3',
    title: '0–30 day plan',
    detail:
      'The first month — quick wins, low-cost tooling, and the workflows to leave alone. Sized so it can be done with your existing team.',
  },
  {
    page: 'Page 4',
    title: '30–90 day plan',
    detail:
      'The build phase — what gets scoped, who owns it, what it costs to build, and what it costs to run once it is live.',
  },
  {
    page: 'Page 5',
    title: '90–180 day plan + ROI statement',
    detail:
      'The longer arc — what compounding looks like, where the second build fits, and a written ROI statement you can hand to a partner, a lender, or your accountant.',
  },
]

const isFor = [
  'You already know AI is on the table and you want a real plan, not more content.',
  'You run a business with 1–50 people and at least one workflow that is bottlenecked or eating your week.',
  'You want a working session with the person who would build the system — not a junior team or a slide deck.',
  'You are happy to spend $500 to get a 5-page roadmap that saves you months of trial and error.',
  'You might want EMVY to build it after — or you might hand the roadmap to your team. Either is fine.',
]

const isNotFor = [
  'You are still deciding whether AI is worth a serious look. Start with the free 2-minute Mini AI Strategy Assessment first.',
  'You want a generic "AI for business" PDF. This is a working session about your specific workflows.',
  'You need a same-day turnaround. The roadmap is delivered within 5 business days of the call.',
  'You want a managed-service retainer before the build. The $500 / month retainer kicks in after a build is live.',
]

const faqs = [
  {
    q: 'Why is it $500?',
    a: 'It is the only structured AI strategy session in the $497–$1,500 price band. Most AU AI consultants charge $750+ (Nimbull) or $1,500+ (FlowWorks) — and they audit your existing AI stack. EMVY assesses whether AI is worth building for your specific workflow first, then delivers a written roadmap you can act on.',
  },
  {
    q: 'What do I actually walk away with?',
    a: 'A 60-minute working session with Dusk (the founder) and a 5-page written roadmap delivered within 5 business days: where you are now, where AI could take you, the 0–30 / 30–90 / 90–180 day pathway, and a build cost + tool cost + ROI statement you can hand to anyone.',
  },
  {
    q: 'Is the $500 credited toward a build?',
    a: 'Yes. If you go on to a $3K+ Build A, B, or C engagement within 60 days of delivery, the $500 AI Strategy fee is credited in full.',
  },
  {
    q: 'What if I do not want to build after the call?',
    a: 'That is a perfectly fine outcome. The roadmap is yours — hand it to your team, your VA, or a builder of your choice. About a third of clients take the roadmap and run with it themselves.',
  },
  {
    q: 'Do I need to be technical?',
    a: 'No. The session is in plain language and the roadmap is written for the operator or owner, not the engineer. If you can describe what is slowing your team down, that is enough.',
  },
  {
    q: 'What if the call does not work for me?',
    a: 'Refundable up to 24 hours before the call. After the call, if the roadmap is not delivered as described, the fee is refunded in full.',
  },
  {
    q: 'How long is the call really?',
    a: '60 minutes. It runs on time and ends on time. If we need another 15 minutes, it is on me.',
  },
  {
    q: 'Do you push a specific platform?',
    a: 'No. EMVY is platform-agnostic. Sometimes the right answer is Zapier, sometimes n8n, sometimes a $20/month off-the-shelf tool, sometimes a custom build. The recommendation follows the problem.',
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Book the call',
    detail: 'Pick a 60-minute slot. Payment is collected when you confirm.',
  },
  {
    number: '02',
    title: 'Pre-call questionnaire',
    detail: 'A short 3-minute form so Dusk walks in already knowing your business.',
  },
  {
    number: '03',
    title: 'The 60-minute session',
    detail: 'A working call on Zoom. No slides. Specific to your workflows.',
  },
  {
    number: '04',
    title: '5-page roadmap',
    detail: 'Delivered within 5 business days. Yours to keep, share, or act on.',
  },
]

export default function AIStrategyCallPage() {
  return (
    <>
      <JsonLd
        data={[
          service(SERVICES['ai-strategy-call']),
          faqPage({ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }),
        ]}
      />
      <PageHero
        eyebrow="AI Strategy Call · $500 AUD"
        title="A 60-minute working session that ends with a 5-page roadmap you can hand to anyone."
        description="For when you already know AI is worth a serious look — and you want a real plan, not another intro call. One session with the founder, a written roadmap within 5 business days, and a clear next move. $500 is credited in full toward any $3K+ build within 60 days."
        image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href={CAL_BOOKING_URL}
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book the strategy call
          <ArrowRight size={16} style={{ marginLeft: 6, verticalAlign: '-2px' }} />
        </a>
        <Link href="/pricing" className="button secondary">
          See full pricing
        </Link>
      </PageHero>

      {/* ----- The honest filter ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Who this is for</p>
          <h2 className="section-title">The $500 fits a specific buyer. Make sure it is you.</h2>
          <p className="section-text">
            A paid strategy call is not the right next step for everyone. Here is the honest split.
          </p>
        </div>
        <div className="about-values">
          <article className="proof-card">
            <p className="section-kicker">This is for you if</p>
            <ul className="detail-list" style={{ gap: '0.75rem' }}>
              {isFor.map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '20px 1fr',
                    alignItems: 'start',
                    gap: '0.6rem',
                    paddingLeft: 0,
                    color: 'var(--text)',
                  }}
                >
                  <span aria-hidden="true" style={{ color: '#4ade80', lineHeight: 1.6 }}>✓</span>
                  <span style={{ lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="proof-card">
            <p className="section-kicker">This is not for you if</p>
            <ul className="detail-list" style={{ gap: '0.75rem' }}>
              {isNotFor.map((item) => (
                <li
                  key={item}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '20px 1fr',
                    alignItems: 'start',
                    gap: '0.6rem',
                    paddingLeft: 0,
                    color: 'var(--text)',
                  }}
                >
                  <span aria-hidden="true" style={{ color: 'var(--muted)', opacity: 0.6, lineHeight: 1.6 }}>–</span>
                  <span style={{ lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ----- What happens in the 60 minutes ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The 60 minutes</p>
          <h2 className="section-title">A working session, not a pitch.</h2>
          <p className="section-text">
            No slides. No "tell me about your business" warm-up. Dusk walks in already knowing your
            workflows from the pre-call questionnaire. The 60 minutes are spent on the work.
          </p>
        </div>
        <div className="lead-grid discovery-outcomes">
          {agenda.map((phase) => (
            <article key={phase.number} className="proof-card discovery-card">
              <div className="discovery-phase">
                <span className="discovery-phase__number">{phase.number}</span>
                <span className="discovery-phase__duration">
                  <Clock size={12} aria-hidden="true" style={{ verticalAlign: '-1px', marginRight: 4 }} />
                  {phase.duration}
                </span>
              </div>
              <h3>{phase.title}</h3>
              <ul className="discovery-list">
                {phase.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ----- The 5-page roadmap ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you walk away with</p>
          <h2 className="section-title">A 5-page written roadmap, delivered within 5 business days.</h2>
          <p className="section-text">
            The roadmap is the product. The call is how we get there. Every page is written for the
            owner or operator — not the engineer — and yours to keep, share, or act on.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {roadmapPages.map((item) => (
            <article key={item.page} className="process-card process-card-strong">
              <span className="section-kicker" style={{ marginBottom: 8 }}>{item.page}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
          <Link href="/pricing" className="button secondary">
            See full pricing
          </Link>
          <Link href="/contact" className="button secondary">
            Questions before booking
          </Link>
        </div>
      </section>

      {/* ----- The 4-step process ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">How it works</p>
          <h2 className="section-title">From booking to roadmap in about a week.</h2>
        </div>
        <div className="lead-grid discovery-outcomes">
          {processSteps.map((step) => (
            <article key={step.number} className="proof-card discovery-card">
              <div className="discovery-phase">
                <span className="discovery-phase__number">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p style={{ color: 'var(--muted-foreground, #94a3b8)', marginTop: '0.5rem' }}>
                {step.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ----- What happens after ----- */}
      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">What happens after</p>
            <h2 className="section-title">Three doors at the end of the call.</h2>
          </div>
          <p className="section-text">
            About a third of clients take the roadmap and run with it themselves — handing it to a
            builder, a VA, or their in-house team. Another third move into a $3K–$5K build with EMVY
            (the $500 is credited in full within 60 days). The final third want ongoing support and
            move to the $500 / month retainer once a build is live.
          </p>
        </div>
        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>Run it yourself</h3>
            <p>
              Take the 5-page roadmap and hand it to your team, a VA, or another builder. No lock-in.
              No follow-up fees.
            </p>
            <Link href="/contact" className="button secondary">
              Ask about this
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>Build with EMVY</h3>
            <p>
              $3K–$5K scoped build from the roadmap. Voice AI, chatbots, workflow automation,
              dashboards. The $500 is credited in full.
            </p>
            <Link href="/services/ai-builds" className="button primary">
              See build tiers
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">03</p>
            <h3>Ongoing support</h3>
            <p>
              $500 / month retainer once a build is live. Workflow monitoring, optimisation, and
              quarterly roadmap updates.
            </p>
            <Link href="/services/systems-maintenance" className="button secondary">
              See retainer details
            </Link>
          </article>
        </div>
      </section>

      {/* ----- FAQ ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">Pricing, scope, and what happens if it does not fit.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ----- Final CTA band ----- */}
      <section className="section cta-band">
        <div>
          <p className="section-kicker">Ready to book</p>
          <h2 className="section-title">Lock in your 60-minute AI strategy session.</h2>
          <p className="section-text">
            $500 paid at confirmation. Refundable up to 24 hours before the call. The roadmap is
            delivered within 5 business days. The fee is credited in full toward any $3K+ build within
            60 days.
          </p>
        </div>
        <div className="hero-actions">
          <a
            className="button primary"
            href={CAL_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            Book the strategy call
          </a>
          <Link href="/assessment" className="button secondary">
            Not sure? Start the free assessment
          </Link>
        </div>
      </section>
    </>
  )
}

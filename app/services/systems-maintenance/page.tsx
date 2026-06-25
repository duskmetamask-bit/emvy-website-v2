import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service, faqPage } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI OS Maintenance — $500/mo retainer to keep your AI operating system running',
  description:
    'Monthly review, daily operating oversight, continuous optimisation, and quarterly evolution. For AI operating systems built by EMVY or taken over after a 1-week audit. Cancel any month.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const pillars = [
  {
    number: '01',
    title: 'Monthly review',
    summary: 'A structured 30-minute call to review how the operating system performed, what is drifting, and what to evolve next.',
    examples: [
      'You bring the OS metrics (call volume, response times, conversion rates, error rates, integrations health)',
      'We bring what was monitored, changed, or fixed across the operating layer since the last review',
      'A short list of agreed optimisations for the next month',
      'A standing time on the calendar so the cadence does not depend on remembering',
    ],
  },
  {
    number: '02',
    title: 'Daily operating oversight',
    summary: 'Continuous oversight of the AI operating system in production. Errors surface fast, not when a customer notices.',
    examples: [
      'Uptime + error tracking on VAPI voice agents, n8n workflows, chatbots, Convex backends — the components of the OS',
      'Daily automated health checks during business hours',
      'Alerting within 1 business hour for urgent failures in the operating layer',
      'A monthly log of what was caught and what was fixed',
    ],
  },
  {
    number: '03',
    title: 'Continuous optimisation',
    summary: 'Small, scoped improvements to the OS each month. The kinds of changes that compound as the operating layer matures.',
    examples: [
      'Tweaks to voice agent prompts based on real call transcripts',
      'Refinements to OS workflow triggers, conditions, and error paths',
      'Performance improvements — speed, accuracy, cost-per-task across the operating layer',
      'Small bug fixes and configuration adjustments included',
    ],
  },
  {
    number: '04',
    title: 'Quarterly evolution',
    summary: 'A 90-minute planning session every quarter to align the next 90 days of OS work with the business.',
    examples: [
      'Review what the AI operating system has done for the business in the last quarter',
      'Identify the next 1–2 components to add or workflows to evolve',
      'Rough cost and scope estimate for any new work',
      'Decide what is in, what is out, and what to revisit next quarter',
    ],
  },
]

const isFor = [
  'You have an AI operating system in production — voice, chat, workflows, integrations working as one — and want someone responsible for keeping it stable and evolving.',
  'You do not want to be the on-call for an OS you do not fully understand. The team that built it should be the team that maintains it.',
  'Your business is growing and the operating layer that worked at 50 calls / week is starting to break at 200. You need the OS to evolve with you.',
  'You want a quarterly evolution conversation, not ad-hoc emergency fixes. Predictable cadence over firefighting.',
  'You can pay $500 / month and cancel any month. No lock-in, no surprises.',
]

const isNotFor = [
  'You have not built or deployed an AI operating system yet. Start with the $500 AI Workflow Audit or a Build A / B / C first — the retainer is for systems already in production.',
  'You want fully-managed 24/7 coverage. The retainer is business-hours oversight + monthly review + quarterly evolution. Fully-managed 24/7 is a different scope, quoted separately.',
  'You built the OS yourself and just want occasional help. The retainer is for ongoing ownership of the operating layer, not ad-hoc consulting.',
  'You need a same-day response on weekends. Business-hours response is included; weekend on-call is not (but can be added for an additional fee).',
]

const faqs = [
  {
    q: 'What is an "AI operating system" maintenance retainer?',
    a: 'It is the ongoing care of the integrated AI layer that runs your business — voice, chat, workflows, data, integrations — working as one. Not isolated tools. The maintenance retainer keeps that OS stable, evolving, and aligned with the business: daily operating oversight, monthly review, continuous optimisation, and a quarterly evolution plan. The team that built the OS (or audited it) stays responsible for it.',
  },
  {
    q: 'Why $500 / month when I could pay a freelancer or use a SaaS subscription?',
    a: 'A freelancer is reactive — they wait for you to spot the problem. A SaaS subscription is a tool, not an outcome — you still have to configure, monitor, and optimise it yourself. The retainer is the team that built (or audited) the AI operating system staying responsible for it: daily operating oversight, prompt refinement, and a quarterly evolution plan that keeps the OS aligned with the business as it grows. Most clients recover the $500 / month in the first avoided outage or first optimised workflow.',
  },
  {
    q: 'What kind of business gets the most value from this retainer?',
    a: 'Businesses with an AI operating system in production that customers, leads, or staff depend on — voice reception, lead pipelines, internal automations, customer-facing chatbots. The sweet spot is 50+ system interactions per week (calls, leads, automated actions) where downtime or quality drift has a real cost. Below that, the runbook is usually enough.',
  },
  {
    q: 'I already have IT support — why would I need EMVY?',
    a: 'General IT support keeps your laptops, network, and SaaS stack running. EMVY maintains the AI operating system specifically — voice agent prompts, workflow triggers, error paths, prompt drift, model cost, integration changes. Different problem, different team. Many retainer clients have both — IT for the stack, EMVY for the OS.',
  },
  {
    q: 'Can I see a sample monthly review call?',
    a: 'Yes — a redacted sample monthly review document is sent on request after the scoping call. The structure: OS metrics you bring, what we monitored, what we changed, agreed optimisations for next month, and any new work to discuss at the quarterly evolution. Most clients spend 10 minutes reviewing the doc and 20 minutes on the call.',
  },
  {
    q: 'What if my business is seasonal — can I pause and resume?',
    a: 'Yes. The retainer is month-to-month — skip any month and re-subscribe when you are ready. Source code, credentials, and runbook are yours regardless. If you re-subscribe within 12 months, the monthly review history is restored and the onboarding handover is shortened.',
  },
  {
    q: 'What is included in the $500 / month?',
    a: 'Four deliverables: a monthly 30-minute review call, continuous operating oversight during business hours, ongoing optimisation (prompt tweaks, workflow refinements, small bug fixes), and a quarterly 90-minute evolution session. The retainer is month-to-month — cancel any month with no exit fee.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Month-to-month. Cancel at the end of any month with no exit fee. Source code, credentials, and runbook are yours to keep regardless. If you cancel and re-subscribe within 60 days, the monthly review history is restored.',
  },
  {
    q: 'What if I did not get my OS from EMVY?',
    a: 'Yes — we maintain third-party AI operating systems after a 1-week audit. The audit fee is $750 (credited toward the first month of retainer if you subscribe). The audit covers a deep read of the existing OS, a written handover document, and a 30-minute call to align on scope before the retainer starts.',
  },
  {
    q: 'What systems do you maintain?',
    a: 'VAPI voice agents (reception, outbound calling, IVR-style flows). n8n and Make workflows. Custom chatbots (Clerk, web embed, WhatsApp). Convex backends. Zapier automations for simple triggers. The OS is platform-agnostic — if it is a no-code or low-code system with an API, we can probably maintain it. Confirm in the scoping call.',
  },
  {
    q: 'What is your response time?',
    a: 'Same-business-day response on weekdays for urgent issues (OS down, broken workflow). 24-hour response for routine requests. Monthly review call is on a standing time agreed at subscription start. Quarterly evolution is booked at the start of each quarter.',
  },
  {
    q: 'Do you do new feature builds under the retainer?',
    a: 'Small fixes and tweaks are included (prompt adjustments, configuration changes, workflow refinements). New feature builds are scoped and quoted separately — typically priced as a Build A / B / C or hourly extension. The quarterly evolution session is where new work is identified and scoped.',
  },
  {
    q: 'How is the monthly review call structured?',
    a: '30 minutes on Zoom. You bring the OS metrics (call volume, response times, conversion rates, error rates, anything you track). We bring a written summary of what was monitored, what was changed, and what was optimised in the last month. We agree on 1–3 optimisations for the next month and any new work to discuss at the next quarterly evolution.',
  },
  {
    q: 'What happens if my OS goes down?',
    a: 'You email or call the dedicated support channel. On-call response within 1 business hour during weekdays. We triage the issue, identify the root cause, and apply a fix in the same call if possible. If the fix is larger, we scope it and report back within 24 hours. Outage incidents are logged in the monthly summary.',
  },
  {
    q: 'How is retainer payment structured?',
    a: '$500 / month, invoiced on the 1st of each month. Payment by bank transfer or card. First month is prorated if you start mid-month. The monthly invoice is auto-generated — no action needed unless you change payment method.',
  },
  {
    q: 'What if I want to add another build during the retainer?',
    a: 'The quarterly evolution is where new builds are scoped. A second Build A / B / C can be commissioned at any time with a 50% deposit. Existing retainer clients get a 10% discount on additional builds (Build A = $2,700, Build B = $3,600, Build C = $4,500).',
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Subscribe',
    detail: 'Sign the retainer agreement. First month invoice issued. Standing monthly review time agreed.',
  },
  {
    number: '02',
    title: 'Onboard',
    detail: 'A 1-hour handover: walk us through the OS components, hand over credentials and access, agree on monitoring scope across the operating layer.',
  },
  {
    number: '03',
    title: 'Oversee',
    detail: 'Daily automated health checks on the OS. Business-hours alerting. Small fixes applied as they surface.',
  },
  {
    number: '04',
    title: 'Review',
    detail: 'Monthly 30-minute call. You bring OS metrics, we bring the written summary. 1–3 optimisations agreed.',
  },
  {
    number: '05',
    title: 'Evolve',
    detail: 'Quarterly 90-minute evolution session. Next 90 days of operating-layer work aligned with the business.',
  },
]

const deliverables = [
  {
    section: '01',
    title: 'Monthly review',
    detail:
      'A structured 30-minute call on a standing time. OS metrics in, summary out, optimisations agreed. Recorded for the team.',
  },
  {
    section: '02',
    title: 'Daily operating oversight',
    detail:
      'Automated health checks on the OS during business hours. Uptime tracking, error alerting, and a log of what was caught across the operating layer.',
  },
  {
    section: '03',
    title: 'Continuous optimisation',
    detail:
      'Prompt tweaks, workflow refinements, small bug fixes. The kinds of small improvements that compound over time and keep the OS aligned with the business.',
  },
  {
    section: '04',
    title: 'Quarterly evolution',
    detail:
      'A 90-minute planning session every 90 days. Next 1–2 components to add or workflows to evolve, rough cost and scope, agree what is in and out for the operating layer.',
  },
]

export default function SystemsMaintenancePage() {
  return (
    <>
      <JsonLd
        data={[
          service(SERVICES['systems-maintenance']),
          faqPage({ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }),
        ]}
      />
      <PageHero
        eyebrow="AI OS Maintenance · $500/mo"
        title="Keep your AI operating system running, evolving, and aligned — without being the on-call yourself."
        description="Monthly review, daily operating oversight, continuous optimisation, and quarterly evolution of your AI operating system. Built by EMVY or maintained after a 1-week audit. Cancel any month."
        image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href={CAL_BOOKING_URL}
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe to the retainer
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
          <h2 className="section-title">An OS retainer fits a specific buyer.</h2>
          <p className="section-text">
            Ongoing care of an AI operating system is not the right next step for every business.
            Here is the honest split.
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

      {/* ----- The 4 pillars ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The 4 pillars</p>
          <h2 className="section-title">What is in the $500 / month.</h2>
          <p className="section-text">
            Every retainer delivers four things — a monthly cadence, continuous operating
            oversight, ongoing optimisation, and a quarterly evolution plan. The pillars are
            fixed; the work inside each one scales to your operating layer.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {pillars.map((pillar) => (
            <article key={pillar.number} className="process-card process-card-strong">
              <span className="section-kicker" style={{ marginBottom: 8 }}>Pillar {pillar.number}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.summary}</p>
              <ul className="detail-list" style={{ marginTop: '0.75rem', gap: '0.4rem' }}>
                {pillar.examples.map((ex) => (
                  <li key={ex} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{ex}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ----- What you walk away with ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you walk away with</p>
          <h2 className="section-title">Four OS maintenance deliverables, every month, every quarter.</h2>
          <p className="section-text">
            The retainer is a fixed monthly deliverable for your AI operating system, not an
            open-ended support contract. Here is what lands on the calendar — and in your inbox
            — every cycle.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {deliverables.map((item) => (
            <article key={item.section} className="process-card process-card-strong">
              <span className="section-kicker" style={{ marginBottom: 8 }}>{item.section}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
          <Link href="/pricing" className="button secondary">
            See full pricing
          </Link>
          <Link href="/services/ai-builds" className="button secondary">
            Not built yet? See build tiers
          </Link>
        </div>
      </section>

      {/* ----- How it works ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">How it works</p>
          <h2 className="section-title">From subscription to first review in one week.</h2>
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
            <h2 className="section-title">Three doors at the end of the retainer.</h2>
          </div>
          <p className="section-text">
            Most clients stay on retainer for 6–18 months — the AI operating system grows with
            the business. At any point, three doors are open: cancel and run the OS yourself,
            add a new build under the retainer discount, or scale up to a fully-managed tier if
            business hours are not enough.
          </p>
        </div>
        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>Cancel any month</h3>
            <p>
              Month-to-month. Cancel at the end of any month with no exit fee. Source code,
              credentials, and runbook are yours to keep regardless.
            </p>
            <Link href="/contact" className="button secondary">
              Ask about this
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>Add another build</h3>
            <p>
              Retainer clients get a 10% discount on additional builds. Build A = $2,700, Build B
              = $3,600, Build C = $4,500. Scoped at the quarterly evolution.
            </p>
            <Link href="/services/ai-builds" className="button primary">
              See build tiers
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">03</p>
            <h3>Scale to fully-managed</h3>
            <p>
              24/7 monitoring, weekend on-call, dedicated engineer. Custom scope and pricing —
              typically $1,500–$3,000 / month depending on OS complexity.
            </p>
            <Link href="/contact" className="button secondary">
              Talk to us
            </Link>
          </article>
        </div>
      </section>

      {/* ----- FAQ ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">What an AI OS maintenance retainer is, scope, response time, and what happens if it does not fit.</h2>
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
          <p className="section-kicker">Ready to subscribe</p>
          <h2 className="section-title">Keep your AI operating system running, evolving, and aligned.</h2>
          <p className="section-text">
            $500 / month. Month-to-month. Cancel any month. The monthly review, daily operating
            oversight, continuous optimisation, and quarterly evolution are included.
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
            Subscribe to the retainer
          </a>
          <Link href="/pricing" className="button secondary">
            See full pricing
          </Link>
        </div>
      </section>
    </>
  )
}
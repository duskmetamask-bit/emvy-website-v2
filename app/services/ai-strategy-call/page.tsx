import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, FileText, ArrowRight } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service, faqPage } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Workflow Audit — $500 for a 60-min call + 8-section automation report',
  description:
    'A paid 60-minute AI workflow audit with EMVY. We map your business across 4 boxes — Leads & Intake, Client Handover, Admin, Resources — score every gap, and deliver an 8-section written report with dollar-first recommendations and a 3-phase build roadmap. Delivered within 5 business days.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const workflowBoxes = [
  {
    number: '01',
    title: 'Leads & Intake',
    summary: 'How customers find you, every channel, response speed, conversion gaps.',
    examples: [
      'Phone, web form, email, walk-in, social, marketplace, referral — every entry point',
      'Speed to first response — minutes, hours, next day',
      'Leads that fell through because no one followed up',
    ],
  },
  {
    number: '02',
    title: 'Client Handover & Delivery',
    summary: 'From commitment to completion — quoting, scheduling, payment, follow-up.',
    examples: [
      'How quotes and orders are priced, who does it, how long it takes',
      'Mid-order changes, quality checks, customer updates',
      'When payment actually lands — and what delays it',
    ],
  },
  {
    number: '03',
    title: 'Admin & Back-Office',
    summary: 'Invoicing, books, compliance, owner admin bleed, the work no one wants.',
    examples: [
      'Invoicing, receipts, supplier bills, payroll — who does it',
      'Compliance, licensing, record-keeping, audit prep',
      'Hours per week the owner spends on work a system should do',
    ],
  },
  {
    number: '04',
    title: 'Resources & Supply',
    summary: 'Equipment, inventory, software, suppliers — what you rely on to deliver.',
    examples: [
      'Physical and digital assets critical to delivery',
      'Stock, materials, parts — how it is tracked and reordered',
      'What breaks or runs out, and what happens to the business when it does',
    ],
  },
]

const agendaSections = [
  {
    number: '01',
    title: 'What the business does',
    duration: '~5 min',
    sections: ['Business context, how you win customers, typical customer profile'],
  },
  {
    number: '02',
    title: 'Leads & Intake',
    duration: '~10 min',
    sections: ['Q3–Q8: every channel, response speed, follow-up gaps, lead qualification'],
  },
  {
    number: '03',
    title: 'Day-to-Day Operations',
    duration: '~15 min',
    sections: ['Q9–Q17: a typical day, communication, decisions, where it breaks'],
  },
  {
    number: '04',
    title: 'Client Handover & Delivery',
    duration: '~10 min',
    sections: ['Q18–Q24: quoting, scheduling, mid-order changes, getting paid'],
  },
  {
    number: '05',
    title: 'Support, Admin, People',
    duration: '~14 min',
    sections: ['Q25–Q40: complaints, repeat revenue, books, compliance, team bottlenecks'],
  },
  {
    number: '06',
    title: 'Systems, Tools, Growth',
    duration: '~5 min',
    sections: ['Q41–Q57: inventory, AI tools already tried, doubled-tomorrow breakage'],
  },
  {
    number: '07',
    title: 'Close + dollar-impact pull',
    duration: '~1 min',
    sections: ['Q58–Q62: "if money was no object", "10 hours back", the single biggest unlock'],
  },
]

const reportSections = [
  {
    section: 'Section 1',
    title: 'Business Context',
    detail:
      'A confident snapshot of what your business does, how it wins work, and what an average job is worth. The framing the rest of the report sits on top of.',
  },
  {
    section: 'Section 2',
    title: 'Operations Map (4-Box)',
    detail:
      'Every gap in every box — Leads & Intake, Client Handover, Admin, Resources — with evidence. If a box has no significant gaps, we say so explicitly.',
  },
  {
    section: 'Section 3',
    title: 'Findings — Dollar-First',
    detail:
      '3 to 5 problems, each with evidence, frequency, and a dollar value. Every finding maps to a workflow box. No finding exists without a number.',
  },
  {
    section: 'Section 4',
    title: 'Recommendations',
    detail:
      'Each finding turned into a specific automation. Section headers lead with the dollar it costs, not the tool name. Confidence is labelled per recommendation.',
  },
  {
    section: 'Section 5',
    title: '3-Phase Implementation Roadmap',
    detail:
      'A staged plan with Phase 1 deliverable within 2–3 weeks. Each phase is gated on the previous one — later phases build on what shipped, not from scratch.',
  },
  {
    section: 'Section 6',
    title: 'Investment & ROI',
    detail:
      'A simple ROI box: current monthly cost, solution cost, payback period, net monthly benefit. The exact arithmetic walked through on the debrief call.',
  },
  {
    section: 'Section 7',
    title: 'Next Steps',
    detail:
      'The single most important action, scoped. Whether you build with EMVY or take the roadmap yourself, the next step is named.',
  },
  {
    section: 'Section 8',
    title: 'Pre-Build Gaps (Appendix)',
    detail:
      'What needs to be true before any build starts — data quality, access, approvals, missing tools. So the build doesn\'t stall halfway through.',
  },
]

const isFor = [
  'You have at least one workflow that is eating your week, leaking leads, or bottlenecking on one person.',
  'You want an automation-first read on your business — voice AI, chatbots, workflow pipelines — not a generic AI strategy PDF.',
  'You can spend 60 minutes going deep on how your business actually runs, including the boring admin parts.',
  'You are happy to spend $500 for a written report that names the dollar impact of each gap and what to fix first.',
  'You might want EMVY to build it after — or you might hand the roadmap to your team. Either is fine.',
]

const isNotFor = [
  'You are still deciding whether AI is worth a serious look. Start with the free 2-minute Mini AI Strategy Assessment first.',
  'You want a generic "AI for business" PDF. This is a working session about your specific workflows.',
  'You need a same-day turnaround. The 8-section report is delivered within 5 business days of the call.',
  'You want a managed-service retainer before the build. The $500 / month retainer kicks in after a build is live.',
]

const faqs = [
  {
    q: 'Is this an AI strategy session or an automation audit?',
    a: 'Both. The output is an 8-section written report called an "AI Workflow Audit." It maps your business across four workflow boxes, scores every gap on Impact × Frequency × Ease, and recommends the specific automations that pay off fastest. The call itself is a 60-minute structured interview — 62 questions across 11 sections, SPIN-driven.',
  },
  {
    q: 'Why is it $500?',
    a: 'It is the only structured AI workflow audit in the $497–$1,500 price band in Australia. Most AU AI consultants charge $750+ (Nimbull) or $1,500+ (FlowWorks) — and they audit your existing AI stack. EMVY assesses whether AI is worth building for your specific workflow first, then delivers a written report you can act on. The fee is credited in full toward any $3K+ build within 60 days.',
  },
  {
    q: 'What do I actually walk away with?',
    a: 'A 60-minute working call with Dusk (the founder) and an 8-section written report delivered within 5 business days: Business Context, Operations Map (4-Box), Findings (dollar-first), Recommendations, 3-Phase Implementation Roadmap, Investment & ROI, Next Steps, and a Pre-Build Gaps appendix. Yours to keep, share, or hand to any builder.',
  },
  {
    q: 'Is the $500 credited toward a build?',
    a: 'Yes. If you go on to a $3K+ Build A, B, or C engagement within 60 days of delivery, the $500 audit fee is credited in full.',
  },
  {
    q: 'What if I do not want to build after the call?',
    a: 'That is a perfectly fine outcome. The report is yours — hand it to your team, your VA, or a builder of your choice. About a third of clients take the roadmap and run with it themselves.',
  },
  {
    q: 'Do I need to be technical?',
    a: 'No. The session is in plain language and the report is written for the operator or owner, not the engineer. If you can describe what is slowing your team down, that is enough.',
  },
  {
    q: 'How is the call structured?',
    a: 'SPIN-based — Situation, Problem, Implication, Needs-Payoff. Every "we struggle with X" gets turned into a dollar value. The 62 questions cover Leads & Intake, Day-to-Day Operations, Client Handover, Support, Admin, People, Resources, Systems, Performance, and Close.',
  },
  {
    q: 'What if the call does not work for me?',
    a: 'Refundable up to 24 hours before the call. After the call, if the report is not delivered as described, the fee is refunded in full.',
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
    title: 'Pre-call context',
    detail: 'A short 3-minute form so Dusk walks in already knowing your business.',
  },
  {
    number: '03',
    title: 'The 60-minute audit',
    detail: 'A working call on Zoom. No slides. SPIN-driven. 62 questions, 11 sections.',
  },
  {
    number: '04',
    title: '8-section report',
    detail: 'Delivered within 5 business days. 4-box operations map, dollar-first findings, 3-phase roadmap.',
  },
  {
    number: '05',
    title: '30-min debrief',
    detail: 'Walk through the report, recalibrate any numbers that feel off, agree on next step.',
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
        eyebrow="AI Workflow Audit · $500 AUD"
        title="A 60-minute audit that maps your business across 4 workflow boxes — and an 8-section report naming the dollar impact of every gap."
        description="For when you already know AI is worth a serious look — and you want a real automation plan, not another intro call. One structured call, a written report within 5 business days, and a clear next move. $500 is credited in full toward any $3K+ build within 60 days."
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
            A paid workflow audit is not the right next step for everyone. Here is the honest split.
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

      {/* ----- The 4 workflow boxes ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The 4 workflow boxes</p>
          <h2 className="section-title">Every audit maps your business across four boxes.</h2>
          <p className="section-text">
            The methodology is fixed — the gaps inside each box are yours. Every recommendation in
            the report lives inside one of these four boxes, with evidence and a dollar impact.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {workflowBoxes.map((box) => (
            <article key={box.number} className="process-card process-card-strong">
              <span className="section-kicker" style={{ marginBottom: 8 }}>Box {box.number}</span>
              <h3>{box.title}</h3>
              <p>{box.summary}</p>
              <ul className="detail-list" style={{ marginTop: '0.75rem', gap: '0.4rem' }}>
                {box.examples.map((ex) => (
                  <li key={ex} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{ex}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ----- The 60 minutes ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The 60 minutes</p>
          <h2 className="section-title">A working session, not a pitch.</h2>
          <p className="section-text">
            No slides. No "tell me about your business" warm-up. Dusk walks in already knowing your
            workflows from the pre-call form. The 60 minutes are spent on the work — 62 questions,
            SPIN-driven (Situation → Problem → Implication → Needs-Payoff), with every answer turned
            into a dollar value where it counts.
          </p>
        </div>
        <div className="lead-grid discovery-outcomes">
          {agendaSections.map((phase) => (
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
                {phase.sections.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ----- The 8-section report ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you walk away with</p>
          <h2 className="section-title">An 8-section written report, delivered within 5 business days.</h2>
          <p className="section-text">
            The report is the product. The call is how we get there. Every section is written for
            the owner or operator — not the engineer — and yours to keep, share, or act on.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {reportSections.map((item) => (
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
          <Link href="/contact" className="button secondary">
            Questions before booking
          </Link>
        </div>
      </section>

      {/* ----- The 5-step process ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">How it works</p>
          <h2 className="section-title">From booking to report in about a week.</h2>
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
            About a third of clients take the report and run with it themselves — handing it to a
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
              Take the 8-section report and hand it to your team, a VA, or another builder. No
              lock-in. No follow-up fees.
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
          <h2 className="section-title">Methodology, scope, and what happens if it does not fit.</h2>
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
          <h2 className="section-title">Lock in your 60-minute AI workflow audit.</h2>
          <p className="section-text">
            $500 paid at confirmation. Refundable up to 24 hours before the call. The 8-section
            report is delivered within 5 business days. The fee is credited in full toward any $3K+
            build within 60 days.
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
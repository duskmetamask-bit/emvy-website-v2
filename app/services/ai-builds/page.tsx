import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'
import PageHero from '../../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service, faqPage } from '@/lib/schema/jsonld'
import { SERVICES } from '@/lib/schema/service-data'

export const metadata: Metadata = {
  title: 'AI Builds — build your AI operating system. $3K–$5K fixed tiers.',
  description:
    'Build the AI operating system for your business — voice AI, chatbots, and workflows that run as one integrated layer. Three fixed tiers (Entry OS, Mid OS, Full OS) shipped in 2–4 weeks, owned by your team on day one. The $500 AI Strategy fee is credited in full toward any $3K+ build within 60 days.',
}

const CAL_BOOKING_URL = 'https://cal.com/jake-emvy/ai-strategy'

const buildTiers = [
  {
    name: 'Build A',
    tierLabel: 'Entry OS',
    price: '$3,000',
    pitch: 'One core system, integrated.',
    scope: [
      'Voice agent OR chatbot (one, your pick) — the customer-facing layer',
      'One n8n workflow automating a clear business outcome — the operating layer behind it',
      'VPS setup + hosting configured — the infrastructure',
      '30-minute team training session',
      'Runbook + 30-day post-launch support',
    ],
    bestFor: 'Businesses starting their first AI OS — one clear pain point, one system, integrated and ready to run.',
  },
  {
    name: 'Build B',
    tierLabel: 'Mid OS',
    price: '$4,000',
    pitch: 'Two systems + automation.',
    scope: [
      'Voice AI reception OR outbound calling — primary system',
      'SMS integrations (Twilio or equivalent) — the connective layer',
      'Second system — chatbot, internal tool, or dashboard',
      '1-hour team training session',
      'Full runbook + 30-day post-launch support',
    ],
    bestFor: 'Two clear pain points ready to fix at once, or a voice-led business that needs the call flow + the data behind it as one operating layer.',
  },
  {
    name: 'Build C',
    tierLabel: 'Full OS',
    price: '$5,000',
    pitch: 'Full operating layer.',
    scope: [
      '3+ n8n workflows wired together — the operating backbone',
      'Fully-configured VAPI voice agent — the customer-facing layer',
      'Multiple integrations (CRM, calendar, email, Convex backend if needed) — the connective tissue',
      '90-minute team training session',
      'Full runbook + 30-day post-launch support',
    ],
    bestFor: 'A full AI operating system — multiple workflows, multiple channels, and the integrations that tie them into one layer the business runs on.',
  },
]

const isFor = [
  'You have completed the $500 AI Workflow Audit (or a similar automation roadmap) and know which workflows to fix first.',
  'You want to build an AI operating system — not isolated tools. Voice, chatbot, and workflows that talk to each other as one layer.',
  'You can give us decision-making access during the build (workflow owner, not a committee).',
  'You are happy to invest $3K–$5K in a fixed-scope build that ships in 2–4 weeks.',
  'You want to own the system on day one — full source, credentials, runbook, training. No vendor lock-in.',
]

const isNotFor = [
  'You are still exploring whether AI is worth a serious look. Start with the $500 AI Workflow Audit, or the free 2-minute Mini AI Strategy Assessment.',
  'You want one-off tools that do not connect. The OS tiers are for integrated systems — single isolated tools are scoped separately.',
  'You want a same-week turnaround. Builds ship in 2–4 weeks depending on tier and integrations.',
  'You want ongoing management included in the build price. The $500 / month retainer kicks in after the OS is live.',
]

const faqs = [
  {
    q: 'What is an "AI operating system" for a small business?',
    a: 'It is the integrated layer of AI-powered systems that runs your day-to-day operations — voice, chat, workflows, data, integrations — working as one. Not isolated tools. The customer-facing channels (phone, web, SMS) talk to the operating workflows (lead intake, quoting, scheduling, follow-up) which talk to the back-office (invoicing, CRM, calendar). One OS, multiple components, one team running it. That is what EMVY builds.',
  },
  {
    q: 'Why pay $3K–$5K for an OS when I could hire a VA or use Zapier?',
    a: 'A VA follows your instructions every time. A $3K–$5K build replaces the instructions with an integrated system — and runs 24/7 without breaks, sick days, or onboarding new hires. Zapier is one of the tools we use inside OS builds; the build itself is the workflow design, the integrations, the QA, the runbook, and the 30 days of support. The first month usually pays for the OS in recovered hours.',
  },
  {
    q: 'Do I need all three tiers (Entry, Mid, Full) or can I start with one?',
    a: 'You start with one. Most businesses begin with Entry OS (Build A) — one core system integrated and running. As the business grows and the OS proves its value, you add to it: another build, another component, another workflow. The tiers are designed to stack. Many clients do Entry OS first, then Mid OS 3–6 months later when the second pain point is ready to fix.',
  },
  {
    q: 'Which build tier do I need — A, B, or C?',
    a: 'Start with one workflow, one system, one clear outcome — that is Build A. If you have two clear pain points ready at once, or a voice-led business that needs both call handling and the data behind it, Build B. If you have a full automation vision (3+ workflows, multiple integrations, Convex backend), Build C. The $500 AI Workflow Audit, if completed, names which tier fits before you book.',
  },
  {
    q: 'How is this different from hiring on Upwork or Fiverr?',
    a: 'Upwork and Fiverr match you with whoever applies. EMVY starts with the $500 AI Workflow Audit (or your existing roadmap), scopes the build to a fixed tier with named deliverables and a fixed price, and owns the outcome end-to-end. You are not project-managing a freelancer — you are buying a finished operating layer with a runbook, training, and 30 days of post-launch support.',
  },
  {
    q: 'Can I see examples of AI operating systems EMVY has built?',
    a: 'Yes — case studies are added to the website as they ship. Recent builds include a VAPI voice-reception + n8n lead pipeline for a home services business (Build B), a chatbot-to-Convex booking system for a B2B consultancy (Build A), and a multi-workflow automation OS for a property manager (Build C). Ask on the scoping call for examples most relevant to your workflow.',
  },
  {
    q: 'Will the AI OS replace my team?',
    a: 'No — it replaces the work your team should not be doing: missed calls, slow responses, manual data entry, repetitive follow-ups, after-hours coverage. Your team focuses on the work that needs a human. Most clients re-deploy the recovered hours into sales, customer relationships, or growth — not headcount cuts.',
  },
  {
    q: 'What if the build does not work for my business?',
    a: 'Build A: 50% deposit is fully refundable up to 7 days before build start. Build B and C: same — deposit refundable within 7 days, then work-to-date is non-refundable. If the delivered system does not match the scoped runbook at the staging review, we fix it before launch. After launch, the 30-day post-launch support covers anything needed to make the system work as designed.',
  },
  {
    q: 'How long does a build actually take?',
    a: 'Build A typically ships in 2 weeks. Build B in 2–3 weeks. Build C in 3–4 weeks. Timelines depend on integrations (calendar, CRM, payment, telephony), how fast we get access to the accounts we need, and how quickly your team reviews the staging environment.',
  },
  {
    q: 'What if my workflow does not fit A, B, or C?',
    a: 'About a quarter of builds are custom. The scope is reviewed on a 30-minute scoping call, then quoted as a fixed-price build or a $X/hour extension on the closest tier. No surprises — the quote is in writing before any work starts.',
  },
  {
    q: 'Is the $500 AI Strategy fee credited?',
    a: 'Yes. If you have completed the $500 AI Workflow Audit within the last 60 days, the full $500 is credited toward any $3K+ Build A / B / C engagement. Effective price: Build A = $2,500, Build B = $3,500, Build C = $4,500.',
  },
  {
    q: 'Do you push a specific platform?',
    a: 'No. EMVY is platform-agnostic. We recommend the right tool for the right problem — sometimes n8n, sometimes VAPI, sometimes Convex, sometimes Make, sometimes an off-the-shelf product. The recommendation follows the workflow, not the other way around.',
  },
  {
    q: 'Who owns the OS after the build?',
    a: 'You do. Full source code, credentials, runbook, training video, and 30 days of post-launch support. The system runs on infrastructure you control (or we manage under the retainer). No vendor lock-in — you can hand the runbook to any builder and they can pick it up.',
  },
  {
    q: 'Can my team run the OS without me?',
    a: 'Yes — that is the point. The runbook, training video, and 30-day post-launch support are designed to hand the operating layer to your team. After handover, the team can run day-to-day, apply the documented tweaks, and answer the common "what does this button do" questions. You are not the on-call for the OS — your team is.',
  },
  {
    q: 'What happens after the 30-day support ends?',
    a: 'Three options: run it yourself with the runbook and your team; subscribe to the $500 / month Systems Maintenance retainer to keep EMVY responsible for ongoing monitoring and optimisation; or commission another build to extend the OS. There is no auto-renewal and no surprise fees.',
  },
  {
    q: 'Can you take over an OS you did not build?',
    a: 'Yes, after a 1-week audit. If you have an existing VAPI voice agent, n8n workflow, or chatbot built by someone else and want EMVY to take it over, the audit fee is $750 (credited toward the first month of retainer if you subscribe). The audit gives us the operating context to maintain the OS as if we had built it.',
  },
  {
    q: 'How is payment structured?',
    a: '50% on signing, 50% on delivery. Payment is by invoice (bank transfer or card). The 50% deposit is refundable up to 7 days before build start; after build start, work-to-date is non-refundable.',
  },
]

const deliverables = [
  {
    section: '01',
    title: 'The AI operating layer',
    detail:
      'Voice agent, chatbot, and/or n8n workflows — the actual working components of your OS, deployed to production and integrated with each other. Live, tested, and signed off in the staging review.',
  },
  {
    section: '02',
    title: 'Integrations',
    detail:
      'CRM, calendar, email, payment, SMS — wired in and tested. The connective tissue between the OS and the rest of your stack, configured so the operating layer runs as one.',
  },
  {
    section: '03',
    title: 'Hosting + infrastructure',
    detail:
      'VPS setup, domains, environment variables, secret management. The OS runs on infrastructure you control. Credentials are handed over on delivery.',
  },
  {
    section: '04',
    title: 'Runbook',
    detail:
      'A written operational guide: how the OS works, where to change common settings, how to debug failures, who to call if something breaks. Written for the operator, not the engineer.',
  },
  {
    section: '05',
    title: 'Team training',
    detail:
      '30 to 90 minutes (depending on tier) of structured training with the people who will run the OS day to day. Recorded for future hires.',
  },
  {
    section: '06',
    title: '30-day post-launch support',
    detail:
      'Bug fixes, configuration tweaks, and small adjustments. Anything to make the OS work as designed. After 30 days, the $500 / month retainer is optional.',
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Confirm the tier',
    detail: 'A 15-minute call to confirm Entry OS, Mid OS, or Full OS — and that the scope matches your tier.',
  },
  {
    number: '02',
    title: 'Kickoff + access',
    detail: 'You grant access to the accounts we need (CRM, telephony, hosting). We confirm the timeline in writing.',
  },
  {
    number: '03',
    title: 'Build + staging review',
    detail: 'We build in staging. You review against the runbook. Two review checkpoints at the 50% and 90% marks.',
  },
  {
    number: '04',
    title: 'Launch + training',
    detail: 'Cutover to production. 30-minute to 90-minute team training (depending on tier). Runbook delivered.',
  },
  {
    number: '05',
    title: '30 days of post-launch support',
    detail: 'Bug fixes, tweaks, configuration adjustments. Anything needed to make the OS work as designed.',
  },
]

export default function AIBuildsPage() {
  return (
    <>
      <JsonLd
        data={[
          service(SERVICES['ai-builds']),
          faqPage({ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }),
        ]}
      />
      <PageHero
        eyebrow="AI Builds · $3K–$5K"
        title="Build your AI operating system — the integrated layer that runs your business."
        description="Voice AI, chatbots, and workflows working as one. Three fixed tiers (Entry OS, Mid OS, Full OS) shipped in 2–4 weeks, owned by your team on day one. $500 audit fee credited in full if a build starts within 60 days."
        image="https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1800&q=90&auto=format&fit=crop"
      >
        <a
          href={CAL_BOOKING_URL}
          className="button primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a build scoping call
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
          <h2 className="section-title">An AI operating system fits a specific buyer.</h2>
          <p className="section-text">
            The OS tiers cover the most common shapes — one integrated layer, two layers, or a
            full automation backbone. If yours is unusual, we scope-and-quote — but here is the
            honest split for the standard tiers.
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

      {/* ----- The 3 OS tiers ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The 3 OS tiers</p>
          <h2 className="section-title">Entry OS, Mid OS, or Full OS — fixed scope, fixed price.</h2>
          <p className="section-text">
            The tiers cover the most common shapes for a small business AI operating layer: one
            integrated component, two components, or a full automation backbone. About a quarter
            of builds are custom — scoped separately after a 30-minute call.
          </p>
        </div>
        <div className="process-grid process-grid-strong">
          {buildTiers.map((tier) => (
            <article key={tier.name} className="process-card process-card-strong">
              <span className="section-kicker" style={{ marginBottom: 8 }}>{tier.tierLabel}</span>
              <h3 style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                {tier.price}
                <span style={{ fontSize: '0.95rem', color: 'var(--muted)', fontWeight: 400 }}>
                  {tier.pitch}
                </span>
              </h3>
              <ul className="detail-list" style={{ marginTop: '0.75rem', gap: '0.4rem' }}>
                {tier.scope.map((item) => (
                  <li key={item} style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
              <p style={{ marginTop: '0.85rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                <strong>Best for:</strong> {tier.bestFor}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ----- What you walk away with ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">What you walk away with</p>
          <h2 className="section-title">Your operating system, the runbook, the training, and 30 days of support.</h2>
          <p className="section-text">
            The deliverable is not a slide deck. It is a working AI operating layer in production,
            with the documentation and training your team needs to run it on day one.
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
          <Link href="/services/ai-strategy-call" className="button secondary">
            Skip the audit — already scoped?
          </Link>
        </div>
      </section>

      {/* ----- How it works ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">How it works</p>
          <h2 className="section-title">From booking to launch in 2–4 weeks.</h2>
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
            <h2 className="section-title">Three doors at the end of the build.</h2>
          </div>
          <p className="section-text">
            About a third of clients run the OS themselves with the runbook and their team.
            Another third subscribe to the $500 / month retainer once the OS is live. The final
            third extend with another build — a second workflow, a new channel, or a fresh
            automation layer added to the same operating layer.
          </p>
        </div>
        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>Run it yourself</h3>
            <p>
              The OS, runbook, and training are yours. Hand the runbook to any builder if you
              need changes. No lock-in, no follow-up fees.
            </p>
            <Link href="/contact" className="button secondary">
              Ask about this
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>$500 / month retainer</h3>
            <p>
              Systems Maintenance once the OS is live. Daily monitoring, monthly review, ongoing
              optimisation, and quarterly evolution of the operating layer.
            </p>
            <Link href="/services/systems-maintenance" className="button primary">
              See retainer details
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">03</p>
            <h3>Add another build</h3>
            <p>
              A second workflow, a new channel, or a fresh automation layer. Builds stack —
              Entry OS + Entry OS is often the answer to a multi-workflow business.
            </p>
            <Link href="/services/ai-strategy-call" className="button secondary">
              Start with an audit
            </Link>
          </article>
        </div>
      </section>

      {/* ----- FAQ ----- */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">What an AI operating system is, scope, timeline, and what happens if it does not fit.</h2>
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
          <p className="section-kicker">Ready to build</p>
          <h2 className="section-title">Pick an OS tier and ship in 2–4 weeks.</h2>
          <p className="section-text">
            $500 AI Strategy fee credited in full toward any $3K+ build within 60 days. 50% on
            signing, 50% on delivery. The runbook and 30 days of post-launch support included.
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
            Book a build scoping call
          </a>
          <Link href="/pricing" className="button secondary">
            See full pricing
          </Link>
        </div>
      </section>
    </>
  )
}
import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'
import JsonLd from '@/components/JsonLd'
import { service, faqPage } from '@/lib/schema/jsonld'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'EMVY pricing: free Mini AI Strategy Assessment, $500 AI Strategy, $3K–$5K builds, $500/mo retainer. The only structured AI readiness assessment in the $497–$1,500 band.',
}

type Tier = {
  name: string
  price: string
  cadence: string
  description: string
  href: string
  ctaLabel: string
  highlight?: boolean
}

const tiers: Tier[] = [
  {
    name: 'Mini AI Strategy Assessment',
    price: 'Free',
    cadence: '2 minutes',
    description:
      '13 questions. Instant AI readiness report in your inbox. The fastest way to see whether AI is worth a serious look for your business.',
    href: '/assessment',
    ctaLabel: 'Start the assessment',
  },
  {
    name: 'Discovery Call',
    price: 'Free',
    cadence: '15 minutes',
    description:
      'A short, no-pitch call to understand your business, your biggest admin drain, and whether EMVY is the right fit for what you actually need.',
    href: '/services/discovery-call',
    ctaLabel: 'Book a discovery call',
  },
  {
    name: 'AI Strategy',
    price: '$500',
    cadence: '60 min + written roadmap',
    description:
      'A paid 60-minute session that maps your workflow and delivers a 5-page written roadmap: 0–30 / 30–90 / 90–180 day plan with build cost, tool cost, and ROI.',
    href: '/services/ai-strategy-call',
    ctaLabel: 'Book the $500 AI Strategy',
    highlight: true,
  },
  {
    name: 'AI Build (A / B / C)',
    price: '$3K–$5K',
    cadence: 'Scoped from your AI Strategy',
    description:
      'Implementation of the systems from your roadmap — voice AI, chatbots, workflow automation, dashboards. $500 AI Strategy fee credited toward any build.',
    href: '/services/ai-builds',
    ctaLabel: 'See build tiers',
  },
  {
    name: 'Retainer',
    price: '$500/mo',
    cadence: 'Ongoing',
    description:
      'Monthly review call, workflow monitoring, optimisation, and quarterly roadmap updates. For businesses that want EMVY involved after launch.',
    href: '/services/systems-maintenance',
    ctaLabel: 'See retainer details',
  },
]

const buildTiers = [
  {
    name: 'Build A',
    price: '$3,000',
    body: 'One system — voice agent OR chatbot. One n8n workflow, VPS setup, 30-min training, runbook + 30-day support.',
  },
  {
    name: 'Build B',
    price: '$4,000',
    body: 'Two systems + automation. Voice AI reception or outbound calling, SMS integrations, 1-hour training, full runbook.',
  },
  {
    name: 'Build C',
    price: '$5,000',
    body: 'Full setup — 3+ n8n workflows, fully-configured VAPI voice agent, multiple integrations, Convex backend if needed, 90-min training.',
  },
]

const faqs = [
  {
    q: 'Why $500 for the AI Strategy?',
    a: "It's the only structured AI readiness assessment in the $497–$1,500 price band. Most AU AI consultants charge $750+ (Nimbull) or $1,500+ (FlowWorks) — and they audit your existing AI stack. EMVY assesses whether AI is worth building for your specific workflow first.",
  },
  {
    q: "What's included in the $500 AI Strategy?",
    a: 'A 60-minute working session with Dusk (the founder) plus a 5-page written roadmap delivered within 5 business days: where you are now, where AI could take you, the 0–30 / 30–90 / 90–180 day pathway, build cost + tool cost + ROI statement.',
  },
  {
    q: 'Is the $500 credited toward a build?',
    a: 'Yes. If you go on to a $3K+ Build A / B / C engagement within 60 days of delivery, the $500 AI Strategy fee is credited in full.',
  },
  {
    q: 'Do you push a specific platform (Zapier, n8n, Make)?',
    a: 'No. EMVY is platform-agnostic. We recommend the right tool for the right problem — sometimes that\'s Zapier, sometimes n8n, sometimes a $20/month setup, sometimes a custom build.',
  },
  {
    q: 'What\'s the difference between the Assessment and the AI Strategy?',
    a: 'The Mini AI Strategy Assessment is a free, self-serve 13-question check you do in 2 minutes — it tells you roughly where AI is worth a deeper look. The AI Strategy is a $500 working session with Dusk that produces a written roadmap you can hand to anyone.',
  },
]

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          service({
            name: 'AI Strategy',
            description: '$500, 60-minute AI readiness assessment with a 5-page written roadmap.',
            url: 'https://emvyai.com/services/ai-strategy-call',
            serviceType: 'AI consulting',
          }),
          faqPage(faqs),
        ]}
      />
      <PageHero
        eyebrow="Pricing"
        title="$500 for the only structured AI readiness assessment in this price band."
        description="Readiness first. Then build, only if it's worth it. Platform-agnostic, honest pricing, real outcomes — no $5K PDF roadmaps you don't use."
        image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/assessment" className="button light">
          Start free assessment
        </Link>
        <Link href="/services/ai-strategy-call" className="button secondary">
          Book $500 AI Strategy
        </Link>
      </PageHero>

      <section className="section" id="pricing">
        <div className="section-header">
          <p className="section-kicker">Pricing at a glance</p>
          <h2 className="section-title">Start free. Pay $500 if you want the strategy. Pay $3K–$5K if you want us to build it.</h2>
          <p className="section-text">
            Every engagement is sized to the work — no surprise retainers, no locked-in minimums. Cancel the retainer any month.
          </p>
        </div>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`proof-card pricing-card ${tier.highlight ? 'pricing-card--highlight' : ''}`}
            >
              <p className="section-kicker">{tier.name}</p>
              <p className="pricing-card__price">{tier.price}</p>
              <p className="pricing-card__cadence">{tier.cadence}</p>
              <p>{tier.description}</p>
              <Link href={tier.href} className={`button ${tier.highlight ? 'primary' : 'secondary'}`}>
                {tier.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Build tiers</p>
          <h2 className="section-title">$3K, $4K, or $5K — sized to what your roadmap actually calls for.</h2>
          <p className="section-text">
            Every build is scoped from the AI Strategy. The fee is the fee — no hourly billing, no scope-creep invoices.
          </p>
        </div>

        <div className="about-values">
          {buildTiers.map((tier) => (
            <article key={tier.name} className="proof-card">
              <p className="section-kicker">{tier.name}</p>
              <p className="pricing-card__price" style={{ fontSize: '1.75rem' }}>{tier.price}</p>
              <p>{tier.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header dual">
          <div>
            <p className="section-kicker">Why $500</p>
            <h2 className="section-title">The $497–$1,500 audit band is empty. We're filling it.</h2>
          </div>
          <p className="section-text">
            Most AU AI consultancies either charge $750+ to audit what you already have (Nimbull), $1,500+ for a readiness check (FlowWorks), or $5K+ to build something you might not even need (Source Digital, Enterprise Monkey). EMVY sits at $500 with the only structured readiness assessment in this band — and the only one platform-agnostic enough to recommend the right tool for the job.
          </p>
        </div>

        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>Not sure if you need it?</h3>
            <p>
              Start with the free 2-minute Mini AI Strategy Assessment. We'll tell you whether AI is worth a deeper look — or whether you should keep your money.
            </p>
            <Link href="/assessment" className="button primary">
              Start free assessment
            </Link>
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>Ready for the full strategy?</h3>
            <p>
              $500 gets you a 60-min working session with Dusk and a 5-page written roadmap. The fee is credited toward any $3K+ build within 60 days.
            </p>
            <Link href="/services/ai-strategy-call" className="button primary">
              Book $500 AI Strategy
            </Link>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">Pricing, honestly.</h2>
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
    </>
  )
}
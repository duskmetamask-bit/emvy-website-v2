import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'The EMVY Newsletter — AI for Australian small business, weekly',
  description:
    "A plain-spoken weekly brief on the tools, prices, and workflows that move the needle. Written by Maya, EMVY's content lead.",
  alternates: { canonical: 'https://emvyai.com/newsletter' },
  openGraph: {
    title: 'The EMVY Newsletter — AI for Australian small business, weekly',
    description:
      'A plain-spoken weekly brief on the tools, prices, and workflows that move the needle.',
    url: 'https://emvyai.com/newsletter',
    siteName: 'EMVY',
    type: 'website',
    images: [{ url: 'https://emvyai.com/brand/exports/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The EMVY Newsletter — AI for Australian small business, weekly',
    description:
      'A plain-spoken weekly brief on the tools, prices, and workflows that move the needle.',
  },
}

const SAMPLE_BULLETS: ReadonlyArray<{ tag: string; title: string }> = [
  {
    tag: 'Tool',
    title:
      'The AI receptionist that handles after-hours calls for a Sydney plumber — what it costs, what it books, what it misses.',
  },
  {
    tag: 'Build',
    title:
      'Why a 4-person accounting firm replaced their intake form with a chatbot — and what they learned about data capture.',
  },
  {
    tag: 'Pattern',
    title:
      'A prompt that turns 6 months of client emails into a 1-page weekly summary. Copy it, paste it, ship it.',
  },
  {
    tag: 'Numbers',
    title:
      'What a $300/mo AI tool stack actually replaces — the cost math for a 3-person services business.',
  },
]

export default function NewsletterPage() {
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'The EMVY Newsletter',
    description:
      'A plain-spoken weekly brief on the tools, prices, and workflows that move the needle for Australian small business.',
    url: 'https://emvyai.com/newsletter',
  } as const

  return (
    <div className="section" style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <JsonLd data={webPage} />

      <p className="section-kicker">Newsletter</p>
      <h1
        style={{
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: 600,
          lineHeight: 1.1,
          marginBottom: 16,
        }}
      >
        AI for Australian small business, in your inbox each week.
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.5, marginBottom: 8 }}>
        A plain-spoken weekly brief on the tools, prices, and workflows that move the needle. No
        sponsored placements, no recycled listicles — just the things we wish someone had sent us
        when we were starting out.
      </p>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          margin: '56px 0 12px',
          letterSpacing: '-0.01em',
        }}
      >
        What it is
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
        One email each Friday. About five minutes to read. Each issue covers one tool or workflow we
        tested, one build note from a real client engagement, and one prompt or pattern you can use
        the same day. Sent by EMVY, an Australian AI consultancy that builds operating systems for
        small business.
      </p>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          margin: '48px 0 12px',
          letterSpacing: '-0.01em',
        }}
      >
        A peek at issue 1
      </h2>
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            background:
              'linear-gradient(135deg, rgba(86, 217, 255, 0.06) 0%, rgba(154, 241, 255, 0.02) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Subject
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, margin: '2px 0 0', color: 'var(--text)' }}>
              Issue 1 — AI for the phone-first business
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Friday · 5 min read</p>
        </div>
        <div style={{ padding: '8px 20px 16px' }}>
          {SAMPLE_BULLETS.map((b, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '12px 0',
                borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: 'rgba(86, 217, 255, 0.1)',
                  color: 'var(--accent)',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {b.tag}
              </span>
              <p style={{ fontSize: 15, color: 'var(--text)', margin: 0, lineHeight: 1.55 }}>
                {b.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 56,
          padding: 32,
          border: '1px solid var(--accent)',
          borderRadius: 12,
          background:
            'linear-gradient(135deg, rgba(86, 217, 255, 0.06) 0%, rgba(154, 241, 255, 0.02) 100%)',
          textAlign: 'center',
        }}
      >
        <p className="section-kicker" style={{ marginBottom: 8 }}>
          Subscribe
        </p>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 8px',
            letterSpacing: '-0.01em',
          }}
        >
          Coming soon.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            margin: '0 0 20px',
            lineHeight: 1.55,
          }}
        >
          The subscribe form is in build. In the meantime, the blog is updated daily — same voice, no
          inbox commitment.
        </p>
        <Link
          href="/blog"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: 'var(--accent)',
            color: '#0a0e14',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Read the blog →
        </Link>
      </div>

      <p
        style={{
          marginTop: 48,
          fontSize: 13,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        Written by Maya, EMVY&apos;s content lead.
      </p>

      <p
        style={{
          marginTop: 32,
          fontSize: 14,
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}
      >
        Want help applying any of this?{' '}
        <Link href="/services/ai-strategy-call" style={{ color: 'var(--accent)' }}>
          Book a $500 Strategy Call →
        </Link>
      </p>
    </div>
  )
}

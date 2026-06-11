import type { Metadata } from 'next'

// /assessment — the EMVY Mini AI Audit chatbot. Renders the standalone
// chatbot app (deployed at emvy-audit-chatbot.vercel.app) full-viewport
// via iframe. The site chrome (header/footer) is suppressed for this route
// in components/SiteChrome.tsx so the chatbot owns the entire viewport.

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_AUDIT_CHATBOT_URL ||
  'https://emvy-audit-chatbot.vercel.app'

export const metadata: Metadata = {
  title: 'Mini AI Audit',
  description:
    'A 5-minute Mini AI Audit for your business. Answer 13 questions, get a personalised 30/60/90 day AI roadmap. Built by EMVY.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'EMVY Mini AI Audit',
    description:
      'A 5-minute Mini AI Audit. Personalised 30/60/90 day AI roadmap in your inbox.',
    url: 'https://emvyai.com/assessment',
    siteName: 'EMVY',
    type: 'website',
  },
}

export default function AssessmentPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        background: '#0A1118',
        zIndex: 1,
      }}
    >
      <iframe
        src={CHATBOT_URL}
        title="EMVY Mini AI Audit"
        allow="clipboard-write"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}

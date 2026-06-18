import type { Metadata } from 'next'

// /assessment — the EMVY Mini AI Strategy Assessment chatbot. Renders the
// standalone chatbot app (deployed at emvy-audit-chatbot.vercel.app) full-
// viewport via iframe. The site chrome (header/footer) is suppressed for
// this route in components/SiteChrome.tsx so the chatbot owns the entire
// viewport.

const CHATBOT_URL =
  process.env.NEXT_PUBLIC_AUDIT_CHATBOT_URL ||
  'https://emvy-audit-chatbot.vercel.app'

export const metadata: Metadata = {
  title: 'Mini AI Strategy Assessment',
  description:
    'A free 2-minute Mini AI Strategy Assessment for your business. Answer 13 questions, get a personalised AI strategy report. Built by EMVY.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'EMVY Mini AI Strategy Assessment',
    description:
      'A free 2-minute Mini AI Strategy Assessment. Personalised AI strategy report in your inbox.',
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
        title="EMVY — Mini AI Strategy Assessment"
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

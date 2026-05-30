import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../../components/PageHero'

export const metadata: Metadata = {
  title: 'Security',
  description: 'Security, governance, and sensible controls for AI delivery.',
}

export default function WhyAISecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security"
        title="Security, governance, and sensible controls."
        description="Trust is part of the service. This page can grow into the supporting detail for data handling, access, review, and rollout controls."
        image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services/discovery-call" className="button light">
          Book Free Discovery Call
        </Link>
        <Link href="/why-ai" className="button secondary">
          Back to Why AI
        </Link>
      </PageHero>
    </>
  )
}

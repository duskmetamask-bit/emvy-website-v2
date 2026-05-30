import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '../../components/PageHero'
import OperationsAuditQuiz from '../../components/OperationsAuditQuiz'

export const metadata: Metadata = {
  title: 'Assessment',
  description: 'Take the EMVY assessment to get a score, a breakdown, and a useful next step.',
}

export default function AssessmentPage() {
  return (
    <>
      <PageHero
        eyebrow="Mini Ops Assessment"
        title="Find out where AI can help your business."
        description="Answer a few questions to get a clear direction on your next step, whether that is a discovery call, assessment, or build."
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/services" className="button light">
          View services
        </Link>
        <Link href="/contact" className="button secondary">
          Contact us
        </Link>
      </PageHero>
      <OperationsAuditQuiz />
    </>
  )
}

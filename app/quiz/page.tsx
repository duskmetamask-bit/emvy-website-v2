import type { Metadata } from 'next'
import OperationsAuditQuiz from '../../components/OperationsAuditQuiz'

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Take the EMVY quiz to get a score, a breakdown, and a useful next step.',
}

export default function QuizPage() {
  return <OperationsAuditQuiz />
}

import type { Metadata } from 'next'
import PublicPage from '@/components/PublicPage'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn how EMVY approaches AI workflow systems for Australian small businesses.',
}

export default function AboutPage() {
  return <PublicPage label="About EMVY" title="AI systems should make the work clearer, not more complicated." description="EMVY is an AI consultancy for Australian small businesses. The focus is practical workflow systems: understand the work, build what helps, then improve it over time." items={[
    { title: 'Workflow before tools', body: 'The starting point is how work actually moves through the business.' },
    { title: 'Clear next steps', body: 'Every engagement should make the next decision easier to understand.' },
    { title: 'Systems that can be improved', body: 'Useful systems are designed to be reviewed and refined as the business changes.' },
  ]} />
}

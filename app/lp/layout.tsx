import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Take the EMVY quiz to get a score, breakdown, and the right next step into discovery.',
}

export default function LPLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}

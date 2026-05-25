import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import BoardShell from '@/components/admin/BoardShell'

export const metadata: Metadata = {
  title: {
    default: 'EMVY Board',
    template: '%s | EMVY Board',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <BoardShell>{children}</BoardShell>
}

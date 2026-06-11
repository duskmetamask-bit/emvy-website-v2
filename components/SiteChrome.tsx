'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

// Routes that need to own the entire viewport (no site chrome).
// /assessment renders the audit chatbot fullscreen.
const CHROMELESS_ROUTES = new Set(['/assessment'])

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ''
  const chromeless = CHROMELESS_ROUTES.has(pathname)
  if (chromeless) {
    return <>{children}</>
  }
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

// Routes that need to own the entire viewport (no site chrome).
// /assessment iframes the standalone audit chatbot app full-bleed; rendering
// the site header/footer underneath causes a brief flash of marketing chrome
// before the fixed iframe covers it, which reads as "buggy".
const CHROMELESS_ROUTES = new Set<string>(['/assessment'])

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

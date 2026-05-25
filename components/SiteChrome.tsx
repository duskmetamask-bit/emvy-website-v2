'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isPrivateRoute = pathname?.startsWith('/admin')

  if (isPrivateRoute) {
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


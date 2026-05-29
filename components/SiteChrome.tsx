'use client'

import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}


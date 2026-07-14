'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const desktopNav = (
    <>
      <Link className="nav-link" href="/services">Services</Link>

      <Link className="nav-link" href="/use-cases">
        Use Cases
      </Link>

      <Link className="nav-link" href="/about">
        About
      </Link>
      <Link className="nav-link" href="/contact">
        Contact
      </Link>
</>
  )

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="EMVY — AI systems home">
        <img src="/brand/logo-transparent.png" alt="EMVY" className="brand-img" />
      </Link>

      <nav className="nav">
        <div className="desktop-only">{desktopNav}</div>
      </nav>

      <div className="header-actions">
        <a
          href="https://cal.com/jake-emvy/discovery-call"
          className="button primary small"
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a consult
        </a>
        <button className="menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mobile-menu">
          <Link href="/services" onClick={() => setMobileOpen(false)}>Services</Link>
          <Link href="/use-cases" onClick={() => setMobileOpen(false)}>Use Cases</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
          <a href="https://cal.com/jake-emvy/discovery-call" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>Book a consult</a>
        </div>
      ) : null}
    </header>
  )
}

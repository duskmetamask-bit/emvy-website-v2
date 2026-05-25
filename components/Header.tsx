'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import TrackedLink from './TrackedLink'

type NavItem = {
  label: string
  href: string
}

const services: NavItem[] = [
  { label: 'Discovery Call', href: '/services/ai-audits' },
  { label: 'AI Assessment', href: '/services/ai-agents' },
  { label: 'AI Builds', href: '/services/automations' },
  { label: 'Systems Maintenance', href: '/services/maintenance' },
]

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      setOpenMenu(null)
    }, 280)
  }

  useEffect(() => {
    return () => clearCloseTimer()
  }, [])

  const desktopNav = (
    <>
      <div
        className={`nav-item ${openMenu === 'services' ? 'is-open' : ''}`}
        onMouseEnter={() => {
          clearCloseTimer()
          setOpenMenu('services')
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          className="nav-trigger"
          type="button"
          onClick={() => setOpenMenu(openMenu === 'services' ? null : 'services')}
          aria-expanded={openMenu === 'services'}
        >
          Services <ChevronDown size={16} />
        </button>
        <div className="dropdown-menu">
          {services.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpenMenu(null)}>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </div>
      </div>

      <Link className="nav-link" href="/case-studies">
        Case Studies
      </Link>

      <Link className="nav-link" href="/why-ai">
        Why AI
      </Link>
      <Link className="nav-link" href="/blog">
        Blog
      </Link>
      <Link className="nav-link" href="/research">
        Research Hub
      </Link>
      <Link className="nav-link" href="/process">
        Process
      </Link>
      <Link className="nav-link" href="/quiz">
        Quiz
      </Link>

      <Link className="nav-link" href="/about">
        About
      </Link>
      <Link className="nav-link" href="/contact">
        Contact
      </Link>
      <Link className="nav-link" href="/admin">
        Board
      </Link>
    </>
  )

  return (
    <header className="site-header">
      <Link className="brand" href="/" onClick={() => setOpenMenu(null)}>
        <span className="brand-wordmark">emvy</span>
        <span className="brand-dot">.</span>
        <span className="brand-wordmark">ai</span>
      </Link>

      <nav className="nav" onMouseLeave={scheduleClose}>
        <div className="desktop-only">{desktopNav}</div>
      </nav>

      <div className="header-actions">
        <TrackedLink
          href="/services/ai-audits"
          className="button primary small"
          eventName="discovery_call_click"
          eventLabel="header"
        >
          Book Free Discovery Call
        </TrackedLink>
        <button className="menu-button" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="Open menu">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mobile-menu">
          <Link href="/services" onClick={() => setMobileOpen(false)}>Services</Link>
          <Link href="/case-studies" onClick={() => setMobileOpen(false)}>Case Studies</Link>
          <Link href="/why-ai" onClick={() => setMobileOpen(false)}>Why AI</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href="/research" onClick={() => setMobileOpen(false)}>Research Hub</Link>
          <Link href="/process" onClick={() => setMobileOpen(false)}>Process</Link>
          <Link href="/quiz" onClick={() => setMobileOpen(false)}>Quiz</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link href="/admin" onClick={() => setMobileOpen(false)}>Board</Link>
          <Link href="/services/ai-audits" onClick={() => setMobileOpen(false)}>Book Free Discovery Call</Link>
        </div>
      ) : null}
    </header>
  )
}

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
  { label: 'Discovery Call', href: '/services/discovery-call' },
  { label: 'AI Strategy Call', href: '/services/ai-strategy-call' },
  { label: 'AI Builds', href: '/services/ai-builds' },
  { label: 'Systems Maintenance', href: '/services/systems-maintenance' },
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
      <Link className="nav-link" href="/assessment">
        Mini AI Strategy
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
      <Link className="brand" href="/" onClick={() => setOpenMenu(null)} aria-label="EMVY — AI Consultancy home">
        <img src="/brand/logo.png" alt="EMVY — AI Consultancy" className="brand-img" />
      </Link>

      <nav className="nav" onMouseLeave={scheduleClose}>
        <div className="desktop-only">{desktopNav}</div>
      </nav>

      <div className="header-actions">
        <TrackedLink
          href="/services/discovery-call"
          className="button primary small"
          eventName="discovery_call_click"
          eventLabel="header"
        >
          Book Free Discovery Call
        </TrackedLink>
        <TrackedLink
          href="/services/ai-strategy-call"
          className="button secondary small"
          eventName="ai_strategy_call_click"
          eventLabel="header"
        >
          AI Strategy Call ($500)
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
          <Link href="/assessment" onClick={() => setMobileOpen(false)}>Mini AI Strategy</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link href="/services/discovery-call" onClick={() => setMobileOpen(false)}>Book Free Discovery Call</Link>
          <Link href="/services/ai-strategy-call" onClick={() => setMobileOpen(false)}>Book AI Strategy Call ($500)</Link>
        </div>
      ) : null}
    </header>
  )
}

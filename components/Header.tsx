'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import TrackedLink from './TrackedLink'

const links = [
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="EMVY home" onClick={() => setOpen(false)}><img src="/brand/logo-transparent.png" alt="EMVY" className="brand-img" /></Link>
    <nav className="nav desktop-only" aria-label="Primary navigation">{links.map((link) => <Link className="nav-link" key={link.href} href={link.href}>{link.label}</Link>)}</nav>
    <div className="header-actions">
      <TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary small" eventName="book_consult_click" eventLabel="header">Book a consult</TrackedLink>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X size={18} /> : <Menu size={18} />}</button>
    </div>
    {open ? <nav className="mobile-menu" aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<TrackedLink href="https://cal.com/jake-emvy/discovery-call" eventName="book_consult_click" eventLabel="mobile_menu">Book a consult</TrackedLink></nav> : null}
  </header>
}

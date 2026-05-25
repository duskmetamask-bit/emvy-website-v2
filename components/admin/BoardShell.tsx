'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, CircleDot, LayoutGrid, Menu, Plus } from 'lucide-react'
import { boardModules } from '@/lib/emvy-board'

const topLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutGrid },
  ...boardModules.map((module) => ({
    label: module.label,
    href: module.href,
    icon: module.icon,
  })),
]

export default function BoardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pageTitle = useMemo(() => {
    if (pathname === '/admin') return 'EMVY Operating Board'
    const item = topLinks.find((link) => link.href === pathname)
    return item?.label ?? 'EMVY Operating Board'
  }, [pathname])

  return (
    <div className="emvy-board-shell">
      <aside className={`emvy-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="emvy-sidebar__brand">
          <button
            type="button"
            className="emvy-sidebar__mobile-toggle"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
          <div>
            <p>EMVY</p>
            <strong>modular board</strong>
          </div>
        </div>

        <div className="emvy-sidebar__pill">
          <CircleDot size={14} />
          <span>Private workspace</span>
        </div>

        <nav className="emvy-sidebar__nav">
          {topLinks.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`emvy-sidebar__link ${active ? 'is-active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={18} />
                {!collapsed ? <span>{item.label}</span> : null}
              </Link>
            )
          })}
        </nav>

        <div className="emvy-sidebar__footer">
          <button
            type="button"
            className="emvy-sidebar__collapse"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        </div>
      </aside>

      <main className="emvy-board-main">
        <header className="emvy-board-topbar">
          <div>
            <p className="emvy-board-topbar__eyebrow">Modular, extendable, live-ready</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="emvy-board-topbar__actions">
            <Link href="/admin/builds" className="button primary small">
              <Plus size={14} />
              New build
            </Link>
            <Link href="/admin/login" className="button secondary small">
              Access gate
            </Link>
          </div>
        </header>

        <div className="emvy-board-content">{children}</div>
      </main>
    </div>
  )
}

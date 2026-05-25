'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { trackEvent } from '@/lib/analytics'

type TrackedLinkProps = {
  href: string
  className?: string
  children: ReactNode
  eventName: string
  eventLabel?: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'className' | 'onClick'>

export default function TrackedLink({
  href,
  className,
  children,
  eventName,
  eventLabel,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      {...props}
      onClick={() => {
        trackEvent(eventName, { label: eventLabel ?? href })
      }}
    >
      {children}
    </Link>
  )
}

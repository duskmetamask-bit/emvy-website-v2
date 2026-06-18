'use client'

import { useEffect, useRef } from 'react'

type CalInlineEmbedProps = {
  /** Cal.com event slug, e.g. 'discovery-call' or 'ai-strategy'. */
  eventSlug: string
  /** Account slug for the Cal.com link, e.g. 'jake-emvy'. */
  accountSlug?: string
  /** Layout — month_view (default) shows the full month; column_view stacks days. */
  layout?: 'month_view' | 'column_view' | 'week_view'
  /** Set true for paid events to surface the Stripe checkout inline. */
  paid?: boolean
  /** Override the embed container min-height (px). Defaults to 720. */
  minHeight?: number
  /** Forward query params from the page URL into Cal.com's booking form. */
  forwardQueryParams?: boolean
}

const CAL_ACCOUNT = 'jake-emvy'
const EMBED_SRC = 'https://app.cal.com/embed/embed.js'

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & {
      q?: unknown[]
      loaded?: boolean
      ns?: Record<string, ((...args: unknown[]) => void) & { q?: unknown[] }>
      config?: Record<string, unknown>
    }
  }
}

/**
 * Cal.com inline embed — renders the calendar directly on the page so users
 * pick a slot without leaving the site. Uses Cal.com's official embed loader
 * (`https://app.cal.com/embed/embed.js`) which exposes `window.Cal`. The
 * loader is idempotent — multiple embeds on the same page share one script.
 */
export default function CalInlineEmbed({
  eventSlug,
  accountSlug = CAL_ACCOUNT,
  layout = 'month_view',
  paid,
  minHeight = 720,
  forwardQueryParams = true,
}: CalInlineEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const containerId = `my-cal-inline-${eventSlug}`

  useEffect(() => {
    const w = window as Window
    // Inline IIFE from Cal.com's docs — wraps Cal on `window` as a queue so
    // calls before the script loads are buffered. Same snippet they emit.
    const loader = `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "${EMBED_SRC}", "init");`

    // Seed Cal so calls below queue properly even on first paint.
    if (!w.Cal) {
      // eslint-disable-next-line no-new-func
      new Function(loader)()
    }

    const init = () => {
      const Cal = w.Cal
      if (!Cal) return
      Cal('init', eventSlug, { origin: 'https://app.cal.com' })
      Cal.config = Cal.config ?? {}
      if (forwardQueryParams) {
        Cal.config.forwardQueryParams = true
      }
      const ns = Cal.ns?.[eventSlug]
      if (ns) {
        ns('inline', {
          elementOrSelector: `#${containerId}`,
          config: { layout, useSlotsViewOnSmallScreen: 'true' },
          calLink: `${accountSlug}/${eventSlug}`,
        })
        ns('ui', { hideEventTypeDetails: false, layout })
      }
    }

    if (w.Cal?.loaded) {
      init()
    } else {
      // The IIFE installs the script and sets Cal.loaded=true once ready.
      // Poll until then. The loader itself is fast (<200ms) on a warm cache.
      let cancelled = false
      const start = Date.now()
      const tick = () => {
        if (cancelled) return
        if (w.Cal?.loaded) {
          init()
          return
        }
        if (Date.now() - start > 5000) return // give up after 5s
        window.setTimeout(tick, 50)
      }
      tick()
      return () => {
        cancelled = true
      }
    }
  }, [eventSlug, accountSlug, layout, containerId, forwardQueryParams])

  const directUrl = `https://cal.com/${accountSlug}/${eventSlug}`

  return (
    <div className="cal-inline-embed" data-paid={paid ? 'true' : undefined}>
      <div
        ref={containerRef}
        id={containerId}
        style={{
          width: '100%',
          minHeight: `${minHeight}px`,
          overflow: 'scroll',
        }}
      />
      <noscript>
        <a className="button primary" href={directUrl} target="_blank" rel="noopener noreferrer">
          Open booking page
        </a>
      </noscript>
      <div className="cal-inline-embed__fallback">
        <a className="button secondary" href={directUrl} target="_blank" rel="noopener noreferrer">
          Calendar not loading? Book directly on Cal.com →
        </a>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { CalendarDays, ShieldCheck, X } from 'lucide-react'

type CalBookingGateProps = {
  triggerLabel: string
  className?: string
  /** Slug of the Cal.com event type to book. Defaults to the 15-min AI chat. */
  eventSlug?: string
  /** Optional override for the full Cal.com URL (use for non-jake-emvy accounts). */
  calUrl?: string
  /** Display name for the event in the modal title. */
  eventLabel?: string
  /** Whether this event requires payment — shows a payment disclosure in the modal. */
  paid?: boolean
  /** Display price (e.g. "$500 AUD") when paid. */
  priceLabel?: string
}

/**
 * Resolve the Cal.com booking URL from a slug + base. `jake-emvy` is the
 * canonical account for the public site CTAs per
 * `Sessions/2026-06-17 — emvy-board.md`.
 */
const CAL_BASE = 'https://cal.com/jake-emvy'
const DEFAULT_EVENT_SLUG = '15-min-ai-chat'

export default function CalBookingGate({
  triggerLabel,
  className,
  eventSlug,
  calUrl,
  eventLabel,
  paid,
  priceLabel,
}: CalBookingGateProps) {
  const [open, setOpen] = useState(false)
  const resolvedUrl = calUrl ?? `${CAL_BASE}/${eventSlug ?? DEFAULT_EVENT_SLUG}`
  const title = eventLabel ? `Book the ${eventLabel}.` : 'Book the first conversation.'

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="booking-modal" role="dialog" aria-modal="true" aria-label={`Booking: ${eventLabel ?? 'call'}`}>
          <button className="booking-modal__backdrop" type="button" onClick={() => setOpen(false)} aria-label="Close booking modal" />
          <div className="booking-modal__panel">
            <div className="booking-modal__header">
              <div>
                <p className="section-kicker">Next step</p>
                <h2>{title}</h2>
              </div>
              <button className="booking-modal__close" type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {paid ? (
              <div className="booking-modal__note" style={{ borderColor: '#2be3a355', background: '#2be3a312' }}>
                <ShieldCheck size={18} style={{ color: '#2be3a3' }} />
                <p>
                  This is a paid {eventLabel ?? 'call'} ({priceLabel ?? 'see calendar'}). Payment is
                  collected by Cal.com via Stripe before the time is locked in.
                </p>
              </div>
            ) : (
              <div className="booking-modal__note">
                <ShieldCheck size={18} />
                <p>
                  This call is where we decide the right path, whether that becomes a quick audit, a
                  build engagement, or a longer-term delivery and maintenance plan.
                </p>
              </div>
            )}

            <form
              className="booking-form"
              onSubmit={(event) => {
                event.preventDefault()
                window.open(resolvedUrl, '_blank', 'noopener,noreferrer')
                setOpen(false)
              }}
            >
              <div className="booking-grid">
                <label>
                  <span>Your name</span>
                  <input type="text" name="name" placeholder="Jane Doe" required />
                </label>
                <label>
                  <span>Work email</span>
                  <input type="email" name="email" placeholder="jane@company.com" required />
                </label>
                <label className="booking-grid__full">
                  <span>What do you want help with?</span>
                  <textarea
                    name="brief"
                    placeholder="Audit, build, maintenance, or a mix of all three."
                    required
                  />
                </label>
                <label>
                  <span>Preferred outcome</span>
                  <select name="outcome" defaultValue="audit">
                    <option value="audit">Audit</option>
                    <option value="build">Build</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Not sure yet</option>
                  </select>
                </label>
                <input className="booking-form__honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" />
              </div>

              <div className="booking-modal__note">
                <CalendarDays size={18} />
                <p>
                  After you submit, you will be taken to the booking calendar. We can then send the
                  relevant audit or build follow-up flow from there.
                </p>
              </div>

              <button type="submit" className="button primary booking-form__submit">
                {paid ? `Continue to ${priceLabel ?? 'paid'} booking` : 'Continue to booking'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

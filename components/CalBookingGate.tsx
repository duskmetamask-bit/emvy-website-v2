'use client'

import { useState } from 'react'
import { CalendarDays, ShieldCheck, X } from 'lucide-react'

type CalBookingGateProps = {
  triggerLabel: string
  className?: string
  eventLabel?: string
}

const CAL_URL = 'https://cal.com/jake-emvy/15-min-ai-chat'

export default function CalBookingGate({ triggerLabel, className }: CalBookingGateProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="booking-modal" role="dialog" aria-modal="true" aria-label="Discovery booking">
          <button className="booking-modal__backdrop" type="button" onClick={() => setOpen(false)} aria-label="Close booking modal" />
          <div className="booking-modal__panel">
            <div className="booking-modal__header">
              <div>
                <p className="section-kicker">Next step</p>
                <h2>Book the first conversation.</h2>
              </div>
              <button className="booking-modal__close" type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="booking-modal__note">
              <ShieldCheck size={18} />
              <p>
                This call is where we decide the right path, whether that becomes a quick audit, a
                build engagement, or a longer-term delivery and maintenance plan.
              </p>
            </div>

            <form
              className="booking-form"
              onSubmit={(event) => {
                event.preventDefault()
                window.open(CAL_URL, '_blank', 'noopener,noreferrer')
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
                Continue to booking
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

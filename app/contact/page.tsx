'use client'

import { useState, type FormEvent } from 'react'
import PageHero from '../../components/PageHero'
import TrackedLink from '@/components/TrackedLink'
import { trackEvent } from '@/lib/analytics'

type ContactState = { name: string; email: string; company: string; message: string; website: string }
const initialState: ContactState = { name: '', email: '', company: '', message: '', website: '' }

export default function ContactPage() {
  const [form, setForm] = useState<ContactState>(initialState)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!response.ok) throw new Error('Contact submission failed')
      trackEvent('contact_form_submit', { placement: 'contact_form' }); setDone(true); setForm(initialState)
    } catch { setError('Something went wrong. Please try again.') } finally { setLoading(false) }
  }
  return <>
    <PageHero eyebrow="Contact" title="Start with a conversation." description="Book a focused 20-minute consult, or send an enquiry if that suits you better."><TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary" eventName="book_consult_click" eventLabel="contact_hero">Book a consult</TrackedLink></PageHero>
    <section className="section contact-booking"><p className="section-kicker">Book a consult</p><h2 className="section-title">Bring the part of the business you want to make easier. We’ll start there.</h2><TrackedLink href="https://cal.com/jake-emvy/discovery-call" className="button primary" eventName="book_consult_click" eventLabel="contact_booking_panel">Book a consult</TrackedLink></section>
    <section className="section"><div className="contact-band"><div className="contact-copy"><p className="section-kicker">Send an enquiry instead</p><h2 className="section-title">Tell us a little about the business.</h2><p className="section-text">We’ll read your note and get back to you with a useful next step.</p></div><form className={`contact-form ${done ? 'submitted' : ''}`} onSubmit={handleSubmit}>{done ? <div className="submit-success"><p className="section-kicker">Thanks</p><h3>Your enquiry has been sent.</h3><p>We will get back to you shortly.</p></div> : <><input type="text" name="website" value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-10000px', opacity: 0 }} /><div className="form-row"><label>Name<input type="text" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required /></label><label>Email<input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required /></label></div><label>Business<input type="text" value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} /></label><label>Message<textarea value={form.message} onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))} placeholder="What would you like to make easier?" required /></label>{error ? <p className="lp-error">{error}</p> : null}<button type="submit" className="button primary" disabled={loading}>{loading ? 'Sending...' : 'Send enquiry'}</button></>}</form></div></section>
  </>
}

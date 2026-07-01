'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

type ContactState = {
  name: string
  email: string
  company: string
  role: string
  message: string
}

const initialState: ContactState = {
  name: '',
  email: '',
  company: '',
  role: '',
  message: '',
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactState>(initialState)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Contact submission failed')

      setDone(true)
      setForm(initialState)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start a direct conversation with EMVY."
        description="Use this form if you want to discuss a workflow, an AI opportunity, or an existing operations bottleneck. If you prefer a structured first step, try the free Mini AI Strategy Assessment."
        image="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=1800&q=90&auto=format&fit=crop"
      >
        <Link href="/assessment" className="button light">
          Start the assessment
        </Link>
        <Link href="/services/discovery-call" className="button secondary">
          Book Free Discovery Call
        </Link>
      </PageHero>

      <section className="section">
        <div className="contact-band">
          <div className="contact-copy">
            <p className="section-kicker">Direct contact</p>
            <h2 className="section-title">A short brief is enough to get the conversation moving.</h2>
            <p className="section-text">
              Tell us what stage you are at, what the operational issue looks like, and what
              outcome you want to create. EMVY can then point you toward the right next step.
            </p>
            <div className="contact-list">
              <Link href="/services/discovery-call">Free Discovery Call</Link>
              <Link href="/services/ai-strategy-call">$500 AI Strategy Call</Link>
              <Link href="/why-ai">Why AI</Link>
            </div>
          </div>

          <form className={`contact-form ${done ? 'submitted' : ''}`} onSubmit={handleSubmit}>
            {done ? (
              <div className="submit-success">
                <p className="section-kicker">Thanks</p>
                <h3>Your message has been sent.</h3>
                <p>We will get back to you shortly.</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <label>
                    Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Work email"
                      required
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Company
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="Company name"
                    />
                  </label>
                  <label>
                    Role
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                      placeholder="Founder, director, ops lead..."
                    />
                  </label>
                </div>
                <label>
                  Message
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="What would you like help with?"
                    required
                  />
                </label>
                {error ? <p className="lp-error">{error}</p> : null}
                <button type="submit" className="button primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send enquiry'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  )
}

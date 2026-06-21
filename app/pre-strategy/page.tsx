'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PreStrategyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      industry: (form.elements.namedItem('industry') as HTMLSelectElement).value,
      employees: (form.elements.namedItem('employees') as HTMLSelectElement).value,
      pain: (form.elements.namedItem('pain') as HTMLTextAreaElement).value,
      tools: (form.elements.namedItem('tools') as HTMLTextAreaElement).value,
      ai: (form.elements.namedItem('ai') as HTMLTextAreaElement).value,
    }
    setError('')
    try {
      const res = await fetch('/api/pre-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Server error')
      setName(data.name)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please email us directly.')
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--accent)', fontSize: 22, marginBottom: 8 }}>Thanks, {name}!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>We've received your info. Jake will review it before your strategy call.</p>
      </div>
    )
  }

  const ls: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 2, marginTop: 12, color: 'var(--text-secondary)' }
  const is: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, outline: 'none' }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link href="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Back</Link>
      <p className="section-kicker">Pre-Strategy</p>
      <h1 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2, marginBottom: 4 }}>
        Help us prepare<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Takes about 3 minutes. Jake will review your answers before the call.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={ls}>Your Name</label>
        <input type="text" name="name" required placeholder="e.g. Sarah Jones" style={is} />

        <label style={ls}>Email Address</label>
        <input type="email" name="email" required placeholder="sarah@example.com" style={is} />

        <label style={ls}>Business Name</label>
        <input type="text" name="company" required placeholder="e.g. Sarah's Plumbing" style={is} />

        <label style={ls}>Industry</label>
        <select name="industry" style={is}>
          <option value="">Select your industry</option>
          <option value="trades">Trades / Construction</option>
          <option value="professional-services">Professional Services</option>
          <option value="hospitality">Hospitality / Cafe / Restaurant</option>
          <option value="retail">Retail / E-commerce</option>
          <option value="health">Health / Medical</option>
          <option value="real-estate">Real Estate</option>
          <option value="other">Other</option>
        </select>

        <label style={ls}>Number of Employees</label>
        <select name="employees" style={is}>
          <option value="">Select range</option>
          <option value="1">Just me (solo)</option>
          <option value="2-5">2–5</option>
          <option value="6-20">6–20</option>
          <option value="21-50">21–50</option>
          <option value="50+">50+</option>
        </select>

        <label style={ls}>What's your biggest operational pain right now?</label>
        <textarea name="pain" rows={3} placeholder="e.g. Missed calls, manual follow-ups, booking chaos..." style={is} />

        <label style={ls}>What tools or software do you currently use?</label>
        <textarea name="tools" rows={2} placeholder="e.g. Xero, Google Workspace, nothing much" style={is} />

        <label style={ls}>Are you using any AI tools currently?</label>
        <textarea name="ai" rows={2} placeholder="e.g. ChatGPT for emails, nothing yet" style={is} />

        {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}

        <button type="submit" style={{
          background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 24px',
          borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8,
        }}>Submit →</button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Download, ArrowRight } from 'lucide-react'

interface LeadMagnetFormProps {
  variant?: 'inline' | 'modal'
}

export default function LeadMagnetForm({ variant = 'inline' }: LeadMagnetFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    setLoading(true)
    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Lead magnet submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="lead-magnet-form submitted">
        <div className="lm-success">
          <Download size={24} />
          <p>Check your inbox — your guide is on its way.</p>
        </div>
        <p className="lm-followup">
          Want a deeper look into where AI agents could help your business?{' '}
          <a href="https://cal.com/jake-emvy/15-min-ai-chat" target="_blank" rel="noopener noreferrer">
            Book a free 15-min call →
          </a>
        </p>
      </div>
    )
  }

  return (
    <form className="lead-magnet-form" onSubmit={handleSubmit}>
      <div className="lm-fields">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Work email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Sending...' : <>Get the free guide <ArrowRight size={16} /></>}
        </button>
      </div>
    </form>
  )
}

'use client'

import { FormEvent, useState } from 'react'
import { trackEvent } from '@/lib/analytics'

type ResearchSubscribeFormProps = {
  source: 'research_hero' | 'article_inline' | 'archive_gate' | 'overview_cta' | 'digest_archive' | 'homepage'
  title?: string
  description?: string
  compact?: boolean
}

export default function ResearchSubscribeForm({
  source,
  title = 'Get the weekly signal.',
  description = 'A concise weekly briefing on what changed in AI and what matters commercially.',
  compact = false,
}: ResearchSubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/research/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          role: role || undefined,
          company: company || undefined,
          source,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to subscribe right now.')
      }

      trackEvent('research_subscribe_submit', {
        source,
        lead_score: data.leadScore ?? 0,
      })

      setStatus('success')
      setMessage('You are on the list. Expect the weekly digest plus major research signals.')
      setEmail('')
      setName('')
      setRole('')
      setCompany('')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to subscribe right now.')
    }
  }

  return (
    <div className={`research-subscribe ${compact ? 'is-compact' : ''}`}>
      <div className="research-subscribe__copy">
        <p className="research-subscribe__eyebrow">Weekly briefing</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <form className="research-subscribe__form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {!compact ? (
          <>
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="text"
              placeholder="Role (optional)"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
            <input
              type="text"
              placeholder="Company (optional)"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </>
        ) : null}
        <button className="button primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Joining…' : 'Subscribe'}
        </button>
      </form>

      {message ? <p className={`research-subscribe__status is-${status}`}>{message}</p> : null}
    </div>
  )
}


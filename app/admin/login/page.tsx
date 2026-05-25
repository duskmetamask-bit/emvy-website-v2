'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [workspace, setWorkspace] = useState('emvy')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name) return
    sessionStorage.setItem('emvy_board_user', name)
    sessionStorage.setItem('emvy_board_workspace', workspace)
    router.push('/admin')
  }

  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <p className="section-kicker">Board access</p>
        <h1>Enter the EMVY operating board.</h1>
        <p>
          This is a lightweight access gate for the modular workspace while the platform grows.
        </p>
        <form onSubmit={handleSubmit} className="booking-form" style={{ maxWidth: 520 }}>
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>
          <label>
            <span>Workspace</span>
            <select value={workspace} onChange={(e) => setWorkspace(e.target.value)}>
              <option value="emvy">EMVY</option>
              <option value="teachwise">TeachWise</option>
              <option value="site-ai">Site AI</option>
              <option value="personal">Personal</option>
            </select>
          </label>
          <button className="button primary" type="submit">
            Continue
          </button>
        </form>
      </div>
    </section>
  )
}

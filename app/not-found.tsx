import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div className="lp-success__card" style={{ maxWidth: '720px' }}>
        <p className="section-kicker">404</p>
        <h1 style={{ margin: '0 0 0.75rem', fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1 }}>
          Page not found
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          The page you were looking for does not exist, or it may have moved.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
          <Link href="/" className="button primary">
            Go home
          </Link>
          <Link href="/contact" className="button secondary">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}

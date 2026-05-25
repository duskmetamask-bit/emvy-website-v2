import Link from 'next/link'

export default function SuccessPage() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-copy">
          <p className="section-kicker">Success</p>
          <h1>Your request has been received.</h1>
          <p>
            We’ll review the details, capture the right context, and follow up with the next best
            step.
          </p>
          <div className="hero-actions">
            <Link href="/services" className="button primary">Explore services</Link>
            <Link href="/" className="button secondary">Back to home</Link>
          </div>
        </div>
      </section>
    </>
  )
}


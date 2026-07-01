import Link from 'next/link'

const primaryLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'Why AI', href: '/why-ai' },
  { label: 'Blog', href: '/blog' },
  { label: 'Newsletter', href: '/newsletter' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const conversionLinks = [
  { label: 'Mini AI Strategy', href: '/assessment' },
  { label: 'Free Discovery Call', href: '/services/discovery-call' },
  { label: 'AI Strategy Call', href: '/services/ai-strategy-call' },
  { label: 'AI Builds', href: '/services/ai-builds' },
  { label: 'Systems Maintenance', href: '/services/systems-maintenance' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__intro">
          <Link href="/" className="footer-brand" aria-label="EMVY — home">
            <img src="/brand/logo-transparent.png" alt="EMVY" className="footer-brand__img" />
          </Link>
        </div>

        <div className="footer-start-here">
          <h3>Start Here</h3>
          <div className="site-footer__links">
            {conversionLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-explore">
          <h3>Explore</h3>
          <div className="site-footer__links site-footer__links--right">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__meta">
        <p>ABN: 82 488 276 510</p>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'

const primaryLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Use Cases', href: '/use-cases' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const conversionLinks = [
  { label: 'Book a consult', href: 'https://cal.com/jake-emvy/discovery-call' },
  { label: 'AI Workflow Assessment', href: '/services#assessment' },
  { label: 'AI Builds', href: '/services#builds' },
  { label: 'Ongoing Improvement', href: '/services#improvement' },
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
          <h3>Services</h3>
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

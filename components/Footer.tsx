import Link from 'next/link'

const primaryLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Why AI', href: '/why-ai' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const conversionLinks = [
  { label: 'AI Assessment', href: '/assessment' },
  { label: 'Free Discovery Call', href: '/services/discovery-call' },
  { label: 'AI Audit', href: '/services/ai-assessment' },
  { label: 'AI Builds', href: '/services/ai-builds' },
  { label: 'Systems Maintenance', href: '/services/systems-maintenance' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__intro">
          <p className="section-kicker">EMVY</p>
          <h2>Identify the right AI opportunity, then build the system around it.</h2>
          <p>EMVY helps businesses audit, build, hand over, and maintain practical AI systems.</p>
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

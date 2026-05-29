import Link from 'next/link'

const primaryLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Why AI', href: '/why-ai' },
  { label: 'Process', href: '/process' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const conversionLinks = [
  { label: 'AI Readiness Quiz', href: '/quiz' },
  { label: 'Free Discovery Call', href: '/services/ai-audits' },
  { label: 'AI Audit', href: '/services/ai-agents' },
  { label: 'AI Builds', href: '/services/automations' },
  { label: 'Systems Maintenance', href: '/services/maintenance' },
  { label: 'Process', href: '/process' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__intro">
          <p className="section-kicker">EMVY</p>
          <h2>Identify the right AI opportunity, then build the system around it.</h2>
          <p>
            EMVY helps businesses identify where AI can reduce admin, improve efficiency, and
            support better workflows across operations, delivery, and internal systems.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <div className="site-footer__links">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3>Start Here</h3>
          <div className="site-footer__links">
            {conversionLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="site-footer__meta">
        <p>EMVY helps businesses audit, build, hand over, and maintain practical AI systems.</p>
        <p>ABN: 82 488 276 510</p>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}

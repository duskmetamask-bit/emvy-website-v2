import Link from 'next/link'
import TrackedLink from './TrackedLink'

const links = [{ label: 'Services', href: '/services' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]

export default function Footer() {
  return <footer className="site-footer"><div className="site-footer__grid"><div className="site-footer__intro"><Link href="/" className="footer-brand" aria-label="EMVY home"><img src="/brand/logo-transparent.png" alt="EMVY" className="footer-brand__img" /></Link><p>AI built for your business.</p></div><div className="footer-start-here"><h3>Explore</h3><div className="site-footer__links">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}<TrackedLink href="https://cal.com/jake-emvy/discovery-call" eventName="book_consult_click" eventLabel="footer">Book a consult</TrackedLink></div></div></div><div className="site-footer__meta"><p>ABN: 82 488 276 510</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div></footer>
}

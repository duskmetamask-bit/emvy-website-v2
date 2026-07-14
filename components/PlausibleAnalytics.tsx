import Script from 'next/script'

export default function PlausibleAnalytics() {
  return <Script defer data-domain="emvyai.com" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
}

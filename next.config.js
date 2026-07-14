/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/case-studies', destination: '/services', permanent: true },
      { source: '/our-work', destination: '/services', permanent: true },
      { source: '/portfolio', destination: '/services', permanent: true },
      { source: '/work', destination: '/services', permanent: true },
      { source: '/services-pricing', destination: '/services', permanent: true },
      { source: '/services/discovery-call', destination: '/services', permanent: true },
      { source: '/services/ai-strategy-call', destination: '/services', permanent: true },
      { source: '/services/ai-builds', destination: '/services', permanent: true },
      { source: '/services/systems-maintenance', destination: '/services', permanent: true },
      { source: '/process', destination: '/services', permanent: true },
      { source: '/how-it-works', destination: '/services', permanent: true },
      { source: '/what-we-build', destination: '/services', permanent: true },
      { source: '/use-cases', destination: '/services', permanent: true },
      { source: '/why-ai', destination: '/services', permanent: true },
      { source: '/why-ai/:path*', destination: '/services', permanent: true },
      { source: '/ai-builds', destination: '/services', permanent: true },
      { source: '/voice-agents', destination: '/services', permanent: true },
      { source: '/maintenance', destination: '/services', permanent: true },
      { source: '/assessment', destination: '/services', permanent: true },
      { source: '/ai-workflow-assessment', destination: '/services', permanent: true },
      { source: '/discovery-call', destination: '/contact', permanent: true },
      { source: '/blog/:path*', destination: '/services', permanent: true },
      { source: '/newsletter', destination: '/services', permanent: true },
      { source: '/resources', destination: '/services', permanent: true },
      { source: '/lp/:path*', destination: '/services', permanent: true },
    ]
  },
}

module.exports = nextConfig

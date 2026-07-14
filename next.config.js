/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/case-studies', destination: '/use-cases', permanent: true },
      { source: '/our-work', destination: '/use-cases', permanent: true },
      { source: '/portfolio', destination: '/use-cases', permanent: true },
      { source: '/work', destination: '/use-cases', permanent: true },
      { source: '/services-pricing', destination: '/services', permanent: true },
      { source: '/pricing', destination: '/services', permanent: true },
      { source: '/assessment', destination: '/services', permanent: true },
      { source: '/services/discovery-call', destination: '/services#consult', permanent: true },
      { source: '/services/ai-strategy-call', destination: '/services#assessment', permanent: true },
      { source: '/services/ai-builds', destination: '/services#builds', permanent: true },
      { source: '/services/systems-maintenance', destination: '/services#improvement', permanent: true },
      { source: '/blog', destination: '/resources', permanent: true },
      { source: '/blog/:path*', destination: '/resources', permanent: true },
      { source: '/newsletter', destination: '/resources', permanent: true },
      { source: '/why-ai', destination: '/services', permanent: true },
      { source: '/why-ai/:path*', destination: '/services', permanent: true },
      { source: '/process', destination: '/services', permanent: true },
      { source: '/guide', destination: '/services', permanent: true },
      { source: '/industries', destination: '/services', permanent: true },
      { source: '/pre-strategy', destination: '/services', permanent: true },
      { source: '/lp', destination: '/services', permanent: true },
      { source: '/lp/:path*', destination: '/services', permanent: true },
      { source: '/spark-response', destination: '/services', permanent: true },
      { source: '/spark-response/:path*', destination: '/services', permanent: true },
    ]
  },
}

module.exports = nextConfig

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
      { source: '/services-pricing', destination: '/pricing', permanent: true },
    ]
  },
}

module.exports = nextConfig

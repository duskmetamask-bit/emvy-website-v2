/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/our-work', destination: '/case-studies', permanent: true },
      { source: '/portfolio', destination: '/case-studies', permanent: true },
      { source: '/work', destination: '/case-studies', permanent: true },
      { source: '/services-pricing', destination: '/pricing', permanent: true },
    ]
  },
}

module.exports = nextConfig

import type { MetadataRoute } from 'next'

const siteUrl = 'https://emvyai.com'

const routes = [
  '/',
  '/services',
  '/services/ai-audits',
  '/services/ai-agents',
  '/services/automations',
  '/services/maintenance',
  '/case-studies',
  '/quiz',
  '/about',
  '/contact',
  '/pricing',
  '/why-ai',
  '/why-ai/security',
  '/privacy',
  '/terms',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }))
}

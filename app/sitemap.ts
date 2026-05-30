import type { MetadataRoute } from 'next'

const siteUrl = 'https://emvyai.com'

const routes = [
  '/',
  '/services',
  '/services/discovery-call',
  '/services/ai-assessment',
  '/services/ai-builds',
  '/services/systems-maintenance',
  '/case-studies',
  '/assessment',
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

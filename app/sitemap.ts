import type { MetadataRoute } from 'next'

const SITE_URL = 'https://emvyai.com' as const

type RouteEntry = {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}

const ROUTES: ReadonlyArray<RouteEntry> = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },

  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/use-cases', priority: 0.8, changeFrequency: 'monthly' },

  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services/ai-builds', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services/discovery-call', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services/ai-strategy-call', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services/systems-maintenance', priority: 0.7, changeFrequency: 'monthly' },

  { path: '/contact', priority: 0.9, changeFrequency: 'monthly' },


  { path: '/success', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  return staticEntries
}

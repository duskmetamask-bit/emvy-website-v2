import type { MetadataRoute } from 'next'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

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
  { path: '/industries', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/process', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/why-ai', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/why-ai/security', priority: 0.7, changeFrequency: 'monthly' },

  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services/ai-builds', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services/discovery-call', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services/ai-strategy-call', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/services/systems-maintenance', priority: 0.7, changeFrequency: 'monthly' },

  { path: '/assessment', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/lp/trades', priority: 0.9, changeFrequency: 'monthly' },

  { path: '/blog', priority: 0.9, changeFrequency: 'daily' },

  { path: '/success', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
]

type BlogRow = {
  slug: string
  publishedAt?: number
  updatedAt?: number
}

async function getBlogRows(): Promise<BlogRow[]> {
  try {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!url) return []
    const convex = new ConvexHttpClient(url)
    const rows = (await convex.query(api.blog.list, {})) as BlogRow[]
    return rows
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  const blogRows = await getBlogRows()
  const blogEntries: MetadataRoute.Sitemap = blogRows.map((row) => ({
    url: `${SITE_URL}/blog/${row.slug}`,
    lastModified: row.updatedAt ? new Date(row.updatedAt) : row.publishedAt ? new Date(row.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries]
}

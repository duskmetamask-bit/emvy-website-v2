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
  '/blog',
  '/research',
  '/research/overview',
  '/research/digest',
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
  const researchRoutes = [
    '/research/topics/models',
    '/research/topics/agents',
    '/research/topics/tooling',
    '/research/topics/enterprise-ai',
    '/research/topics/regulation',
    '/research/posts/openai-enterprise-control-plane-shift',
    '/research/posts/anthropic-agentic-tooling-race',
    '/research/posts/vector-observability-stack-matures',
    '/research/posts/eu-governance-shift-affects-vendors',
    '/research/posts/fortune500-internal-copilot-lesson',
  ]

  return [...routes, ...researchRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' || route.startsWith('/research') ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route.startsWith('/research') ? 0.8 : 0.7,
  }))
}

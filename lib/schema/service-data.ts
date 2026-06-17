// Canonical metadata for the 4 real service pages. The other 5 service
// routes (additional-builds, audit-questionnaire, building, integrations,
// ops-systems) and /guide are 5-line redirects to other pages — JSON-LD on
// a redirect is invisible to crawlers, so they get their schema when they
// get their content. See Session 2026-06-05 (P1 SEO PR 2).

const SITE_URL = 'https://emvyai.com' as const

export type ServiceData = {
  name: string
  description: string
  url: string
  serviceType: string
}

export const SERVICES = {
  'discovery-call': {
    name: 'Free Discovery Call',
    description: 'Book a free 15-minute discovery call with EMVY.',
    url: `${SITE_URL}/services/discovery-call`,
    serviceType: 'Consulting call',
  },
  'ai-strategy-call': {
    name: 'AI Strategy Call',
    description: 'A paid 60-minute AI strategy session — scope, sequencing, and approach for an AI build.',
    url: `${SITE_URL}/services/ai-strategy-call`,
    serviceType: 'Consulting call',
  },
  'ai-builds': {
    name: 'AI Builds',
    description: 'Build AI systems, products, and automations around the workflow that matters most.',
    url: `${SITE_URL}/services/ai-builds`,
    serviceType: 'AI implementation',
  },
  'systems-maintenance': {
    name: 'Systems Maintenance',
    description: 'Ongoing maintenance and support for AI systems after launch.',
    url: `${SITE_URL}/services/systems-maintenance`,
    serviceType: 'AI operations and support',
  },
} as const satisfies Readonly<Record<string, ServiceData>>

export type ServiceSlug = keyof typeof SERVICES

import type {
  BreadcrumbListLeaf,
  FAQPageLeaf,
  ListItem,
  LocalBusinessLeaf,
  OrganizationLeaf,
  PostalAddress,
  Question,
  ServiceLeaf,
  WebSiteLeaf,
  WithContext,
} from 'schema-dts'

const SITE_URL = 'https://emvyai.com' as const
const SITE_NAME = 'EMVY' as const
const SITE_DESCRIPTION =
  'AI built for your business. Systems that make work easier for Australian small businesses.' as const
const SITE_LOGO = `${SITE_URL}/brand/mv-mark.svg` as const
const SITE_IMAGE = `${SITE_URL}/brand/exports/og-image.png` as const
const SITE_EMAIL = 'hello@emvyai.com' as const
const SITE_ABN = '82 488 276 510' as const
const SITE_LANGUAGE = 'en-AU' as const

const AU_ADDRESS: PostalAddress = {
  '@type': 'PostalAddress',
  addressCountry: 'AU',
}

export function organization(): WithContext<OrganizationLeaf> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
    description: SITE_DESCRIPTION,
    email: SITE_EMAIL,
    address: AU_ADDRESS,
    taxID: SITE_ABN,
  }
}

export function webSite(): WithContext<WebSiteLeaf> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
  }
}

export function localBusiness(): WithContext<LocalBusinessLeaf> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: SITE_IMAGE,
    email: SITE_EMAIL,
    address: AU_ADDRESS,
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
  }
}

export type ServiceInput = {
  name: string
  description: string
  url: string
  serviceType?: string
}

export function service(input: ServiceInput): WithContext<ServiceLeaf> {
  const out: WithContext<ServiceLeaf> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.serviceType ?? 'AI consultancy',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Australia',
    },
  }
  return out
}

export type FaqInput = {
  questions: ReadonlyArray<{ question: string; answer: string }>
}

export function faqPage(input: FaqInput): WithContext<FAQPageLeaf> {
  const mainEntity: Question[] = input.questions.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  }))
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}

export type BreadcrumbItem = { name: string; url: string }

import type { BlogPostingLeaf } from 'schema-dts'

export type BlogPostingInput = {
  title: string
  slug: string
  summary: string
  body?: string
  heroImageUrl?: string
  publishedAt?: number
  updatedAt?: number
  targetKeyword?: string
  url: string
}

export function blogPosting(input: BlogPostingInput): WithContext<BlogPostingLeaf> {
  const leaf: BlogPostingLeaf = {
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.summary,
    url: input.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    datePublished: input.publishedAt
      ? new Date(input.publishedAt).toISOString()
      : undefined,
    dateModified: input.updatedAt
      ? new Date(input.updatedAt).toISOString()
      : undefined,
    author: { '@type': 'Person', name: 'Jake Wun', url: `${SITE_URL}/about` },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: SITE_LOGO },
    },
    image: input.heroImageUrl ?? SITE_IMAGE,
    keywords: input.targetKeyword,
    inLanguage: SITE_LANGUAGE,
    articleBody: input.body ? input.body.slice(0, 5000) : undefined,
  }
  return {
    '@context': 'https://schema.org',
    ...leaf,
  } as unknown as WithContext<BlogPostingLeaf>
}

export function breadcrumbList(
  items: ReadonlyArray<BreadcrumbItem>,
): WithContext<BreadcrumbListLeaf> {
  const itemListElement: ListItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  }))
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

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
  'AI consultancy for Australian SMBs. AI strategy, process automation, custom AI solutions and data analytics for businesses ready to work smarter.' as const
const SITE_LOGO = `${SITE_URL}/emvy-mark.svg` as const
const SITE_IMAGE = `${SITE_URL}/og.png` as const
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
    priceRange: '$$',
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

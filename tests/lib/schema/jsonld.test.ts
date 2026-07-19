import { describe, it, expect } from 'vitest'
import {
  organization,
  webSite,
  localBusiness,
  service,
  faqPage,
  breadcrumbList,
} from '@/lib/schema/jsonld'

const SCHEMA_CONTEXT = 'https://schema.org'

describe('organization()', () => {
  it('uses schema.org context and Organization type', () => {
    const out = organization()
    expect(out['@context']).toBe(SCHEMA_CONTEXT)
    expect(out['@type']).toBe('Organization')
  })

  it('identifies the business as EMVY at emvyai.com', () => {
    const out = organization()
    expect(out.name).toBe('EMVY')
    expect(out.url).toBe('https://emvyai.com')
    expect(out.logo).toBe('https://emvyai.com/brand/mv-mark.svg')
  })

  it('includes contact + AU address + ABN', () => {
    const out = organization()
    expect(out.email).toBe('hello@emvyai.com')
    expect(out.taxID).toBe('82 488 276 510')
    expect(out.address).toEqual({
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    })
  })
})

describe('webSite()', () => {
  it('uses schema.org context and WebSite type', () => {
    const out = webSite()
    expect(out['@context']).toBe(SCHEMA_CONTEXT)
    expect(out['@type']).toBe('WebSite')
  })

  it('matches the business identity', () => {
    const out = webSite()
    expect(out.name).toBe('EMVY')
    expect(out.url).toBe('https://emvyai.com')
    expect(out.inLanguage).toBe('en-AU')
  })
})

describe('localBusiness()', () => {
  it('uses schema.org context and LocalBusiness type', () => {
    const out = localBusiness()
    expect(out['@context']).toBe(SCHEMA_CONTEXT)
    expect(out['@type']).toBe('LocalBusiness')
  })

  it('declares AU areaServed + AU address', () => {
    const out = localBusiness()
    expect(out.areaServed).toEqual({ '@type': 'Country', name: 'Australia' })
    expect(out.address).toEqual({
      '@type': 'PostalAddress',
      addressCountry: 'AU',
    })
  })

  it('includes the public OG image', () => {
    const out = localBusiness()
    expect(out.image).toBe('https://emvyai.com/brand/exports/og-image.png')
  })
})

describe('service()', () => {
  it('wraps the input into Service shape', () => {
    const out = service({
      name: 'AI Audit',
      description: 'A structured review of where AI can help.',
      url: 'https://emvyai.com/services/ai-assessment',
    })
    expect(out['@context']).toBe(SCHEMA_CONTEXT)
    expect(out['@type']).toBe('Service')
    expect(out.name).toBe('AI Audit')
    expect(out.description).toBe('A structured review of where AI can help.')
    expect(out.url).toBe('https://emvyai.com/services/ai-assessment')
  })

  it('defaults serviceType and links back to the EMVY provider', () => {
    const out = service({
      name: 'Build',
      description: 'Implementation.',
      url: 'https://emvyai.com/services/ai-builds',
    })
    expect(out.serviceType).toBe('AI consultancy')
    expect(out.provider).toEqual({
      '@type': 'Organization',
      name: 'EMVY',
      url: 'https://emvyai.com',
    })
  })

  it('honors an explicit serviceType override', () => {
    const out = service({
      name: 'Discovery',
      description: 'Intro call.',
      url: 'https://emvyai.com/services/discovery-call',
      serviceType: 'Consulting',
    })
    expect(out.serviceType).toBe('Consulting')
  })
})

describe('faqPage()', () => {
  it('maps Q&A pairs to Question/Answer shapes', () => {
    const out = faqPage({
      questions: [
        { question: 'What is EMVY?', answer: 'An AI consultancy.' },
        { question: 'Where are you based?', answer: 'Australia.' },
      ],
    })
    expect(out['@context']).toBe(SCHEMA_CONTEXT)
    expect(out['@type']).toBe('FAQPage')
    expect(out.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'What is EMVY?',
        acceptedAnswer: { '@type': 'Answer', text: 'An AI consultancy.' },
      },
      {
        '@type': 'Question',
        name: 'Where are you based?',
        acceptedAnswer: { '@type': 'Answer', text: 'Australia.' },
      },
    ])
  })

  it('handles an empty questions list', () => {
    const out = faqPage({ questions: [] })
    expect(out.mainEntity).toEqual([])
  })
})

describe('breadcrumbList()', () => {
  it('numbers positions from 1 and preserves order', () => {
    const out = breadcrumbList([
      { name: 'Home', url: 'https://emvyai.com' },
      { name: 'Services', url: 'https://emvyai.com/services' },
      { name: 'AI Audit', url: 'https://emvyai.com/services/ai-assessment' },
    ])
    expect(out['@context']).toBe(SCHEMA_CONTEXT)
    expect(out['@type']).toBe('BreadcrumbList')
    expect(out.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emvyai.com' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://emvyai.com/services' },
      { '@type': 'ListItem', position: 3, name: 'AI Audit', item: 'https://emvyai.com/services/ai-assessment' },
    ])
  })

  it('handles an empty list', () => {
    const out = breadcrumbList([])
    expect(out.itemListElement).toEqual([])
  })
})

describe('builder output serialization', () => {
  it('round-trips every builder through JSON.stringify + JSON.parse', () => {
    const outputs = [
      organization(),
      webSite(),
      localBusiness(),
      service({ name: 'X', description: 'Y', url: 'https://emvyai.com/x' }),
      faqPage({ questions: [{ question: 'q', answer: 'a' }] }),
      breadcrumbList([{ name: 'Home', url: 'https://emvyai.com' }]),
    ]
    for (const out of outputs) {
      const json = JSON.stringify(out)
      const parsed = JSON.parse(json)
      expect(parsed).toEqual(out)
    }
  })
})

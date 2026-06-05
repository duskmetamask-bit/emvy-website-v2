import { describe, it, expect } from 'vitest'
import { SERVICES, type ServiceSlug } from '@/lib/schema/service-data'
import { service } from '@/lib/schema/jsonld'

const EXPECTED_SLUGS: ReadonlyArray<ServiceSlug> = [
  'discovery-call',
  'ai-assessment',
  'ai-builds',
  'systems-maintenance',
]

const SITE_ORIGIN = 'https://emvyai.com'

describe('SERVICES', () => {
  it('has exactly the 4 expected service slugs', () => {
    expect(Object.keys(SERVICES).sort()).toEqual([...EXPECTED_SLUGS].sort())
  })

  it('every entry has all 4 required fields non-empty', () => {
    for (const [slug, data] of Object.entries(SERVICES)) {
      expect(data.name, `${slug}.name`).toBeTruthy()
      expect(data.description, `${slug}.description`).toBeTruthy()
      expect(data.url, `${slug}.url`).toBeTruthy()
      expect(data.serviceType, `${slug}.serviceType`).toBeTruthy()
    }
  })

  it('every url is an absolute emvyai.com URL on the matching /services/<slug> path', () => {
    for (const [slug, data] of Object.entries(SERVICES)) {
      const parsed = new URL(data.url)
      expect(parsed.origin).toBe(SITE_ORIGIN)
      expect(parsed.pathname).toBe(`/services/${slug}`)
    }
  })

  it('every entry round-trips through service() and JSON', () => {
    for (const [slug, data] of Object.entries(SERVICES)) {
      const out = service(data)
      expect(out['@type']).toBe('Service')
      expect(out.name).toBe(data.name)
      expect(out.url).toBe(data.url)
      const round = JSON.parse(JSON.stringify(out))
      expect(round).toEqual(out)
    }
  })
})

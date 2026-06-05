// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import JsonLd from '@/components/JsonLd'
import { organization, webSite } from '@/lib/schema/jsonld'

function getScript(container: HTMLElement): HTMLScriptElement {
  const script = container.querySelector('script[type="application/ld+json"]')
  if (!script) throw new Error('no application/ld+json script tag found')
  return script as HTMLScriptElement
}

describe('JsonLd', () => {
  it('renders a single application/ld+json script tag', () => {
    const { container } = render(<JsonLd data={organization()} />)
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1)
  })

  it('round-trips the data through JSON without double-encoding', () => {
    const data = organization()
    const { container } = render(<JsonLd data={data} />)
    const html = getScript(container).innerHTML
    const parsed = JSON.parse(html)
    expect(parsed).toEqual(data)
  })

  it('renders an array of schemas as a single JSON array', () => {
    const data = [organization(), webSite()]
    const { container } = render(<JsonLd data={data} />)
    const html = getScript(container).innerHTML
    const parsed = JSON.parse(html)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]['@type']).toBe('Organization')
    expect(parsed[1]['@type']).toBe('WebSite')
  })

  it('escapes < and & to prevent script-tag breakout (XSS hardening)', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Thing' as const,
      name: 'attack </script><img src=x onerror=alert(1)> & more',
    }
    const { container } = render(<JsonLd data={data} />)
    const html = getScript(container).innerHTML
    expect(html).not.toContain('</script>')
    expect(html).toContain('\\u003c')
    expect(html).toContain('\\u0026')
    const parsed = JSON.parse(html)
    expect(parsed.name).toBe('attack </script><img src=x onerror=alert(1)> & more')
  })
})

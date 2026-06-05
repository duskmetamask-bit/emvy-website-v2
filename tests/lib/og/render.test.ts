import { describe, it, expect } from 'vitest'
import { COLORS, OG_SIZE } from '@/lib/og/render'

describe('OG renderer constants', () => {
  it('uses the standard OG dimensions (1200x630)', () => {
    expect(OG_SIZE.width).toBe(1200)
    expect(OG_SIZE.height).toBe(630)
  })

  it('keeps the brand bg color aligned with globals.css', () => {
    expect(COLORS.bg).toBe('#05070b')
  })

  it('uses the brand cyan accent', () => {
    expect(COLORS.accent).toBe('#56d9ff')
  })

  it('uses a light text color that meets contrast on dark bg', () => {
    expect(COLORS.text).toBe('#f4f7fb')
  })

  it('keeps the locale-relevant muted color aligned with globals.css', () => {
    expect(COLORS.muted).toBe('#a9b5c7')
  })
})

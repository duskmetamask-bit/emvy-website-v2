import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — AI Builds'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    eyebrow: 'AI Builds',
    title: 'Custom AI systems, built for your workflow',
    subtitle:
      'From intake to handoff in weeks, not quarters. We design, ship, and integrate the AI your team actually uses.',
  })
}

import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — Free Discovery Call'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Discovery Call',
    title: 'Free 15-minute strategy call',
    subtitle:
      'No pitch. We map your highest-leverage AI opportunity and tell you if we can help.',
  })
}

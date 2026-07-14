import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — AI systems for growing businesses'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    title: 'Systems that make work easier.',
    subtitle:
      'Practical AI systems for growing Australian businesses.',
  })
}

import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — AI workflow systems for Australian small businesses'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    title: 'Find the bottlenecks. Build the systems.',
    subtitle:
      'AI workflow assessments, automation, voice agents, integrations, and custom systems.',
  })
}

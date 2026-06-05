import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — AI Assessment'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    eyebrow: 'AI Assessment',
    title: 'Where the AI opportunity actually is',
    subtitle:
      'A 2-week audit of your operations. We map every workflow, score each one for AI fit, and hand you a prioritised build list.',
  })
}

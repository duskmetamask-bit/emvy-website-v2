import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — Systems Maintenance'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Systems Maintenance',
    title: 'Keep the AI you shipped, actually working',
    subtitle:
      'Monitoring, iteration, and quarterly tune-ups. The system you built keeps learning while you run the business.',
  })
}

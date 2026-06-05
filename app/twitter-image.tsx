import { renderOgImage, OG_SIZE } from '@/lib/og/render'

export const runtime = 'edge'
export const alt = 'EMVY — AI Consultancy for Australian SMBs'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return renderOgImage({
    title: 'AI consultancy for Australian SMBs',
    subtitle:
      'AI strategy, audits, and automation systems for businesses ready to work smarter.',
  })
}

import { ImageResponse } from 'next/og'

// satori (which powers next/og) only reads TTF/OTF — woff/woff2 will fail with
// "Unsupported OpenType signature wOF2". The davelab6 mirror ships OTF in the
// `desktop font` dir. jsdelivr caches the raw GitHub file with CORS allowed.
const FONT_REGULAR =
  'https://cdn.jsdelivr.net/gh/davelab6/manrope@master/desktop%20font/manrope-regular.otf'
const FONT_SEMIBOLD =
  'https://cdn.jsdelivr.net/gh/davelab6/manrope@master/desktop%20font/manrope-semibold.otf'
const FONT_BOLD =
  'https://cdn.jsdelivr.net/gh/davelab6/manrope@master/desktop%20font/manrope-bold.otf'

const COLORS = {
  bg: '#05070b',
  bgSoft: '#0b1118',
  surface: '#131c29',
  text: '#f4f7fb',
  muted: '#a9b5c7',
  muted2: '#8091ab',
  accent: '#56d9ff',
  accentGlow: 'rgba(86, 217, 255, 0.18)',
} as const

export const OG_SIZE = { width: 1200, height: 630 } as const

export type OgRenderOptions = {
  title: string
  subtitle?: string
  eyebrow?: string
}

async function loadFonts() {
  const [regular, semibold, bold] = await Promise.all([
    fetch(FONT_REGULAR).then((r) => r.arrayBuffer()),
    fetch(FONT_SEMIBOLD).then((r) => r.arrayBuffer()),
    fetch(FONT_BOLD).then((r) => r.arrayBuffer()),
  ])
  return { regular, semibold, bold }
}

function EmvyMark() {
  return (
    <svg
      width="88"
      height="24"
      viewBox="0 0 88 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path d="M3.5 19V5h21v4H8.4v2.8h13.1v3.6H8.4V19H24.7v4H3.5Z" fill={COLORS.text} />
      <path
        d="M28.8 23V5h6.4l4.8 8.5L44.8 5h6.3v18h-4.7V12.2L40.1 23h-1.1l-6.3-10.8V23h-3.9Z"
        fill={COLORS.text}
      />
      <path
        d="M53.2 5h5.3l7 11.8L72.5 5h5.3l-10.1 18h-4.3L53.2 5Z"
        fill={COLORS.text}
      />
      <path
        d="M80.1 5h4.9l-7.1 11.1V23h-4.5v-6.9L66.4 5h5l4.8 7.6L80.1 5Z"
        fill={COLORS.text}
      />
    </svg>
  )
}

export async function renderOgImage({ title, subtitle, eyebrow }: OgRenderOptions) {
  const { regular, semibold, bold } = await loadFonts()
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgSoft} 50%, ${COLORS.surface} 100%)`,
          color: COLORS.text,
          fontFamily: 'Manrope',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-240px',
            left: '-200px',
            width: '700px',
            height: '700px',
            display: 'flex',
            background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 65%)`,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            position: 'relative',
          }}
        >
          <EmvyMark />
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: COLORS.muted,
              letterSpacing: 3,
              display: 'flex',
            }}
          >
            EMVY
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxWidth: 980,
            position: 'relative',
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: COLORS.accent,
                letterSpacing: 4,
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              color: COLORS.text,
              display: 'flex',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 26,
                fontWeight: 400,
                color: COLORS.muted,
                lineHeight: 1.35,
                display: 'flex',
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.accent,
              display: 'flex',
            }}
          >
            emvyai.com
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: COLORS.muted2,
              display: 'flex',
            }}
          >
            Strategy · Audits · Builds
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Manrope', data: regular, weight: 400, style: 'normal' },
        { name: 'Manrope', data: semibold, weight: 600, style: 'normal' },
        { name: 'Manrope', data: bold, weight: 800, style: 'normal' },
      ],
    },
  )
}

export { loadFonts, EmvyMark, COLORS }

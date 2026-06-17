/**
 * Design tokens — single source of truth for the website's visual system.
 *
 * Token values here are mirrored to CSS custom properties in
 * `app/globals.css` (additive, never replaced). The CSS side is what
 * the browser reads; this file is the canonical TS reference.
 *
 * Locked direction (EMVY website):
 * - Dark mode only (no light mode token set yet).
 * - Surfaces: deep slate, near-black with a hint of cool blue.
 * - Accents: sky / violet-blue / emerald for taste-forward variation.
 * - Typography: Manrope (body), Space Grotesk (display), JetBrains Mono.
 *
 * Token categories:
 *   1. type     — display, heading, body, mono
 *   2. spacing  — 4px base scale
 *   3. motion   — duration + easing
 *   4. color    — surface, text, accent, feedback
 *   5. radius   — small / medium / large / full
 *   6. shadow   — sm / md / lg
 *   7. z-index  — chrome layers
 *
 * Usage:
 *   - Tailwind theme references these (see tailwind.config.ts).
 *   - globals.css :root variables are kept in sync.
 *   - React components can import { colorDark, duration, ... } directly.
 */

// -----------------------------------------------------------------------------
// 1. Typography scale
// -----------------------------------------------------------------------------
// Locked: Manrope (body), Space Grotesk (display), JetBrains Mono (mono).
// Loaded via next/font/google in app/layout.tsx and exposed as CSS variables
// --font-sans, --font-display, --font-mono.

export const fontFamily = {
  body: 'var(--font-sans)',      // Manrope
  display: 'var(--font-display)', // Space Grotesk
  mono: 'var(--font-mono)',      // JetBrains Mono
} as const

/**
 * Type scale — applies fluidly with `clamp()` when needed.
 * Use display/heading in page hero / h1/h2; body in running text; small in meta.
 */
export const typeScale = {
  display: { size: '3.5rem', lineHeight: '1.05', weight: '700', letterSpacing: '-0.025em' },
  h1:      { size: '2.5rem',  lineHeight: '1.12', weight: '700', letterSpacing: '-0.02em' },
  h2:      { size: '1.875rem', lineHeight: '1.2',  weight: '700', letterSpacing: '-0.015em' },
  h3:      { size: '1.375rem', lineHeight: '1.3',  weight: '600', letterSpacing: '-0.01em' },
  h4:      { size: '1.125rem', lineHeight: '1.4',  weight: '600', letterSpacing: '0' },
  body:    { size: '1rem',    lineHeight: '1.6',  weight: '400', letterSpacing: '0' },
  small:   { size: '0.875rem', lineHeight: '1.5',  weight: '400', letterSpacing: '0' },
  caption: { size: '0.75rem',  lineHeight: '1.4',  weight: '500', letterSpacing: '0.04em' },
  mono:    { size: '0.875rem', lineHeight: '1.5',  weight: '500', letterSpacing: '0' },
} as const

// -----------------------------------------------------------------------------
// 2. Spacing scale (4px base)
// -----------------------------------------------------------------------------

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1:  '0.25rem',   // 4px
  1.5:'0.375rem',  // 6px
  2:  '0.5rem',    // 8px
  3:  '0.75rem',   // 12px
  4:  '1rem',      // 16px
  5:  '1.25rem',   // 20px
  6:  '1.5rem',    // 24px
  7:  '1.75rem',   // 28px
  8:  '2rem',      // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const

// -----------------------------------------------------------------------------
// 3. Motion
// -----------------------------------------------------------------------------
// Vercel-like: subtle, fast (150-250ms ease-out). No bouncy springs.

export const duration = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '450ms',
} as const

export const easing = {
  out: 'cubic-bezier(0.2, 0.8, 0.2, 1)',     // matches the site's existing --ease
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // reserved; avoid for production
} as const

// -----------------------------------------------------------------------------
// 4. Color (OKLCH)
// -----------------------------------------------------------------------------
// Dark-only for now. All values tuned to match the existing site aesthetic
// (deep slate surfaces, sky / violet / emerald accents).

export const colorDark = {
  // Surfaces (deepest → highest elevation)
  background:        'oklch(0.13 0.005 250)',     // --bg
  backgroundSoft:    'oklch(0.16 0.01 250)',      // --bg-soft
  surface:           'oklch(0.19 0.015 250)',     // --surface
  surfaceRaised:     'oklch(0.22 0.02 250)',      // --surface-2
  surfaceHigher:     'oklch(0.25 0.02 250)',      // --surface-3

  // Text
  foreground:        'oklch(0.97 0.005 250)',     // --text
  muted:             'oklch(0.7 0.02 250)',       // --muted
  mutedStrong:       'oklch(0.6 0.02 250)',       // --muted-2

  // Borders
  border:            'oklch(0.97 0.005 250 / 0.08)',  // --line
  borderStrong:      'oklch(0.97 0.005 250 / 0.14)',  // --line-strong

  // Brand accents
  accent:            'oklch(0.78 0.15 220)',      // --accent (sky)
  accent2:           'oklch(0.7 0.16 270)',       // --accent-2 (violet-blue)
  accent3:           'oklch(0.78 0.17 162)',      // --accent-3 (emerald)

  // Feedback
  warning:           'oklch(0.83 0.15 85)',       // --warning (amber)
} as const

// Chart palette (5 categorical colors for analytics). Distinct from semantic
// colors; tuned for sequential readability. Shared with emvy-board.
export const chartPalette = [
  'oklch(0.78 0.17 162)',   // emerald
  'oklch(0.78 0.15 220)',   // sky
  'oklch(0.7 0.16 270)',    // violet
  'oklch(0.83 0.15 85)',    // amber
  'oklch(0.7 0.2 25)',      // rose
] as const

// Chart empty/placeholder color. Use for "no data" fallbacks so a real
// category color is never shown for an empty dataset.
export const chartEmpty = 'oklch(0.55 0.01 250)' as const

// -----------------------------------------------------------------------------
// 4b. Brand — canonical colors + voice tokens
// -----------------------------------------------------------------------------
// These are the *brand* uses of the design tokens. The values mirror the
// system tokens above; this object is the brand reference and the place
// where the canonical hex values (for hand-off to designers / brand guides)
// live. Use the system tokens (`colorDark.*`) in code; use the hex values
// in `brand.*` for the brand book, social profiles, and external assets.

export const brand = {
  /** Primary mark color — the MV monogram and the primary call-to-action. */
  accent: '#56d9ff',
  /** Primary dark surface — page background, header, footer. */
  background: '#0a1118',
  /** High-elevation surface — cards, modals, raised panels. */
  surface: '#161b22',
  /** Primary text color on dark. */
  foreground: '#f4f7fb',
  /** Muted text on dark — secondary copy, captions. */
  muted: '#a9b3bf',
  /** Hairline border / divider. */
  border: 'rgba(244, 247, 251, 0.08)',
  /** Stronger border for emphasis. */
  borderStrong: 'rgba(244, 247, 251, 0.14)',

  /** Secondary accent — used sparingly, for charts and variety. */
  accentViolet: '#7c8cff',
  /** Secondary accent — emerald, used for success / positive signals. */
  accentEmerald: '#4ade80',
  /** Secondary accent — amber, used for warnings. */
  accentAmber: '#fbbf24',

  /** Brand mark path data (MV monogram). Single path, even-odd fill. */
  markPath: 'M 16 30 H 184 V 170 H 16 Z M 52 30 L 148 30 L 100 150 Z',
  /** MV monogram viewBox. */
  markViewBox: '0 0 200 200',
  /** Minimum mark height in pixels. Below this, readability suffers. */
  markMinSize: 16,
  /** Clear space around the mark, as a fraction of the mark's height. */
  markClearSpace: 0.25,
} as const

/**
 * Brand voice — the rules that govern EMVY copy. Read these as
 * "if your sentence violates one of these, rewrite it." Used in
 * `config/brand.ts` for templates and in the brand guidelines doc.
 */
export const voice = {
  /** Single-line position. The sentence a stranger reads first. */
  position: 'Find out where AI actually pays off — before you spend a dollar on it.',
  /** Brand promise in one phrase. */
  promise: 'Calm expertise. Plain-spoken. Built to work.',
  /** Voice rules — do these, avoid their opposites. */
  rules: [
    {
      do: 'Direct, capable, human. Short sentences, no jargon.',
      dont: 'Corporate, breathless, hedge-y. Buzzwords. "Leverage." "Empower."',
    },
    {
      do: 'Help first, pitch second. Diagnose before recommending.',
      dont: 'Lead with the sale. Open with credentials, awards, or jargon.',
    },
    {
      do: 'Plain language for AI concepts. Name the tool, the workflow, the change.',
      dont: 'Gatekeep with "AI" as a black box. Hide the how behind buzzwords.',
    },
    {
      do: 'Active verbs over adjectives. "Build" not "powerful". "Find" not "innovative".',
      dont: 'Stack adjectives. "Cutting-edge, transformative, world-class AI."',
    },
    {
      do: 'Specific over abstract. "Send me the next 30 days of invoices" not "optimise your finance workflow".',
      dont: 'Vague aspiration. "Unlock the future of work."',
    },
  ] as const,
} as const

// -----------------------------------------------------------------------------
// 5. Radius
// -----------------------------------------------------------------------------

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

// -----------------------------------------------------------------------------
// 6. Shadow
// -----------------------------------------------------------------------------
// Subtle, low-spread. Vercel-like.

export const shadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.20)',
  md: '0 16px 42px rgba(0, 0, 0, 0.28)',
  lg: '0 24px 90px rgba(0, 0, 0, 0.38)',
} as const

// -----------------------------------------------------------------------------
// 7. Z-index
// -----------------------------------------------------------------------------

export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 40,
  nav: 50,
  overlay: 80,
  modal: 100,
  toast: 120,
} as const

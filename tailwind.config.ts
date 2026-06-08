import type { Config } from 'tailwindcss'
import {
  colorDark,
  duration,
  easing,
  fontFamily as emvyFont,
  radius as emvyRadius,
  shadow as emvyShadow,
  typeScale,
} from './lib/design-tokens'

/**
 * Tailwind theme — wires the design tokens in `lib/design-tokens.ts` so
 * utility classes (`bg-surface`, `text-muted`, `font-display`, `ease-out`, …)
 * resolve to the same values the CSS custom properties in `app/globals.css`
 * expose. The TS file is canonical; keep this in sync.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        bg: colorDark.background,
        'bg-soft': colorDark.backgroundSoft,
        surface: colorDark.surface,
        'surface-2': colorDark.surfaceRaised,
        'surface-3': colorDark.surfaceHigher,
        text: colorDark.foreground,
        muted: colorDark.muted,
        'muted-2': colorDark.mutedStrong,
        accent: colorDark.accent,
        'accent-2': colorDark.accent2,
        'accent-3': colorDark.accent3,
        warning: colorDark.warning,
      },
      fontFamily: {
        sans: emvyFont.body.split(','),   // var(--font-sans)
        display: emvyFont.display.split(','),
        mono: emvyFont.mono.split(','),
      },
      fontSize: Object.fromEntries(
        Object.entries(typeScale).map(([k, v]) => [k, [v.size, { lineHeight: v.lineHeight, letterSpacing: v.letterSpacing, fontWeight: v.weight }]])
      ),
      borderRadius: {
        sm: emvyRadius.sm,
        md: emvyRadius.md,
        lg: emvyRadius.lg,
        xl: emvyRadius.xl,
      },
      boxShadow: {
        sm: emvyShadow.sm,
        md: emvyShadow.md,
        lg: emvyShadow.lg,
      },
      transitionDuration: {
        fast: duration.fast,
        base: duration.base,
        slow: duration.slow,
        slower: duration.slower,
      },
      transitionTimingFunction: {
        out: easing.out,
        inOut: easing.inOut,
        spring: easing.spring,
      },
    },
  },
  plugins: [],
}

export default config

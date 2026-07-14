/**
 * EMVY brand config — the strings that are "EMVY the agency" rather than
 * "lead pipeline infrastructure". Per the Build Principles in
 * `CONTEXT.md` §Build Principles, anything that is EMVY-specific lives
 * in `config/`, not in code, so the same framework can be re-skinned
 * for a different brand without touching logic.
 *
 * Visual brand tokens (colors, type, motion) live in `lib/design-tokens.ts`.
 * This file is the verbal / naming layer.
 */

export const brand = {
  /** Canonical brand name, as it appears in headings. */
  name: 'EMVY',
  /** Domain, used in URLs, email addresses, and the like. */
  domain: 'emvyai.com',
  /** Site URL, used for absolute paths in metadata and JSON-LD. */
  url: 'https://emvyai.com',
  /** Email contact. */
  email: 'hello@emvyai.com',
  /** Australian Business Number (for JSON-LD). */
  abn: '82 488 276 510',
  /** Site language. */
  language: 'en-AU',
  /** Default locale for OpenGraph. */
  locale: 'en_AU',

  /** Hero tagline — the long form, the sentence a stranger reads first. */
  tagline: 'Practical AI systems for growing businesses.',
  /** Short tagline — the all-caps / display form, used in the OG image and headers. */
  taglineShort: 'PRACTICAL AI SYSTEMS.',
  /** Display positioning — what we are, in one line. */
  positioning: 'AI systems for growing businesses.',
  /** Voice summary — three words that summarise how the brand sounds. */
  voice: 'Calm expertise. Plain-spoken. Built to work.',

  /** Title templates for Next.js metadata. */
  titleDefault: 'EMVY — AI Systems for Growing Businesses',
  titleTemplate: '%s | EMVY',

  /** Default description for metadata. */
  description: 'Practical AI systems for Australian businesses: workflow improvement, automation, integrations, and custom systems.',
  descriptionShort: 'Practical AI systems for growing Australian businesses.',

  /** OpenGraph site name. */
  siteName: 'EMVY',
} as const

export type BrandConfig = typeof brand

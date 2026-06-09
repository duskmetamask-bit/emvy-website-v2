import type { Metadata, Viewport } from "next"
import type { ReactNode } from 'react'
import { Manrope, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { colorDark } from "@/lib/design-tokens"
import "./globals.css"
import SiteChrome from "@/components/SiteChrome"
import JsonLd from "@/components/JsonLd"
import { organization, webSite, localBusiness } from "@/lib/schema/jsonld"

// Self-hosted via next/font. Variable CSS vars feed the design tokens in
// `lib/design-tokens.ts`; do not add a Google Fonts <link> alongside.
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL("https://emvyai.com"),
  title: {
    default: "EMVY — AI Consultancy for Australian SMBs",
    template: "%s | EMVY"
  },
  description: "AI consultancy for Australian SMBs. AI strategy, process automation, custom AI solutions and data analytics for businesses ready to work smarter.",
  keywords: ["AI consultancy", "AI agents", "workflow automation", "Australian business AI", "AI strategy", "AI operations", "EMVY"],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/emvy-mark.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "EMVY — AI Consultancy for Australian SMBs",
    description: "AI strategy, audits, and automation systems for businesses ready to work smarter.",
    url: "https://emvyai.com",
    siteName: "EMVY",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "EMVY — AI Consultancy for Australian SMBs",
    description: "AI strategy, audits, and automation systems for businesses ready to work smarter.",
  },
  robots: {
    index: true,
    follow: true
  },
}

// themeColor must live on the separate `viewport` export in Next 14+ to
// keep type-checking honest. Value is the dark-mode background token.
export const viewport: Viewport = {
  themeColor: colorDark.background,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en-AU"
      className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <JsonLd data={[organization(), webSite(), localBusiness()]} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}

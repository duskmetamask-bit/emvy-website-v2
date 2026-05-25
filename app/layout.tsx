import type { Metadata } from "next"
import type { ReactNode } from 'react'
import "./globals.css"
import SiteChrome from "@/components/SiteChrome"

export const metadata: Metadata = {
  metadataBase: new URL("https://emvyai.com"),
  title: {
    default: "EMVY — AI Consultancy for Australian SMBs",
    template: "%s | EMVY"
  },
  description: "AI consultancy for Australian SMBs. AI strategy, process automation, custom AI solutions and data analytics for businesses ready to work smarter.",
  keywords: ["AI consultancy", "AI agents", "workflow automation", "Australian business AI", "AI strategy", "AI operations", "EMVY"],
  openGraph: {
    title: "EMVY — AI Consultancy for Australian SMBs",
    description: "AI strategy, audits, and automation systems for businesses ready to work smarter.",
    url: "https://emvyai.com",
    siteName: "EMVY",
    type: "website",
    locale: "en_AU"
  },
  robots: {
    index: true,
    follow: true
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}

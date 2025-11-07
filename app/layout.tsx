import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import HeadManager from "@/components/HeadManager"
import ClickTracker from "@/components/ClickTracker"
import PWAInstaller from "@/components/PWAInstaller"
import DynamicTheme from "@/components/DynamicTheme"
import VerificationWrapper from "@/components/VerificationWrapper"
import { DevToolsBlocker } from "@/components/DevToolsBlocker"

export const metadata: Metadata = {
  title: "Recarga Jogo",
  description: "Site oficial de recarga para jogos! Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança. Recarga rápida, bônus exclusivos e preços promocionais. Centro de recarga oficial de jogos mobile.",
  keywords: [
    // Free Fire - Principal
    "recarga free fire",
    "comprar diamantes free fire", 
    "diamantes free fire barato",
    "free fire recarga oficial",
    "site recarga free fire",
    "diamantes ff",
    "recarga ff oficial",
    "free fire diamantes",
    "recarga free fire pix",
    "comprar diamantes ff",
    "free fire recarga rapida",
    "diamantes free fire promocao",
    
    // Delta Force - Principal
    "recarga delta force",
    "comprar creditos delta force",
    "delta force recarga oficial",
    "site recarga delta force",
    "delta force coins",
    "comprar coins delta force",
    "delta force recarga rapida",
    "creditos delta force barato",
    "delta force recarga pix",
    
    // Haikyu - Principal
    "recarga haikyu",
    "comprar moedas haikyu",
    "haikyu recarga oficial",
    "site recarga haikyu",
    "haikyu fly high recarga",
    "diamantes estelares haikyu",
    "haikyu recarga rapida",
    "moedas haikyu barato",
    
    // Long-tail (alta conversão)
    "onde comprar diamantes free fire",
    "melhor site recarga free fire",
    "recarga free fire confiavel",
    "recarga free fire segura",
    "comprar diamantes free fire barato",
    "site oficial recarga free fire",
    "recarga delta force confiavel",
    "melhor site delta force",
    "recarga haikyu confiavel",
    
    // Geral - Conversão
    "recarga jogo",
    "site de recarga de jogos",
    "recarga jogos mobile",
    "comprar creditos jogos",
    "recarga oficial jogos",
    "centro de recarga",
    "recarga segura jogos",
    "recarga rapida jogos",
    "bonus recarga jogos",
    "promocao recarga jogos",
    "recarga jogos pix",
    "recarga jogos barato"
  ],
  authors: [{ name: "Centro Oficial de Recarga" }],
  generator: "Next.js",
  applicationName: "Centro de Recarga Oficial",
  referrer: "origin-when-cross-origin",
  creator: "Centro de Recarga",
  publisher: "Centro de Recarga Oficial",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Recarga Jogo",
    description: "🔥 Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança! Recarga oficial com bônus exclusivos e preços promocionais.",
    url: "/",
    siteName: "Centro de Recarga Oficial",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Centro de Recarga Oficial - Free Fire, Delta Force, Haikyu"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Recarga Jogo",
    description: "🔥 Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança! Recarga oficial.",
    images: ["/images/twitter-card.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recarga Jogo"
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans">
        <HeadManager />
        <DynamicTheme />
        <PWAInstaller />
        <DevToolsBlocker />
        <VerificationWrapper>
          <ClickTracker>
            <Suspense fallback={null}>{children}</Suspense>
          </ClickTracker>
        </VerificationWrapper>
      </body>
    </html>
  )
}

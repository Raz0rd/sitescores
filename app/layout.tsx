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
  title: "Loja de Itens Digitais | Recarga para Jogos Mobile",
  description: "Plataforma de recarga para jogos mobile. Entrega rápida e segura. Suporte 24h.",
  keywords: [
    "recarga jogos",
    "itens digitais",
    "loja online",
    "jogos mobile",
    "recarga segura",
    "plataforma digital",
    "loja virtual",
    "e-commerce"
  ],
  authors: [{ name: "Loja Digital" }],
  generator: "Next.js",
  applicationName: "Loja Digital",
  referrer: "origin-when-cross-origin",
  creator: "Plataforma Digital",
  publisher: "Loja Online",
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
    title: "Loja Digital | Recarga para Jogos",
    description: "Plataforma de recarga para jogos mobile. Entrega rápida e segura.",
    url: "/",
    siteName: "Loja Digital",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Loja de Diamantes Free Fire - Comprar Itens para Jogos Mobile"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Loja de Diamantes Free Fire | Comprar Itens Jogos",
    description: "🔥 Loja oficial! Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança e preços promocionais.",
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
    title: "Recarga Jogo Free Fire"
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

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
  title: "Loja Oficial de Diamantes Free Fire | Comprar Créditos Delta Force e Moedas Haikyu",
  description: "Loja oficial de itens para jogos mobile. Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança. Entrega instantânea, preços promocionais e suporte 24h. Plataforma confiável de venda de itens digitais para jogos. Não somos cassino ou jogo de azar. Em conformidade com políticas Google Ads.",
  keywords: [
    // Free Fire - Venda de Itens
    "comprar diamantes free fire",
    "loja diamantes free fire", 
    "venda diamantes ff",
    "loja oficial free fire",
    "diamantes ff preço",
    "diamantes free fire barato",
    "comprar diamantes ff online",
    "free fire diamantes loja",
    "vender diamantes free fire",
    "loja ff diamantes",
    "comprar itens free fire",
    "free fire loja oficial",
    
    // Delta Force - Venda de Itens
    "comprar creditos delta force",
    "loja delta force",
    "venda creditos delta force",
    "delta force loja oficial",
    "comprar coins delta force",
    "delta force coins preço",
    "loja coins delta force",
    "creditos delta force barato",
    "comprar itens delta force",
    
    // Haikyu - Venda de Itens
    "comprar moedas haikyu",
    "loja haikyu",
    "venda moedas haikyu",
    "haikyu loja oficial",
    "haikyu fly high loja",
    "comprar diamantes estelares haikyu",
    "loja moedas haikyu",
    "moedas haikyu preço",
    
    // Long-tail (alta conversão)
    "onde comprar diamantes free fire",
    "melhor loja free fire",
    "loja free fire confiavel",
    "comprar diamantes free fire seguro",
    "loja oficial diamantes free fire",
    "melhor loja delta force",
    "loja delta force confiavel",
    "melhor loja haikyu",
    
    // Geral - Venda de Itens Digitais
    "loja de itens para jogos",
    "comprar itens jogos mobile",
    "venda itens jogos",
    "loja oficial jogos mobile",
    "comprar creditos jogos online",
    "loja itens digitais jogos",
    "venda moedas jogos",
    "comprar diamantes jogos",
    "loja creditos jogos",
    "plataforma venda itens jogos",
    "e-commerce itens jogos",
    "marketplace jogos mobile"
  ],
  authors: [{ name: "Loja Oficial de Itens para Jogos" }],
  generator: "Next.js",
  applicationName: "Loja de Diamantes e Créditos para Jogos",
  referrer: "origin-when-cross-origin",
  creator: "Loja Oficial de Itens Digitais",
  publisher: "Plataforma de Venda de Itens para Jogos Mobile",
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
    title: "Loja de Diamantes Free Fire | Comprar Itens para Jogos",
    description: "🔥 Loja oficial de itens para jogos! Compre diamantes Free Fire, créditos Delta Force e moedas Haikyu com segurança. Preços promocionais e entrega instantânea.",
    url: "/",
    siteName: "Loja Oficial de Itens para Jogos Mobile",
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

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"
import HeadManager from "@/components/HeadManager"
import ClickTracker from "@/components/ClickTracker"
import DynamicTheme from "@/components/DynamicTheme"
import VerificationWrapper from "@/components/VerificationWrapper"
import { DevToolsBlocker } from "@/components/DevToolsBlocker"
import UtmifyScripts from "@/components/UtmifyScripts"
// import SidebarCart from "@/components/loja/SidebarCart" // DESABILITADO - Usando botão fixo otimizado
import { CartProvider } from "@/contexts/CartContext"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Diamantes Free Fire Baratos - Recarga Rápida via PIX | Entrega Imediata",
  description: "Compre diamantes Free Fire com os melhores preços do Brasil! Entrega imediata, pagamento via PIX, 100% seguro. Promoção especial de diamantes FF com desconto. Recarga rápida e confiável.",
  keywords: [
    "diamantes free fire baratos",
    "comprar diamantes free fire",
    "recarga diamantes ff",
    "diamantes ff promoção",
    "free fire diamantes pix",
    "recarga free fire barata",
    "diamantes free fire desconto",
    "comprar diamantes ff",
    "loja diamantes free fire",
    "recarga ff rapida",
    "diamantes free fire entrega imediata",
    "free fire recarga segura",
    "pagamento pix diamantes",
    "promoção diamantes ff"
  ],
  authors: [{ name: "SpeedRepair" }],
  generator: "Next.js",
  applicationName: "SpeedRepair",
  referrer: "origin-when-cross-origin",
  creator: "SpeedRepair",
  publisher: "SpeedRepair - LUIZ ANTONIO SOUZA DOS SANTOS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://booyahstrikeforce.store'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DeltaForce - Recarga de Diamantes Free Fire",
    description: "Compre diamantes para Free Fire com segurança. Entrega em até 5 minutos via PIX. Loja oficial de recargas.",
    url: "/",
    siteName: "DeltaForce",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SpeedRepair - Portal Digital"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DeltaForce - Recarga de Diamantes Free Fire",
    description: "Compre diamantes para Free Fire com segurança. Entrega em até 5 minutos via PIX.",
    images: ["/images/twitter-card.jpg"],
  },
  icons: {
    icon: '/images/shipbux.ico',
    apple: '/images/shipbuxlogo.png',
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
      <head>
        {/* TikTok Pixel - Inline no HTML source */}
        <Script
          id="tiktok-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

  ttq.load('D4OH89BC77U4IAHDSVMG');
  ttq.page();
}(window, document, 'ttq');
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <HeadManager />
        <DynamicTheme />
        <DevToolsBlocker />
        <UtmifyScripts />
        <CartProvider>
          {/* SidebarCart REMOVIDO - Usando FixedCartButton no LojaLayout */}
          <VerificationWrapper>
            <ClickTracker>
              <Suspense fallback={null}>{children}</Suspense>
            </ClickTracker>
          </VerificationWrapper>
        </CartProvider>
      </body>
    </html>
  )
}

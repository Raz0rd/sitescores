import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import HeadManager from "@/components/HeadManager"
import ClickTracker from "@/components/ClickTracker"
import DynamicTheme from "@/components/DynamicTheme"
import { DevToolsBlocker } from "@/components/DevToolsBlocker"
import WhitePageWrapper from "@/components/WhitePageWrapper"
import AntiScraping from "@/components/AntiScraping"
import GoogleTagConditional from "@/components/GoogleTagConditional"

// Metadata para SEO
export const metadata: Metadata = {
  title: "Eventos e Promoções",
  description: "Plataforma de eventos e promoções digitais",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17731323187'}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17731323187'}');
            `
          }}
        />
        
        {/* Noscript no head para funcionar sem JavaScript */}
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17731323187'}`}
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
      </head>
      <body className="font-sans">
        {/* Google Tag - APENAS em / e /success */}
        <GoogleTagConditional />

        {/* Script blocking - executa IMEDIATAMENTE antes de tudo */}
        <Script
          id="js-enabled"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('js-enabled');
              })();
            `
          }}
        />
        
        {/* Loading inline - aparece ANTES de qualquer JS */}
        <div className="js-loading">
          <div style={{position: 'relative', width: '48px', height: '48px'}}>
            <div style={{position: 'absolute', inset: 0, border: '4px solid #1f2937', borderRadius: '9999px'}}></div>
            <div className="spinner-fast" style={{position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#dc2626', borderRadius: '9999px'}}></div>
          </div>
        </div>

        <HeadManager />
        <DynamicTheme />
        <DevToolsBlocker />
        <AntiScraping>
          <WhitePageWrapper>
            <ClickTracker>
              <Suspense fallback={null}>{children}</Suspense>
            </ClickTracker>
          </WhitePageWrapper>
        </AntiScraping>
      </body>
    </html>
  )
}

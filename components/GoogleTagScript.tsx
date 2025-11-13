'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'

/**
 * Componente para injetar Google Tag diretamente no HTML
 * Aparece no source da página (não via JavaScript)
 */
export default function GoogleTagScript() {
  const pathname = usePathname()
  
  // Carregar APENAS na página inicial (/) e sucesso (/success)
  const allowedPages = ['/', '/success']
  if (!allowedPages.includes(pathname)) {
    return null
  }

  const googleAdsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true'
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17703595002'
  
  if (!googleAdsEnabled) {
    return null
  }

  return (
    <>
      {/* Google Tag Manager - aparece no source */}
      <Script
        id="google-gtag-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAdsId}');
          `
        }}
      />
    </>
  )
}

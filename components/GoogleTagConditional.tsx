'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Sistema de páginas:
 * - INICIAL: WhitePage (antes de clicar) → MOSTRA tag
 * - LOJA: Página de recarga (depois de clicar) → NÃO MOSTRA tag
 * - SUCESSO: Página de conversão → MOSTRA tag
 * - NOSCRIPT: Sem JavaScript → MOSTRA iframe (no layout.tsx)
 */

type PageType = 'inicial' | 'loja' | 'sucesso' | 'outra'

export default function GoogleTagConditional() {
  const pathname = usePathname()
  const [pageType, setPageType] = useState<PageType | null>(null)
  
  // Determinar tipo de página
  useEffect(() => {
    if (pathname === '/success') {
      setPageType('sucesso')
      return
    }
    
    if (pathname === '/') {
      const whitePagePassed = localStorage.getItem('whitepage_passed')
      setPageType(whitePagePassed ? 'loja' : 'inicial')
    } else {
      setPageType('outra')
    }
  }, [pathname])
  
  // Remover scripts se estiver na LOJA
  useEffect(() => {
    if (pageType === 'loja') {
      // Remover todos os scripts do Google
      const scripts = document.querySelectorAll('script[src*="googletagmanager.com"], script[id*="google-gtag"]')
      scripts.forEach(script => script.remove())
      
      // Bloquear gtag
      // @ts-ignore
      if (window.dataLayer) window.dataLayer = []
      // @ts-ignore
      if (window.gtag) window.gtag = () => {}
    }
  }, [pageType])

  const googleAdsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true'
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17703595002'
  
  if (!googleAdsEnabled) {
    return null
  }
  
  // Renderizar scripts APENAS se NÃO for LOJA
  // Isso faz os scripts aparecerem no source do HTML inicial
  if (pageType === 'loja') {
    return null
  }

  return (
    <>
      <script
        id="google-gtag-ssr"
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
      />
      <script
        id="google-gtag-init-ssr"
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

'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Sistema de páginas:
 * - INICIAL: WhitePage (antes de clicar) → MOSTRA tag
 * - LOJA: Página de recarga (depois de clicar) → NÃO MOSTRA tag
 * - SUCESSO: Página de conversão → NÃO MOSTRA tag (evitar suspensão)
 * - NOSCRIPT: Sem JavaScript → MOSTRA iframe (no layout.tsx)
 */

type PageType = 'inicial' | 'loja' | 'sucesso' | 'outra'

export default function GoogleTagConditional() {
  const pathname = usePathname()
  const [pageType, setPageType] = useState<PageType | null>(null)
  
  // Determinar tipo de página
  useEffect(() => {
    if (pathname === '/success' || pathname === '/sucesso') {
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
  
  // Remover scripts se estiver na LOJA ou SUCESSO
  useEffect(() => {
    if (pageType === 'loja' || pageType === 'sucesso') {
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
  const googleAdsIds = process.env.NEXT_PUBLIC_GOOGLE_ADS_IDS || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  
  if (!googleAdsEnabled || !googleAdsIds) {
    return null
  }
  
  // Renderizar scripts APENAS se NÃO for LOJA ou SUCESSO
  // Isso faz os scripts aparecerem no source do HTML inicial
  if (pageType === 'loja' || pageType === 'sucesso') {
    return null
  }

  // Separar múltiplas tags (suporta vírgula ou apenas uma tag)
  const adsIdArray = googleAdsIds.split(',').map(id => id.trim()).filter(id => id)
  const primaryAdsId = adsIdArray[0] // Primeira tag para carregar o script

  return (
    <>
      <script
        id="google-gtag-ssr"
        defer
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryAdsId}`}
      />
      <script
        id="google-gtag-init-ssr"
        defer
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${adsIdArray.map(id => `gtag('config', '${id}');`).join('\n            ')}
          `
        }}
      />
    </>
  )
}

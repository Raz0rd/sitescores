"use client"

import { useEffect, useState } from 'react'
import RecargaPage from './recarga/page'

export default function HomePage() {
  const [hasParams, setHasParams] = useState(false)
  
  useEffect(() => {
    // Verificar se tem parâmetros na URL (como ?app=100067, ?app=100157, ?app=100153)
    if (typeof window !== 'undefined') {
      const params = window.location.search
      const urlParams = new URLSearchParams(params)
      const appParam = urlParams.get('app')
      
      // Se tem parâmetro app (qualquer jogo: Free Fire, Delta Force, Haikyu)
      if (appParam) {
        // Mudar a URL para /recarga sem dar refresh
        window.history.pushState({}, '', `/recarga${params}`)
        setHasParams(true)
      }
    }
  }, [])
  
  // Se tiver parâmetros, renderizar a página de recarga diretamente
  if (hasParams) {
    return <RecargaPage />
  }
  
  // Sem parâmetros: A WhitePage será mostrada pelo WhitePageWrapper no layout.tsx
  // Em localhost, o WhitePageWrapper libera tudo automaticamente
  return null
}

'use client'

import { useState, useEffect } from 'react'
import WhitePage from './WhitePage'

interface WhitePageWrapperProps {
  children: React.ReactNode
}

export default function WhitePageWrapper({ children }: WhitePageWrapperProps) {
  const [showWhitePage, setShowWhitePage] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Começa como loading
  const [isBot, setIsBot] = useState(false)

  useEffect(() => {
    // Garantir que está no client-side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // ============================================
    // 🔒 ROTAS PÚBLICAS (sem whitepage)
    // ============================================
    const currentPath = window.location.pathname
    
    // Rotas que NÃO precisam de whitepage
    const publicRoutes = ['/cupons', '/success', '/sucesso', '/checkout', '/termos', '/privacidade', '/blog']
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
    
    if (isPublicRoute) {
      setIsLoading(false)
      return
    }
    
    // ============================================
    // 🎯 CLOAKER - Verificar cookie
    // ============================================
    const cloakerEnabled = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
    
    if (cloakerEnabled) {
      // Verificar se tem cookie do cloaker
      const hasCloakerCookie = document.cookie.includes('cloaker_verified=true')
      
      if (!hasCloakerCookie) {
        // Bot - mostrar whitepage
        setShowWhitePage(true)
        setIsBot(true)
        setIsLoading(false)
        return
      }
      
      // Usuário real - vai DIRETO pra loja
      setIsLoading(false)
      return
    }
    
    // ============================================
    // 🎯 WHITEPAGE - Modo sem cloaker (fallback)
    // ============================================
    // Verificar se usuário já passou pela whitepage
    const whitePagePassed = localStorage.getItem('whitepage_passed')
    
    if (!whitePagePassed) {
      // Mostrar WhitePage genérica (sem marcas de jogos)
      setShowWhitePage(true)
      setIsLoading(false)
      return
    }
    
    // Se já passou pela whitepage, mostrar conteúdo direto
    setIsLoading(false)
  }, [])

  const handleWhitePageActivate = () => {
    // ============================================
    // 🎯 CLOAKER - Verificar se é bot ou usuário
    // ============================================
    const cloakerEnabled = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
    
    if (cloakerEnabled) {
      // Verificar se tem cookie do cloaker
      const hasCloakerCookie = document.cookie.includes('cloaker_verified=true')
      
      if (!hasCloakerCookie) {
        // BOT - não fazer nada, botão já está em loading infinito
        console.log('🤖 [WhitePage] Bot tentou clicar - bloqueado silenciosamente')
        return
      }
    }
    
    // USUÁRIO REAL - permitir acesso
    console.log('👤 [WhitePage] Usuário real liberado')
    localStorage.setItem('whitepage_passed', 'true')
    localStorage.setItem('whitepage_passed_at', Date.now().toString())
    
    // Esconder whitepage e mostrar conteúdo direto
    setShowWhitePage(false)
  }

  // WhitePage - Primeira camada (Google Ads compliant)
  if (showWhitePage) {
    return <WhitePage onActivate={handleWhitePageActivate} isBot={isBot} />
  }

  // Loading inicial
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-black">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar conteúdo direto (sem verificação de usuário)
  return <>{children}</>
}

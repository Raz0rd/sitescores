'use client'

import { useState, useEffect } from 'react'
import WhitePage from './WhitePage'

interface WhitePageWrapperProps {
  children: React.ReactNode
}

export default function WhitePageWrapper({ children }: WhitePageWrapperProps) {
  const [showWhitePage, setShowWhitePage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    const publicRoutes = ['/cupons', '/success', '/sucesso', '/checkout', '/termos', '/privacidade']
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
    
    if (isPublicRoute) {
      setIsLoading(false)
      return
    }
    
    // ============================================
    // 🎯 CLOAKER - Verificar cookie do middleware
    // ============================================
    // Se o cloaker está ativado, verificar cookie
    const cloakerEnabled = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
    
    if (cloakerEnabled) {
      // Verificar se tem cookie do cloaker (setado pelo middleware)
      const hasCloakerCookie = document.cookie.includes('cloaker_verified=true')
      
      if (!hasCloakerCookie) {
        // Bot detectado - mostrar whitepage
        setShowWhitePage(true)
        setIsBot(true) // Marcar como bot
        setIsLoading(false)
        return
      }
      
      // Usuário real - verificar se já passou pela whitepage
      const whitePagePassed = localStorage.getItem('whitepage_passed')
      
      if (!whitePagePassed) {
        // Primeira vez do usuário real - mostrar whitepage
        setShowWhitePage(true)
        setIsLoading(false)
        return
      }
      
      // Usuário real que já passou - mostrar loja
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
      // Verificar se tem cookie do cloaker (setado pelo middleware)
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
      <div className="fixed inset-0 z-50 bg-gray-100" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(229, 231, 235, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 70% 20%, rgba(243, 244, 246, 0.6) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(229, 231, 235, 0.7) 0%, transparent 60%),
          radial-gradient(circle at 30% 90%, rgba(243, 244, 246, 0.5) 0%, transparent 45%)
        `
      }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-800">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar conteúdo direto (sem verificação de usuário)
  return <>{children}</>
}

'use client'

import { useState, useEffect } from 'react'
import WhitePage from './WhitePage'

interface WhitePageWrapperProps {
  children: React.ReactNode
}

export default function WhitePageWrapper({ children }: WhitePageWrapperProps) {
  // EM DESENVOLVIMENTO, DESABILITAR COMPLETAMENTE O WRAPPER
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return <>{children}</>
  }

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
    // 🔒 LOCALHOST/REDE LOCAL - Liberar tudo
    // ============================================
    const hostname = window.location.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')
    
    // Em localhost, liberar TUDO
    if (isLocalhost) {
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
      
      // Usuário real com cookie - redirecionar para /recarga se estiver na raiz
      if (currentPath === '/') {
        const currentParams = window.location.search
        window.location.href = `/recarga${currentParams}`
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
    const cloakerEnabled = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
    
    if (!cloakerEnabled) {
      // Sem cloaker - permitir acesso direto
      localStorage.setItem('whitepage_passed', 'true')
      localStorage.setItem('whitepage_passed_at', Date.now().toString())
      
      // Redirecionar para /recarga preservando parâmetros
      if (typeof window !== 'undefined') {
        const currentParams = window.location.search
        window.location.href = `/recarga${currentParams}`
      }
      return
    }
    
    // Com cloaker - botão só fica em loading infinito
    // O cloaker no middleware é quem decide se libera ou não
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

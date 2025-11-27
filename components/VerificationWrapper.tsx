'use client'

import { useState, useEffect } from 'react'
import WhitePage from './WhitePage'

interface VerificationWrapperProps {
  children: React.ReactNode
}

export default function VerificationWrapper({ children }: VerificationWrapperProps) {
  const [showWhitePage, setShowWhitePage] = useState(false) // WhitePage genérica
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Garantir que está no client-side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // ============================================
    // 🔓 LOCALHOST - Desabilitar whitepage em desenvolvimento
    // ============================================
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    if (isLocalhost) {
      console.log('🏠 [VerificationWrapper] LOCALHOST detectado - desabilitando whitepage')
      setShowWhitePage(false)
      setIsLoading(false)
      return
    }

    // ============================================
    // 🔒 ROTAS PÚBLICAS (sem whitepage)
    // ============================================
    const currentPath = window.location.pathname
    
    // Rotas que NÃO precisam de whitepage
    const publicRoutes = ['/cupons', '/success', '/sucesso', '/checkout']
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
    
    if (isPublicRoute) {
      setIsLoading(false)
      return
    }
    
    // ============================================
    // 🎯 WHITEPAGE - Primeira camada (Google Ads)
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
    // Marcar que usuário passou pela whitepage
    localStorage.setItem('whitepage_passed', 'true')
    localStorage.setItem('whitepage_passed_at', Date.now().toString())
    
    // Esconder whitepage e mostrar conteúdo direto
    setShowWhitePage(false)
  }

  // WhitePage - Primeira camada (Google Ads compliant)
  if (showWhitePage) {
    return <WhitePage onActivate={handleWhitePageActivate} />
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

  // Mostrar conteúdo direto (sem verificação)
  return <>{children}</>
}

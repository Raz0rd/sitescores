'use client'

import { useState, useEffect } from 'react'
import UserVerification from './UserVerification'
import GoogleConversionTest from './GoogleConversionTest'

interface VerificationWrapperProps {
  children: React.ReactNode
}

export default function VerificationWrapper({ children }: VerificationWrapperProps) {
  const [isVerificationEnabled, setIsVerificationEnabled] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Desativado - mostrar verificação direto

  useEffect(() => {
    // Garantir que está no client-side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      setIsVerified(true)
      return
    }

    // ============================================
    // 🔒 ROTAS PÚBLICAS (sem verificação)
    // ============================================
    const currentPath = window.location.pathname
    
    // Rotas que NÃO precisam de verificação
    const publicRoutes = ['/cupons', '/success', '/sucesso', '/checkout']
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route))
    
    if (isPublicRoute) {
      setIsVerified(true)
      setIsLoading(false)
      return
    }
    
    // ============================================
    // ✅ Rota / - EXIGE verificação de usuário
    // ============================================

    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false)
      setIsVerified(true)
    }, 3000) // 3 segundos

    try {
      // Verificar se a verificação está habilitada
      const verificationEnabled = process.env.NEXT_PUBLIC_ENABLE_USER_VERIFICATION === 'true'
      setIsVerificationEnabled(verificationEnabled)

      if (verificationEnabled) {
        const userVerified = checkUserVerification()
        setIsVerified(userVerified)
      } else {
        setIsVerified(true)
      }

      setIsLoading(false)
      clearTimeout(safetyTimeout)
    } catch (error) {
      setIsLoading(false)
      setIsVerified(true)
      clearTimeout(safetyTimeout)
    }

    return () => clearTimeout(safetyTimeout)
  }, [])

  // Função para verificar se o usuário tem verificação válida
  const checkUserVerification = (): boolean => {
    try {
      const userAuthenticated = localStorage.getItem('user_authenticated')
      const userData = localStorage.getItem('userData')
      const user_data = localStorage.getItem('user_data')
      const verificationData = localStorage.getItem('verificationData')

      // Verificação simplificada: se tem user_authenticated = true, está logado
      if (userAuthenticated === 'true') {
        return true
      }

      // Verificação alternativa: se tem userData ou user_data, está logado
      if (userData || user_data) {
        try {
          const data = JSON.parse(userData || user_data || '{}')
          // Se tem dados válidos, considerar como logado
          if (data && (data.nickname || data.name || data.playerId)) {
            return true
          }
        } catch (e) {
          // Se erro ao parsear, continuar verificação
        }
      }

      // Verificação completa (para compatibilidade com sistema antigo)
      const userVerified = localStorage.getItem('userVerified')
      const userPlayerId = localStorage.getItem('userPlayerId')
      const verificationExpiry = localStorage.getItem('verificationExpiry')

      // Se não tem nenhum dado de autenticação, não está logado
      if (!userVerified && !userAuthenticated && !userData && !user_data) {
        return false
      }

      // Se tem userVerified, fazer verificações adicionais
      if (userVerified === 'true') {
        // Verificar expiração se existir
        if (verificationExpiry) {
          const expiryTime = parseInt(verificationExpiry)
          if (Date.now() > expiryTime) {
            clearVerificationData()
            return false
          }
        }

        // Validar dados de verificação se existirem
        if (verificationData) {
          try {
            const verification = JSON.parse(verificationData)
            if (verification.verified && verification.verifiedAt) {
              // Verificar idade da verificação
              const timeSinceVerification = Date.now() - verification.verifiedAt
              const maxAge = 24 * 60 * 60 * 1000 // 24h em milliseconds
              
              if (timeSinceVerification > maxAge) {
                clearVerificationData()
                return false
              }
            }
          } catch (e) {
            // Se erro ao parsear, ignorar e continuar
          }
        }

        return true
      }

      return false
    } catch (error) {
      // Em caso de erro, não limpar dados - apenas retornar false
      return false
    }
  }

  // Função para limpar dados de verificação
  const clearVerificationData = () => {
    
    // Dados de verificação
    localStorage.removeItem('userVerified')
    localStorage.removeItem('userPlayerId')
    localStorage.removeItem('userData')
    localStorage.removeItem('verificationData')
    localStorage.removeItem('verificationExpiry')
    
    // Dados de autenticação (para forçar nova verificação)
    localStorage.removeItem('user_authenticated')
    localStorage.removeItem('user_data')
    localStorage.removeItem('terms_accepted')
    localStorage.removeItem('terms_accepted_at')
  }

  const handleVerificationComplete = () => {
    setIsVerified(true)
    
    // Forçar reload da página para que o sistema principal detecte o login
    setTimeout(() => {
      window.location.reload()
    }, 100)
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

  // Se verificação está habilitada e usuário não está verificado
  if (isVerificationEnabled && !isVerified) {
    return <UserVerification onVerificationComplete={handleVerificationComplete} />
  }

  // Se verificação está desabilitada ou usuário já está verificado
  return (
    <>
      <GoogleConversionTest />
      {children}
    </>
  )
}

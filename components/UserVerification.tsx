'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface UserVerificationProps {
  onVerificationComplete: () => void
}

export default function UserVerification({ onVerificationComplete }: UserVerificationProps) {
  const [step, setStep] = useState<'initial' | 'quiz' | 'result' | 'reward' | 'terms' | 'verification' | 'loading'>('initial')
  const [playerId, setPlayerId] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // Função para tocar som ao clicar - Som digital/tech Matrix
  const playClickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=')
    audio.volume = 0.2
    audio.play().catch(() => {})
  }
  
  // Estados do Quiz Arena de Fogo
  const [timeLeft, setTimeLeft] = useState(15)

  // Perguntas do Quiz
  const handleInitialCheck = () => {
    setStep('verification')
  }

  const handleAcceptTerms = () => {
    if (!accepted) {
      setError('Você precisa aceitar os termos para continuar')
      return
    }
    setStep('verification')
    setError('')
  }

  // Funções do Quiz
  const [isTransitioning, setIsTransitioning] = useState(false)
  






  const handleAcceptReward = () => {
    // Salvar no localStorage que o quiz foi completado
    localStorage.setItem('quizCompleted', 'true')
    localStorage.setItem('quizCompletedAt', new Date().toISOString())
    
    // Ir para o modal de verificação de ID (não redireciona ainda)
    setStep('verification')
  }

  // Timer do quiz
  useEffect(() => {
    if (step === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, timeLeft])

  const handleVerification = async () => {
    if (!playerId.trim()) {
      setError('Por favor, insira seu ID de jogador')
      return
    }

    // Validação básica de formato (apenas números)
    if (!/^\d+$/.test(playerId.trim())) {
      setError('ID inválido! Digite apenas números')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // VERIFICAÇÃO REAL - Validar se é um ID de jogador válido
      const response = await validatePlayerId(playerId.trim())
      
      if (!response.valid) {
        setError(response.message || 'ID de jogador inválido! Verifique e tente novamente.')
        setIsLoading(false)
        return
      }
      
      // Dados do jogo retornados pela API (mesmo formato do login normal)
      const gameBasicInfo = response.gameInfo.basicInfo
      
      // Salvar dados exatamente como no sistema de login normal
      localStorage.setItem('userData', JSON.stringify(gameBasicInfo))
      
      // Dados de autenticação completos (integração com sistema existente)
      const authUserData = {
        name: gameBasicInfo.nickname,
        email: `player${playerId.trim()}@game.local`,
        phone: '+55000000000',
        loginAt: new Date().toISOString(),
        playerId: playerId.trim(),
        verified: true,
        verifiedAt: Date.now(),
        gameData: response.gameInfo
      }
      
      // Salvar verificação
      localStorage.setItem('userVerified', 'true')
      localStorage.setItem('userPlayerId', playerId.trim())
      localStorage.setItem('verificationData', JSON.stringify({
        playerId: playerId.trim(),
        verified: true,
        verifiedAt: Date.now(),
        gameInfo: response.gameInfo
      }))
      localStorage.setItem('verificationExpiry', (Date.now() + (24 * 60 * 60 * 1000)).toString()) // 24h
      
      // Salvar autenticação (integração com sistema existente)
      localStorage.setItem('user_authenticated', 'true')
      localStorage.setItem('user_data', JSON.stringify(authUserData))
      localStorage.setItem('terms_accepted', 'true')
      localStorage.setItem('terms_accepted_at', Date.now().toString())
      
      // Salvar cookies
      const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      document.cookie = `quiz_completed=true; ${cookieOptions}`
      document.cookie = `referer_verified=true; ${cookieOptions}`
      

      
      setStep('loading')
      
      // Fechar modal após 2 segundos e liberar central de recargas
      setTimeout(() => {
        onVerificationComplete() // Fecha o modal e libera a página
      }, 2000)
      
    } catch (err) {
      setError('Erro na verificação. Verifique sua conexão e tente novamente.')
      setIsLoading(false)
    }
  }

  // Função para validar ID do jogador (API REAL)
  const validatePlayerId = async (playerId: string) => {
    try {
      
      // Usar a mesma API que vocês já usam no sistema de login
      const response = await fetch(`/api/game-data/?uid=${playerId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin'
        }
      })


      // Se status não for 200, usuário não é válido (mesma lógica do login)
      if (response.status !== 200) {
        
        // Mensagens específicas baseadas no status
        let message = 'ID de jogador inválido! Verifique e tente novamente.'
        
        if (response.status === 404) {
          message = 'ID não encontrado! Verifique se digitou corretamente.'
        } else if (response.status === 403) {
          message = 'Acesso negado! Este ID não pode ser usado.'
        } else if (response.status === 429) {
          message = 'Muitas tentativas! Aguarde um momento e tente novamente.'
        } else if (response.status >= 500) {
          message = 'Erro no servidor! Tente novamente em alguns minutos.'
        }

        return {
          valid: false,
          message: message
        }
      }

      // Se chegou aqui, status é 200 - verificar se dados são válidos
      const gameData = await response.json()

      // Verificar se o usuário tem nickname "LOGADO" (não é válido)
      if (gameData?.success && gameData?.data?.basicInfo?.nickname === 'LOGADO') {
        return {
          valid: false,
          message: 'ID inválido! Este não é um usuário real. Digite seu ID verdadeiro do jogo.'
        }
      }

      // Verificar se os dados são válidos e tem nickname real
      if (!gameData?.success || !gameData?.data?.basicInfo?.nickname) {
        return {
          valid: false,
          message: 'ID não encontrado ou dados inválidos! Verifique seu ID do jogo.'
        }
      }


      return {
        valid: true,
        gameInfo: gameData.data || {
          accountAge: 'Verificado',
          lastActive: 'Recente'
        }
      }

    } catch (error) {
      
      // Tratar erros de rede/conexão
      return {
        valid: false,
        message: 'Erro de conexão! Verifique sua internet e tente novamente.'
      }
    }
  }

  if (step === 'loading') {
    return (
      <div className="fixed inset-0 z-[9999] overflow-hidden" style={{
        background: 'linear-gradient(135deg, #000000 0%, #001a00 50%, #000000 100%)'
      }}>
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Brilhos matrix */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-emerald-500/20 to-green-600/10 rounded-full blur-3xl" />
        </div>
        
        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="text-center max-w-md w-full">
            {/* Logo/Ícone */}
            <div className="relative inline-block mb-4 sm:mb-6 md:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl border-4 border-green-400/40" style={{boxShadow: '0 0 30px #00ff00, 0 0 50px #00ff41'}}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              {/* Spinner ao redor */}
              <div className="absolute inset-0 border-4 border-transparent border-t-green-400 rounded-full animate-spin" style={{filter: 'drop-shadow(0 0 10px #00ff00)'}}></div>
            </div>

            {/* Mensagem Principal */}
            <div className="bg-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-green-500/50 mb-4 sm:mb-5 md:mb-6" style={{boxShadow: '0 0 20px rgba(0,255,65,0.3)'}}>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                ✅ Verificação Concluída!
              </h2>
              <p className="text-green-200 text-sm sm:text-base mb-2">
                Seu desconto foi ativado com sucesso
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-sm sm:text-base">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-green-400 border-t-transparent"></div>
                <span>Redirecionando...</span>
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Desconto de 70% ativado</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Conta verificada</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-green-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Acesso liberado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden" style={{
      background: 'linear-gradient(135deg, #000000 0%, #001a00 50%, #000000 100%)'
    }}>
      {/* Efeitos de fundo Matrix */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Padrão de código binário */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #00ff00 0px, #00ff00 1px, transparent 1px, transparent 4px)',
          backgroundSize: '100% 4px',
          animation: 'matrix-scan 8s linear infinite'
        }} />
        
        {/* Código Matrix canto superior esquerdo */}
        <div className="absolute top-0 left-0 w-40 h-40 opacity-60">
          <svg viewBox="0 0 100 100" className="w-full h-full text-green-500" style={{filter: 'drop-shadow(0 0 10px #00ff00)'}}>
            <text x="10" y="20" fontSize="12" fill="currentColor" className="animate-pulse">01001</text>
            <text x="10" y="35" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.2s'}}>11010</text>
            <text x="10" y="50" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.4s'}}>10110</text>
            <rect x="5" y="5" width="60" height="60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M5,5 L65,65 M65,5 L5,65" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
          </svg>
        </div>
        
        {/* Código Matrix canto superior direito */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-60">
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400" style={{filter: 'drop-shadow(0 0 10px #00ff41)'}}>
            <text x="30" y="20" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.1s'}}>10101</text>
            <text x="30" y="35" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.3s'}}>01110</text>
            <text x="30" y="50" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.5s'}}>11001</text>
            <rect x="25" y="5" width="60" height="60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <circle cx="55" cy="35" r="20" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        {/* Código Matrix canto inferior esquerdo */}
        <div className="absolute bottom-0 left-0 w-40 h-40 opacity-60">
          <svg viewBox="0 0 100 100" className="w-full h-full text-green-400" style={{filter: 'drop-shadow(0 0 10px #00ff00)'}}>
            <text x="10" y="50" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.6s'}}>11100</text>
            <text x="10" y="65" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.8s'}}>00111</text>
            <text x="10" y="80" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '1s'}}>10011</text>
            <rect x="5" y="35" width="60" height="60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <path d="M5,95 L35,35 L65,95" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        {/* Código Matrix canto inferior direito */}
        <div className="absolute bottom-0 right-0 w-40 h-40 opacity-60">
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500" style={{filter: 'drop-shadow(0 0 10px #00ff41)'}}>
            <text x="30" y="50" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.7s'}}>01011</text>
            <text x="30" y="65" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.9s'}}>11110</text>
            <text x="30" y="80" fontSize="12" fill="currentColor" className="animate-pulse" style={{animationDelay: '1.1s'}}>00101</text>
            <rect x="25" y="35" width="60" height="60" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
            <circle cx="55" cy="65" r="25" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2"/>
          </svg>
        </div>
        
        {/* Brilhos Matrix */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-emerald-500/20 to-green-600/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}} />
      </div>

      {/* Brilho Matrix central */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-600/10 animate-pulse-slow"></div>
      </div>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes float-fire {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.6; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
          50% { box-shadow: 0 0 40px rgba(0, 255, 65, 0.8), 0 0 60px rgba(0, 255, 0, 0.6); }
        }
        @keyframes matrix-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-spin-reverse {
          animation: spin-reverse 1s linear infinite;
        }
        .animate-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        .cursor-fire,
        .cursor-fire * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23FF6B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>') 4 4, auto !important;
        }
        .cursor-fire button:hover,
        .cursor-fire a:hover {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23FF3C00" stroke="%23FF6B00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>') 4 4, pointer !important;
        }
      `}</style>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          
          {/* Tela Inicial */}
          {step === 'initial' && (
            <div className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 rounded-2xl sm:rounded-3xl shadow-2xl border border-green-500/60 overflow-hidden backdrop-blur-xl" style={{boxShadow: '0 0 30px rgba(0,255,0,0.4)'}}>
              {/* Header compacto Matrix */}
              <div className="relative h-14 sm:h-16 md:h-20 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-black/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.3),transparent_50%)] animate-pulse"></div>
                {/* Código binário no header */}
                <div className="absolute top-2 left-2 text-[8px] text-green-300 opacity-50 font-mono">01</div>
                <div className="absolute top-2 right-2 text-[8px] text-green-300 opacity-50 font-mono">10</div>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
                <h1 className="relative text-base sm:text-xl md:text-2xl font-bold text-white text-center drop-shadow-2xl flex items-center gap-1.5 sm:gap-2 px-2" style={{textShadow: '0 0 10px #00ff00'}}>
                  <span className="text-xl sm:text-2xl md:text-3xl">💻</span>
                  <span>Bem-vindo!</span>
                  <span className="text-xl sm:text-2xl md:text-3xl">💻</span>
                </h1>
              </div>

              {/* Conteúdo compacto */}
              <div className="p-3 sm:p-4 md:p-5 text-center">
                {/* Ícone premium com ornamentos */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4">
                  {/* Moldura Matrix externa */}
                  <div className="absolute inset-0 animate-spin" style={{animationDuration: '4s'}}>
                    <svg viewBox="0 0 100 100" className="w-full h-full text-green-500" style={{filter: 'drop-shadow(0 0 5px #00ff00)'}}>
                      <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="3" fill="none"/>
                      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  {/* Código interno */}
                  <div className="absolute inset-3 animate-spin-reverse" style={{animationDuration: '3s'}}>
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400">
                      <text x="35" y="50" fontSize="20" fill="currentColor" fontFamily="monospace">01</text>
                      <text x="35" y="70" fontSize="20" fill="currentColor" fontFamily="monospace">10</text>
                    </svg>
                  </div>
                  {/* Núcleo Matrix pulsante */}
                  <div className="absolute inset-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse shadow-lg" style={{boxShadow: '0 0 20px #00ff00'}}></div>
                  {/* Símbolo central */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🔐</div>
                  </div>
                </div>
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 mb-2 sm:mb-3">
                  Acesse Ofertas Exclusivas
                </h2>
                <p className="text-green-100 mb-2 sm:mb-3 md:mb-4 leading-relaxed text-xs sm:text-sm">
                  Valide sua identidade e tenha acesso a descontos especiais e bônus exclusivos!
                </p>
                
                <div className="bg-gradient-to-br from-green-600/20 via-emerald-500/15 to-green-600/20 border border-green-500/60 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 backdrop-blur-md shadow-lg relative overflow-hidden" style={{boxShadow: '0 0 20px rgba(0,255,0,0.3)'}}>
                  {/* Código decorativo */}
                  <div className="absolute top-1 right-1 text-[8px] text-green-400/40 font-mono">1010</div>
                  <div className="absolute bottom-1 left-1 text-[8px] text-green-400/40 font-mono">0101</div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-green-400/30"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-green-400/30"></div>
                  <p className="text-green-300 font-bold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 flex items-center justify-center gap-1.5 sm:gap-2 relative z-10" style={{textShadow: '0 0 10px #00ff00'}}>
                    <span className="text-lg sm:text-xl md:text-2xl">⚡</span>
                    <span>Recompensa Exclusiva</span>
                    <span className="text-lg sm:text-xl md:text-2xl">⚡</span>
                  </p>
                  <p className="text-green-50 text-xs sm:text-sm leading-relaxed relative z-10">
                    Valide sua conta e ganhe <span className="font-bold text-green-300 text-sm sm:text-base" style={{textShadow: '0 0 10px #00ff00'}}>70% de desconto</span> na sua recarga!
                  </p>
                </div>

                <button
                  onClick={handleInitialCheck}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-400 hover:to-green-500 text-black font-bold text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-xl hover:scale-[1.03] border border-green-400/60 hover:border-green-300 relative overflow-hidden group mb-2 sm:mb-3" style={{boxShadow: '0 0 20px #00ff00, 0 0 30px #00ff41'}}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg md:text-xl">⚡</span>
                    <span>Começar Agora</span>
                    <span className="text-base sm:text-lg md:text-xl">🔐</span>
                  </span>
                </button>

                {/* Links de Termos e Políticas */}
                <div className="mt-2 sm:mt-3 md:mt-4 text-center text-[10px] sm:text-xs">
                  <p className="mb-2 text-green-300">Ao continuar, você concorda com nossos</p>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setShowTermsModal(true)}
                      className="text-green-300 hover:text-emerald-200 underline transition-colors font-semibold"
                    >
                      Termos de Uso
                    </button>
                    <span className="text-green-500">•</span>
                    <button 
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-green-300 hover:text-emerald-200 underline transition-colors font-semibold"
                    >
                      Política de Privacidade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tela de Termos */}
          {step === 'terms' && (
            <div className="bg-black/90 rounded-2xl border border-green-500/50 p-8 shadow-2xl backdrop-blur-xl" style={{boxShadow: '0 0 30px rgba(0,255,0,0.4)'}}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-green-400" style={{textShadow: '0 0 10px #00ff00'}}>Termos de Uso e Política de Privacidade</h2>
                <div className="bg-gray-900/60 rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-green-100 leading-relaxed border border-green-500/30">
                  
                  <div className="bg-green-900/30 border-l-4 border-green-500 p-3 mb-4 rounded">
                    <p className="text-green-300 font-semibold">
                      ⚡ <strong>EXCLUSIVIDADE:</strong> Deseja ganhar seu desconto especial? 
                      Aceite os termos e tenha acesso a ofertas exclusivas!
                    </p>
                  </div>

                  <h4 className="font-bold text-green-400 mb-2">💻 TERMOS DE USO</h4>
                  <p className="mb-3">
                    <strong>1. Aceitação dos Termos:</strong> Ao aceitar estes termos, você concorda com todas as condições de uso deste site oficial de recargas e nossa política de privacidade. Este acordo é válido para todas as transações realizadas.
                  </p>
                  <p className="mb-3">
                    <strong>2. Usuários Verificados:</strong> Este site é exclusivo para jogadores reais e verificados. É terminantemente proibido o uso de bots, sistemas automatizados ou contas falsas. Apenas IDs válidos de jogadores ativos são aceitos.
                  </p>
                  <p className="mb-3">
                    <strong>3. Ofertas Exclusivas:</strong> Usuários verificados têm acesso a descontos especiais, promoções exclusivas e bônus em diamantes. As ofertas são limitadas e sujeitas a disponibilidade.
                  </p>
                  <p className="mb-3">
                    <strong>4. Transações Seguras:</strong> Garantimos 100% de segurança em todas as transações através de sistemas criptografados de última geração. Seus dados financeiros são protegidos pelos mais altos padrões de segurança.
                  </p>
                  <p className="mb-3">
                    <strong>5. Validade da Oferta:</strong> O desconto de 70% é válido para recargas e não pode ser combinado com outras promoções. Esta oferta está sujeita à disponibilidade e pode ser encerrada a qualquer momento sem aviso prévio.
                  </p>
                  <p className="mb-3">
                    <strong>6. Uso Único:</strong> Este cupom é válido para uso único por usuário e não pode ser transferido.
                  </p>
                  <p className="mb-3">
                    <strong>7. Conformidade:</strong> Esta promoção está em conformidade com as políticas do Google Ads e regulamentações aplicáveis. Todas as ofertas seguem as diretrizes de publicidade digital.
                  </p>

                  <h4 className="font-bold text-green-400 mb-2 mt-4">🔐 POLÍTICA DE PRIVACIDADE</h4>
                  <p className="mb-3">
                    <strong>8. Coleta de Dados:</strong> Coletamos apenas informações necessárias para processar suas recargas: ID do jogador, dados de pagamento e informações de contato. Não compartilhamos dados com terceiros.
                  </p>
                  <p className="mb-3">
                    <strong>9. Uso das Informações:</strong> Seus dados são utilizados exclusivamente para: processar recargas, enviar confirmações, oferecer suporte técnico e disponibilizar ofertas personalizadas.
                  </p>
                  <p className="mb-3">
                    <strong>10. Cookies e Rastreamento:</strong> Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar o tráfego do site de forma anônima.
                  </p>
                  <p className="mb-3">
                    <strong>11. Direitos do Usuário:</strong> Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento através do nosso suporte.
                  </p>
                  <p className="mb-3">
                    <strong>12. Suporte 24h:</strong> Nossa equipe está disponível 24 horas para esclarecer dúvidas sobre privacidade, termos de uso ou questões técnicas.
                  </p>
                  <p className="mb-3">
                    <strong>13. Atualizações:</strong> Estes termos podem ser atualizados periodicamente. Usuários serão notificados sobre mudanças importantes por email ou no site.
                  </p>
                  
                  <p className="text-xs text-green-300/60 mt-4 italic">
                    Ao participar desta promoção, você concorda com estes termos e condições.
                  </p>

                  <div className="bg-emerald-900/30 border-l-4 border-emerald-500 p-3 mt-4 rounded">
                    <p className="text-emerald-300 text-xs">
                      ⚡ <strong>Site Oficial e Confiável:</strong> Somos um centro de recarga oficial com milhares de usuários satisfeitos. 
                      Transações rápidas, seguras e com garantia de entrega.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-start text-sm text-green-100">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mr-3 w-5 h-5 text-green-500 rounded focus:ring-green-500 mt-0.5 bg-gray-900 border-green-400"
                  />
                  <span>
                    Eu li e aceito os{' '}
                    <span className="text-green-400 underline font-bold">
                      Termos de Uso
                    </span>
                    {' '}e{' '}
                    <span className="text-green-400 underline font-bold">
                      Política de Privacidade
                    </span>, 
                    e desejo ter acesso às <strong className="text-emerald-400">ofertas exclusivas</strong> para usuários verificados
                  </span>
                </label>
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('initial')}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-cyan-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-cyan-400/30 hover:border-cyan-400/50"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleAcceptTerms}
                  disabled={!accepted}
                  className={`flex-1 font-bold py-3 px-4 rounded-lg transition-all duration-300 ${
                    accepted
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-purple-500/50 hover:scale-105 border border-purple-400/30'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                  }`}
                >
                  Continuar ⚡
                </button>
              </div>
            </div>
          )}


          {/* Modal de Termos de Uso */}
          {showTermsModal && (
            <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={playClickSound}>
              <div className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-green-500/50" style={{boxShadow: '0 0 30px rgba(0,255,0,0.4)'}}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 -m-6 p-6 rounded-t-2xl">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{textShadow: '0 0 10px #00ff00'}}>
                      <span className="text-3xl">💻</span>
                      <span>Termos de Uso</span>
                    </h3>
                    <button 
                      onClick={() => { playClickSound(); setShowTermsModal(false); }}
                      className="text-white hover:text-green-400 transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-2"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-green-100 text-sm leading-relaxed">
                    <p><strong className="text-green-400 text-base">1. Aceitação dos Termos:</strong> Ao aceitar estes termos, você concorda com todas as condições de uso deste site oficial de recargas e nossa política de privacidade.</p>
                    
                    <p><strong className="text-green-400 text-base">2. Usuários Verificados:</strong> Este site é exclusivo para jogadores reais e verificados. É terminantemente proibido o uso de bots, sistemas automatizados ou contas falsas.</p>
                    
                    <p><strong className="text-green-400 text-base">3. Ofertas Exclusivas:</strong> Usuários verificados têm acesso a descontos especiais, promoções exclusivas e bônus. As ofertas são limitadas e sujeitas a disponibilidade.</p>
                    
                    <p><strong className="text-green-400 text-base">4. Transações Seguras:</strong> Garantimos 100% de segurança em todas as transações através de sistemas criptografados de última geração.</p>
                    
                    <p><strong className="text-green-400 text-base">5. Responsabilidade:</strong> O usuário é responsável por manter suas credenciais seguras e por todas as atividades realizadas em sua conta.</p>
                    
                    <p><strong className="text-green-400 text-base">6. Modificações:</strong> Reservamos o direito de modificar estes termos a qualquer momento. Usuários serão notificados sobre mudanças importantes.</p>
                  </div>
                  
                  <button 
                    onClick={() => { playClickSound(); setShowTermsModal(false); }}
                    className="mt-6 w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-400 hover:to-green-500 text-black font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02]" style={{boxShadow: '0 0 20px #00ff00'}}
                  >
                    ✅ Entendi
                  </button>
                </div>
              </div>
            </div>
          )}

          

          {/* Tela de Verificação */}
          {step === 'verification' && (
            <div className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-green-500/50 overflow-hidden backdrop-blur-xl" style={{boxShadow: '0 0 30px rgba(0,255,0,0.4)'}}>
              {/* Header */}
              <div className="relative h-14 sm:h-16 md:h-20 lg:h-24 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-black/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.3),transparent_50%)] animate-pulse"></div>
                <h2 className="relative text-base sm:text-lg md:text-xl font-bold text-white text-center drop-shadow-2xl flex items-center gap-1.5 sm:gap-2 px-2" style={{textShadow: '0 0 10px #00ff00'}}>
                  <span className="text-lg sm:text-xl md:text-2xl">💻</span>
                  <span>Validar Identidade</span>
                  <span className="text-lg sm:text-xl md:text-2xl">🔐</span>
                </h2>
              </div>

              <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <p className="text-green-100 text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 text-center">
                  Insira seu ID de jogador para confirmar que você é um usuário real
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-bold mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg md:text-xl">🎮</span>
                      <span>ID do Jogador</span>
                      <span className="text-xs text-green-300 font-normal">(apenas números)</span>
                    </label>
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Digite seu ID do jogo (ex: 5435431)"
                      className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-gray-900/60 to-black/60 border-2 border-green-500/40 rounded-xl sm:rounded-2xl text-white text-base sm:text-lg font-bold placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 hover:border-green-400/70 transition-all duration-300 shadow-lg" style={{boxShadow: '0 0 10px rgba(0,255,0,0.2)'}}
                      disabled={isLoading}
                      maxLength={15}
                    />
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-600/20 via-emerald-500/15 to-green-600/20 border-2 border-green-400/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 backdrop-blur-md shadow-lg" style={{boxShadow: '0 0 20px rgba(0,255,0,0.2)'}}>
                    <p className="text-xs sm:text-sm text-green-300 font-bold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg">⚡</span>
                      <span>Importante:</span>
                    </p>
                    <p className="text-xs sm:text-sm text-green-50 mb-2 sm:mb-3 leading-relaxed">
                      Digite seu <span className="text-green-300 font-bold" style={{textShadow: '0 0 10px #00ff00'}}>ID REAL</span> do jogo! IDs falsos ou inválidos não passarão na verificação.
                    </p>
                    <p className="text-xs text-green-100 mb-3 bg-gray-900/40 rounded-lg p-2 border border-green-500/40">
                      📍 <span className="text-green-300 font-semibold">Encontre seu ID em:</span><br/>
                      <span className="text-white font-bold ml-4">Configurações → Informações Básicas → ID do Jogador</span>
                    </p>
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="text-xs sm:text-sm text-green-300 hover:text-emerald-200 underline font-bold flex items-center gap-1"
                    >
                      📖 Ver tutorial completo de como encontrar seu ID
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="px-4 sm:px-6 md:px-8 pb-3 sm:pb-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center">
                    <p className="text-red-400 text-xs sm:text-sm font-semibold">{error}</p>
                  </div>
                </div>
              )}

              <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                <button
                  onClick={handleVerification}
                  disabled={isLoading || !playerId.trim()}
                  className={`w-full font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group ${
                    isLoading || !playerId.trim()
                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed border-2 border-neutral-600'
                      : 'bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-400 hover:to-green-500 text-black hover:scale-[1.05] border-2 border-green-400/60 hover:border-green-300'
                  }`}
                  style={!isLoading && playerId.trim() ? {boxShadow: '0 0 20px #00ff00, 0 0 30px #00ff41'} : {}}
                >
                  {!isLoading && !(!playerId.trim()) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" opacity="0.3"/>
                        <path d="M12 2 L22 8.5" strokeLinecap="round"/>
                      </svg>
                      <span className="animate-pulse">Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg sm:text-xl md:text-2xl mr-1.5 sm:mr-2">💻</span>
                      <span className="relative z-10">Verificar Identidade</span>
                      <span className="text-lg sm:text-xl md:text-2xl ml-1.5 sm:ml-2">🔐</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* Modal de Termos de Uso */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={playClickSound}>
          <div className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-green-500/50" style={{boxShadow: '0 0 30px rgba(0,255,0,0.4)'}}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 -m-6 p-6 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{textShadow: '0 0 10px #00ff00'}}>
                  <span className="text-3xl">💻</span>
                  <span>Termos de Uso</span>
                </h3>
                <button 
                  onClick={() => { playClickSound(); setShowTermsModal(false); }}
                  className="text-white hover:text-green-400 transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-2"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-green-100 text-sm leading-relaxed">
                <p><strong className="text-green-400 text-base">1. Aceitação dos Termos:</strong> Ao aceitar estes termos, você concorda com todas as condições de uso deste site oficial de recargas e nossa política de privacidade.</p>
                
                <p><strong className="text-green-400 text-base">2. Usuários Verificados:</strong> Este site é exclusivo para jogadores reais e verificados. É terminantemente proibido o uso de bots, sistemas automatizados ou contas falsas.</p>
                
                <p><strong className="text-green-400 text-base">3. Ofertas Exclusivas:</strong> Usuários verificados têm acesso a descontos especiais, promoções exclusivas e bônus. As ofertas são limitadas e sujeitas a disponibilidade.</p>
                
                <p><strong className="text-green-400 text-base">4. Transações Seguras:</strong> Garantimos 100% de segurança em todas as transações através de sistemas criptografados de última geração.</p>
                
                <p><strong className="text-green-400 text-base">5. Responsabilidade:</strong> O usuário é responsável por manter suas credenciais seguras e por todas as atividades realizadas em sua conta.</p>
                
                <p><strong className="text-green-400 text-base">6. Modificações:</strong> Reservamos o direito de modificar estes termos a qualquer momento. Usuários serão notificados sobre mudanças importantes.</p>
              </div>
              
              <button 
                onClick={() => { playClickSound(); setShowTermsModal(false); }}
                className="mt-6 w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-400 hover:to-green-500 text-black font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02]" style={{boxShadow: '0 0 20px #00ff00'}}
              >
                ✅ Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Privacidade */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={playClickSound}>
          <div className="bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-green-500/50" style={{boxShadow: '0 0 30px rgba(0,255,0,0.4)'}}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 -m-6 p-6 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{textShadow: '0 0 10px #00ff00'}}>
                  <span className="text-3xl">🔐</span>
                  <span>Política de Privacidade</span>
                </h3>
                <button 
                  onClick={() => { playClickSound(); setShowPrivacyModal(false); }}
                  className="text-white hover:text-green-400 transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-2"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-green-100 text-sm leading-relaxed">
                <p><strong className="text-green-400 text-base">1. Coleta de Dados:</strong> Coletamos apenas informações necessárias para processar suas recargas: ID do jogador, dados de pagamento e informações de contato. Não compartilhamos dados com terceiros.</p>
                
                <p><strong className="text-green-400 text-base">2. Uso das Informações:</strong> Seus dados são utilizados exclusivamente para: processar recargas, enviar confirmações, oferecer suporte técnico e disponibilizar ofertas personalizadas.</p>
                
                <p><strong className="text-green-400 text-base">3. Segurança:</strong> Utilizamos criptografia SSL/TLS e seguimos os mais altos padrões de segurança da indústria para proteger suas informações.</p>
                
                <p><strong className="text-green-400 text-base">4. Cookies:</strong> Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar o tráfego do site de forma anônima.</p>
                
                <p><strong className="text-green-400 text-base">5. Direitos do Usuário:</strong> Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento através do nosso suporte.</p>
                
                <p><strong className="text-green-400 text-base">6. Conformidade LGPD:</strong> Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD) e respeitamos todos os seus direitos de privacidade.</p>
              </div>
              
              <button 
                onClick={() => { playClickSound(); setShowPrivacyModal(false); }}
                className="mt-6 w-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 hover:from-green-500 hover:via-emerald-400 hover:to-green-500 text-black font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02]" style={{boxShadow: '0 0 20px #00ff00'}}
              >
                ✅ Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tutorial */}
      {showTutorial && (
        <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Como encontrar seu ID - Free Fire</h3>
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700 mb-3">Veja onde encontrar seu ID no Free Fire:</p>
                  <img 
                    src="/images/tutorialff.jpg" 
                    alt="Tutorial Free Fire" 
                    className="w-full rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div className="hidden bg-gray-100 rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500 text-sm">
                      📱 Tutorial em imagem não disponível<br/>
                      Siga os passos: Menu → Configurações → Informações Básicas → ID do Jogador
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowTutorial(false)}
                className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

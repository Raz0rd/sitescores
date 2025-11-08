'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import GoogleConversionTest from './GoogleConversionTest'

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

  // Função para tocar som ao clicar
  const playClickSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77OeeSwwPUKXh8LdjHAU7k9jyz3ksBS1+zPLaizsKGGS56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHgU7k9jy0HksBSx+zPDajDsKF2O56+mjUBELTKXi8bllHg==')
    audio.volume = 0.3
    audio.play().catch(() => {})
  }
  
  // Estados do Quiz Arena de Fogo
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(15)

  // Perguntas do Quiz
  const quizQuestions = [
    {
      question: "🔮 Qual é o seu estilo de jogo no Free Fire?",
      options: [
        { text: "Líder de Squad - Comando meu time", points: { lider: 3, estrategista: 1, atirador: 0, rusher: 0 } },
        { text: "Sniper Silencioso - Elimino de longe", points: { atirador: 3, estrategista: 1, lider: 0, rusher: 0 } },
        { text: "Rusher Insano - Vou pra cima!", points: { rusher: 3, lider: 1, atirador: 0, estrategista: 0 } },
        { text: "Suporte Tático - Ajudo meu time", points: { estrategista: 3, lider: 1, atirador: 0, rusher: 0 } }
      ]
    },
    {
      question: "💥 Como você reage em uma situação 1v4?",
      options: [
        { text: "Planejo cada movimento com calma", points: { estrategista: 3, atirador: 1, lider: 0, rusher: 0 } },
        { text: "Parto pra cima sem medo!", points: { rusher: 3, lider: 1, atirador: 0, estrategista: 0 } },
        { text: "Uso granadas e táticas", points: { estrategista: 2, atirador: 2, lider: 0, rusher: 0 } },
        { text: "Chamo reforços e coordeno", points: { lider: 3, estrategista: 1, atirador: 0, rusher: 0 } }
      ]
    },
    {
      question: "🎯 Qual arma você escolhe no início da partida?",
      options: [
        { text: "AWM - Precisão mortal", points: { atirador: 3, estrategista: 1, lider: 0, rusher: 0 } },
        { text: "MP40 - Velocidade e agilidade", points: { rusher: 3, lider: 0, atirador: 0, estrategista: 0 } },
        { text: "M1014 - Destruição garantida", points: { rusher: 2, lider: 1, atirador: 0, estrategista: 0 } },
        { text: "SCAR - Versatilidade total", points: { estrategista: 2, lider: 2, atirador: 0, rusher: 0 } }
      ]
    },
    {
      question: "🏆 O que te motiva a jogar Free Fire?",
      options: [
        { text: "Ser o Mestre", points: { lider: 3, atirador: 1, estrategista: 0, rusher: 0 } },
        { text: "Adrenalina pura", points: { rusher: 3, lider: 0, atirador: 0, estrategista: 0 } },
        { text: "Estratégia e inteligência", points: { estrategista: 3, lider: 0, atirador: 0, rusher: 0 } },
        { text: "Jogar com os amigos", points: { lider: 2, estrategista: 1, atirador: 0, rusher: 0 } }
      ]
    },
    {
      question: "🔮 Qual personagem te representa?",
      options: [
        { text: "Chrono - Controle do tempo", points: { estrategista: 3, lider: 0, atirador: 0, rusher: 0 } },
        { text: "Wukong - Agilidade ninja", points: { rusher: 3, lider: 0, atirador: 0, estrategista: 0 } },
        { text: "DJ Alok - Suporte e cura", points: { lider: 3, estrategista: 0, atirador: 0, rusher: 0 } },
        { text: "Moco - Rastreamento preciso", points: { atirador: 3, lider: 0, estrategista: 0, rusher: 0 } }
      ]
    }
  ]

  // Perfis de resultado
  const quizProfiles: Record<string, { title: string; description: string; emoji: string }> = {
    lider: {
      title: "⚡ O LÍDER CYBERNÉTICO",
      description: "Você nasceu para comandar! Seu squad te segue até o fim. Estratégia e liderança são suas armas.",
      emoji: "💠"
    },
    atirador: {
      title: "🎯 O SNIPER DIGITAL",
      description: "Precisão cirúrgica! Você elimina antes que vejam de onde veio. Cada tiro, uma baixa garantida.",
      emoji: "🎯"
    },
    rusher: {
      title: "⚡ O RUSHER NEON",
      description: "Adrenalina pura! Você não conhece o medo. Vai de frente e deixa o caos para trás.",
      emoji: "⚡"
    },
    estrategista: {
      title: "🔮 O MESTRE TECH",
      description: "Você pensa 10 passos à frente. Cada movimento é calculado. A vitória é questão de tempo.",
      emoji: "🧠"
    }
  }

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
  
  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex]
    setQuizAnswers(newAnswers)
    
    if (currentQuestion < quizQuestions.length - 1) {
      // Mostrar transição
      setIsTransitioning(true)
      
      // Aguardar animação antes de trocar pergunta
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
        setTimeLeft(15)
        setIsTransitioning(false)
      }, 400)
    } else {
      // Calcular resultado
      calculateQuizResult(newAnswers)
    }
  }

  const calculateQuizResult = (answers: number[]) => {
    const scores: Record<string, number> = {
      lider: 0,
      atirador: 0,
      rusher: 0,
      estrategista: 0
    }

    answers.forEach((answerIndex, questionIndex) => {
      const selectedOption = quizQuestions[questionIndex].options[answerIndex]
      Object.entries(selectedOption.points).forEach(([profile, points]) => {
        scores[profile] = (scores[profile] || 0) + (points as number)
      })
    })

    // Encontrar perfil com maior pontuação
    const winnerProfile = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    setQuizResult(winnerProfile)
    setStep('result')
  }

  const handleSkipQuiz = () => {
    setStep('verification')
  }

  const handleAcceptReward = () => {
    // Salvar no localStorage que o quiz foi completado
    localStorage.setItem('quizCompleted', 'true')
    localStorage.setItem('quizCompletedAt', new Date().toISOString())
    
    // Ir para o modal de verificação de ID (não redireciona ainda)
    setStep('verification')
  }

  // Verificar se o quiz já foi completado
  useEffect(() => {
    const quizCompleted = localStorage.getItem('quizCompleted')
    if (quizCompleted === 'true' && step === 'initial') {
      setStep('verification')
    }
  }, [step])

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
      
      console.log('🍪 [VERIFICAÇÃO] Cookies definidos')
      console.log('   - quiz_completed=true')
      console.log('   - referer_verified=true')
      
      setStep('loading')
      
      // Fechar modal após 2 segundos e liberar central de recargas
      setTimeout(() => {
        console.log('✅ [VERIFICAÇÃO] Liberando acesso à central de recargas')
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
        background: 'linear-gradient(135deg, rgba(255,107,53,0.18) 0%, rgba(211,47,47,0.15) 50%, rgba(255,193,7,0.12) 100%), linear-gradient(180deg, #1A1A1A 0%, #2d1810 100%)'
      }}>
        {/* Efeitos de fundo Magma */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Bolhas de magma flutuantes */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25 animate-magma-pulse" style={{
            background: 'radial-gradient(circle, rgba(255,107,53,0.6) 0%, transparent 70%)'
          }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 animate-magma-pulse-delayed" style={{
            background: 'radial-gradient(circle, rgba(211,47,47,0.6) 0%, transparent 70%)'
          }} />
        </div>
        
        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="text-center max-w-md w-full">
            {/* Logo/Ícone Magma */}
            <div className="relative inline-block mb-8">
              <div className="w-28 h-28 rounded-full flex items-center justify-center animate-magma-pulse" style={{
                background: 'linear-gradient(135deg, rgba(255,107,53,0.4), rgba(211,47,47,0.3))',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,193,7,0.3)',
                boxShadow: '0 10px 40px 0 rgba(255,107,53,0.6), 0 0 70px rgba(211,47,47,0.4)'
              }}>
                <div className="w-14 h-14 animate-obsidian-rotate" style={{
                  background: 'linear-gradient(135deg, rgba(255,193,7,0.8), rgba(211,47,47,0.6))',
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  boxShadow: '0 0 25px rgba(255,193,7,0.9)'
                }} />
              </div>
              {/* Spinner magma ao redor */}
              <div className="absolute inset-0 border-4 border-transparent border-t-yellow-300 rounded-full animate-spin" style={{filter: 'drop-shadow(0 0 15px rgba(255,193,7,0.9))'}}></div>
            </div>

            {/* Mensagem Principal */}
            <div className="p-6 mb-6" style={{
              background: 'rgba(255, 107, 53, 0.12)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              border: '1px solid rgba(255, 193, 7, 0.25)',
              boxShadow: '0 10px 40px 0 rgba(255, 107, 53, 0.3)'
            }}>
              <h2 className="text-2xl font-bold mb-3 text-white flex items-center justify-center gap-2">
                <div className="w-6 h-6" style={{
                  background: 'linear-gradient(135deg, rgba(255,193,7,0.8), rgba(255,107,53,0.6))',
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  boxShadow: '0 0 15px rgba(255,193,7,0.8)'
                }} />
                <span>Verificação Concluída!</span>
              </h2>
              <p className="text-orange-100/90 text-base mb-2">
                Seu desconto foi ativado com sucesso
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-300 font-bold text-base">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-300 border-t-transparent"></div>
                <span>Redirecionando...</span>
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-orange-200">
                <div className="w-5 h-5" style={{
                  background: 'linear-gradient(135deg, rgba(255,193,7,0.8), rgba(255,107,53,0.6))',
                  clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  boxShadow: '0 0 10px rgba(255,193,7,0.7)'
                }} />
                <span>Desconto de 70% ativado</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-red-200">
                <div className="w-5 h-5" style={{
                  background: 'linear-gradient(135deg, rgba(211,47,47,0.8), rgba(255,107,53,0.6))',
                  clipPath: 'ellipse(50% 60% at 50% 40%)',
                  boxShadow: '0 0 10px rgba(211,47,47,0.7)',
                  filter: 'blur(0.5px)'
                }} />
                <span>Conta verificada</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-yellow-200">
                <div className="w-5 h-5" style={{
                  background: 'linear-gradient(180deg, rgba(255,193,7,0.8), rgba(255,107,53,0.6))',
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                  boxShadow: '0 0 10px rgba(255,193,7,0.7)'
                }} />
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
      background: 'linear-gradient(135deg, rgba(107,70,193,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(236,72,153,0.10) 100%), linear-gradient(180deg, #0f0a1f 0%, #1a0f2e 100%)'
    }}>
      {/* Efeitos de fundo Aurora Boreal Digital */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Ondas de aurora flutuantes */}
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-plasma-pulse" style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 70%)'
        }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-20 animate-plasma-pulse-delayed" style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(139,92,246,0.3) 50%, transparent 70%)'
        }} />
        
        {/* Cristal aurora canto superior esquerdo */}
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-24 md:w-32 lg:w-40 sm:h-24 md:h-32 lg:h-40 opacity-30 animate-electric-bolt">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(59,130,246,0.6))',
            clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)',
            boxShadow: '0 0 40px rgba(124,58,237,0.8), inset 0 0 20px rgba(59,130,246,0.5)',
            filter: 'brightness(1.4)'
          }} />
        </div>
        
        {/* Esfera aurora canto superior direito */}
        <div className="absolute top-0 right-0 w-14 h-14 sm:w-20 md:w-28 lg:w-32 sm:h-20 md:h-28 lg:h-32 opacity-35 animate-plasma-sphere" style={{animationDelay: '1.2s'}}>
          <div className="w-full h-full rounded-full" style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.8), rgba(139,92,246,0.6), rgba(16,185,129,0.4))',
            boxShadow: '0 0 35px rgba(236,72,153,0.8), inset 0 0 20px rgba(139,92,246,0.6)'
          }} />
        </div>
        
        {/* Onda aurora canto inferior esquerdo */}
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 md:w-30 lg:w-36 sm:h-24 md:h-30 lg:h-36 opacity-32 animate-energy-arc" style={{animationDelay: '2s'}}>
          <div className="w-full h-full" style={{
            background: 'linear-gradient(90deg, rgba(16,185,129,0.7), rgba(59,130,246,0.6))',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            boxShadow: '0 0 35px rgba(16,185,129,0.8), inset 0 0 18px rgba(59,130,246,0.5)'
          }} />
        </div>
        
        {/* Diamante aurora canto inferior direito */}
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-28 md:w-36 lg:w-44 sm:h-28 md:h-36 lg:h-44 opacity-30 animate-charged-particle" style={{animationDelay: '2.8s'}}>
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(236,72,153,0.7))',
            clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
            boxShadow: '0 0 40px rgba(124,58,237,0.9), inset 0 0 20px rgba(236,72,153,0.6)'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes plasma-pulse {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.25; 
          }
          33% { 
            transform: translate(25px, -35px) scale(1.12); 
            opacity: 0.35; 
          }
          66% { 
            transform: translate(-28px, 22px) scale(0.92); 
            opacity: 0.28; 
          }
        }
        @keyframes plasma-pulse-delayed {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.25; 
          }
          50% { 
            transform: translate(-30px, 30px) scale(1.18); 
            opacity: 0.32; 
          }
        }
        @keyframes electric-bolt {
          0%, 100% { 
            transform: rotate(0deg) scale(1); 
            opacity: 0.35; 
            filter: brightness(1.2) drop-shadow(0 0 10px rgba(139,92,246,0.6));
          }
          25% { 
            transform: rotate(-5deg) scale(1.05); 
            opacity: 0.5; 
            filter: brightness(1.5) drop-shadow(0 0 20px rgba(139,92,246,0.9));
          }
          75% { 
            transform: rotate(5deg) scale(0.98); 
            opacity: 0.4; 
            filter: brightness(1.1) drop-shadow(0 0 15px rgba(236,72,153,0.7));
          }
        }
        @keyframes plasma-sphere {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.4; 
          }
          50% { 
            transform: scale(1.15); 
            opacity: 0.55; 
          }
        }
        @keyframes energy-arc {
          0%, 100% { 
            transform: scaleX(1) translateY(0); 
            opacity: 0.38; 
          }
          50% { 
            transform: scaleX(1.1) translateY(-5px); 
            opacity: 0.5; 
          }
        }
        @keyframes charged-particle {
          0% { 
            transform: rotate(0deg) scale(1); 
            opacity: 0.35; 
          }
          50% { 
            transform: rotate(180deg) scale(1.1); 
            opacity: 0.5; 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
            opacity: 0.35; 
          }
        }
        @keyframes electric-flow {
          0%, 100% { 
            transform: translateX(-100%) skewX(-15deg); 
            opacity: 0; 
          }
          50% { 
            opacity: 0.6; 
          }
          100% { 
            transform: translateX(200%) skewX(-15deg); 
            opacity: 0; 
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-plasma-pulse {
          animation: plasma-pulse 18s ease-in-out infinite;
        }
        .animate-plasma-pulse-delayed {
          animation: plasma-pulse-delayed 16s ease-in-out infinite;
        }
        .animate-electric-bolt {
          animation: electric-bolt 4s ease-in-out infinite;
        }
        .animate-plasma-sphere {
          animation: plasma-sphere 8s ease-in-out infinite;
        }
        .animate-energy-arc {
          animation: energy-arc 6s ease-in-out infinite;
        }
        .animate-charged-particle {
          animation: charged-particle 12s linear infinite;
        }
      `}</style>

      <div className="relative flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div className="w-full max-w-[95%] sm:max-w-md">
          
          {/* Tela Inicial */}
          {step === 'initial' && (
            <div className="relative overflow-hidden" style={{
              background: 'rgba(15, 10, 31, 0.75)',
              backdropFilter: 'blur(25px)',
              borderRadius: '28px',
              border: '1px solid rgba(124, 58, 237, 0.45)',
              boxShadow: '0 0 60px rgba(124, 58, 237, 0.5), 0 0 30px rgba(236, 72, 153, 0.35), inset 0 0 40px rgba(139, 92, 246, 0.15)'
            }}>
              {/* Header Aurora Boreal */}
              <div className="relative h-20 sm:h-22 md:h-24 flex items-center justify-center overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(236,72,153,0.22))',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(124,58,237,0.45)',
                boxShadow: '0 4px 30px rgba(124,58,237,0.4), 0 2px 15px rgba(236,72,153,0.3)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rgba(124,58,237,0.1) to-transparent" />
                {/* Partículas aurora no header */}
                <div className="absolute top-1 left-2 sm:top-2 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 animate-plasma-sphere" style={{
                  background: 'radial-gradient(circle, rgba(124,58,237,0.95), rgba(59,130,246,0.8))',
                  boxShadow: '0 0 15px rgba(124,58,237,0.95)',
                  clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)'
                }} />
                <div className="absolute top-1 right-2 sm:top-2 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 animate-electric-bolt" style={{
                  background: 'radial-gradient(circle, rgba(236,72,153,0.95), rgba(139,92,246,0.8))',
                  boxShadow: '0 0 15px rgba(236,72,153,0.95)',
                  clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
                  animationDelay: '0.5s'
                }} />
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rgba(124,58,237,0.25) to-transparent" style={{animation: 'electric-flow 5s ease-in-out infinite'}}></div>
                </div>
                <h1 className="relative text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white text-center drop-shadow-2xl flex items-center gap-2 sm:gap-3 px-2">
                  <div className="w-6 h-6 sm:w-7 md:w-8 sm:h-7 md:h-8" style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.8))',
                    clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.95)',
                    filter: 'brightness(1.5)'
                  }} />
                  <span>Bem-vindo!</span>
                  <div className="w-6 h-6 sm:w-7 md:w-8 sm:h-7 md:h-8 rounded-full" style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.95), rgba(139,92,246,0.8), rgba(16,185,129,0.5))',
                    boxShadow: '0 0 20px rgba(236,72,153,0.95)'
                  }} />
                </h1>
              </div>

              {/* Conteúdo aurora */}
              <div className="p-6 sm:p-7 md:p-8 text-center">
                {/* Ícone Aurora com camadas */}
                <div className="relative w-20 h-20 sm:w-24 md:w-28 sm:h-24 md:h-28 mx-auto mb-5 sm:mb-6 md:mb-7">
                  {/* Camada externa - aurora roxa */}
                  <div className="absolute inset-0 rounded-full animate-plasma-pulse" style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(124,58,237,0.6), rgba(59,130,246,0.4))',
                    backdropFilter: 'blur(15px)',
                    border: '2px solid rgba(124,58,237,0.5)',
                    boxShadow: '0 10px 45px 0 rgba(124,58,237,0.6), 0 5px 25px rgba(59,130,246,0.4)'
                  }} />
                  {/* Camada interna - aurora rosa */}
                  <div className="absolute inset-3 rounded-full animate-plasma-pulse-delayed" style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.7), rgba(139,92,246,0.5))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(236,72,153,0.6)'
                  }} />
                  {/* Símbolo central - diamante aurora */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 md:w-10 sm:h-8 md:h-10 animate-electric-bolt" style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.98), rgba(236,72,153,0.9))',
                      clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
                      boxShadow: '0 0 25px rgba(124,58,237,0.95)',
                      filter: 'brightness(1.6)'
                    }} />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400 mb-4 sm:mb-5">
                  Acesse Ofertas Exclusivas
                </h2>
                <p className="text-purple-100/90 mb-5 sm:mb-6 md:mb-7 leading-relaxed text-sm sm:text-base md:text-lg">
                  Valide sua identidade e tenha acesso a descontos especiais e diamantes extras!
                </p>
                
                <div className="relative p-4 sm:p-5 md:p-6 mb-5 sm:mb-6 md:mb-7 overflow-hidden" style={{
                  background: 'rgba(124, 58, 237, 0.12)',
                  backdropFilter: 'blur(22px)',
                  borderRadius: '26px',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  boxShadow: '0 8px 30px 0 rgba(124, 58, 237, 0.4), 0 4px 15px rgba(236, 72, 153, 0.3)'
                }}>
                  {/* Partículas aurora decorativas */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-7 md:w-8 sm:h-7 md:h-8 rounded-full opacity-50 animate-plasma-sphere" style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.95), rgba(139,92,246,0.8), rgba(16,185,129,0.5))',
                    boxShadow: '0 0 18px rgba(236,72,153,0.9)'
                  }} />
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-6 h-6 sm:w-7 md:w-8 sm:h-7 md:h-8 opacity-50 animate-electric-bolt" style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.85))',
                    clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)',
                    boxShadow: '0 0 18px rgba(124,58,237,0.9)',
                    filter: 'brightness(1.5)'
                  }} />
                  <p className="text-purple-100 font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                    <div className="w-5 h-5 sm:w-6 sm:h-6" style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.98), rgba(236,72,153,0.9))',
                      clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
                      boxShadow: '0 0 15px rgba(124,58,237,0.95)',
                      filter: 'brightness(1.5)'
                    }} />
                    <span>Benefício Exclusivo</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.95), rgba(139,92,246,0.8), rgba(16,185,129,0.5))',
                      boxShadow: '0 0 15px rgba(236,72,153,0.95)'
                    }} />
                  </p>
                  <p className="text-purple-100/90 text-sm sm:text-base md:text-lg leading-relaxed relative z-10">
                    Valide sua conta e receba <span className="font-bold text-pink-300 text-base sm:text-lg md:text-xl">70% de desconto</span> na sua recarga!
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 md:mb-7">
                  <div className="flex items-center gap-3 sm:gap-4 text-purple-200 relative z-10">
                    <div className="w-4 h-4 sm:w-5 sm:h-5" style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.98), rgba(59,130,246,0.85))',
                      clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)',
                      boxShadow: '0 0 12px rgba(124,58,237,0.95)',
                      filter: 'brightness(1.5)'
                    }} />
                    <span className="font-semibold text-sm sm:text-base">Validação rápida e segura</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-pink-200 relative z-10">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" style={{
                      background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.95), rgba(139,92,246,0.8), rgba(16,185,129,0.5))',
                      boxShadow: '0 0 12px rgba(236,72,153,0.95)'
                    }} />
                    <span className="font-semibold text-sm sm:text-base">Descontos de até 70%</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-blue-100 relative z-10">
                    <div className="w-4 h-4 sm:w-5 sm:h-5" style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.98), rgba(236,72,153,0.9))',
                      clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
                      boxShadow: '0 0 12px rgba(124,58,237,0.95)'
                    }} />
                    <span className="font-semibold text-sm sm:text-base">Diamantes extras grátis</span>
                  </div>
                </div>

                <button
                  onClick={() => { playClickSound(); setStep('terms'); }}
                  className="w-full font-bold text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6 px-6 sm:px-8 md:px-10 transition-all duration-300 flex items-center justify-center relative overflow-hidden group text-white shadow-2xl hover:scale-[1.03]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.45), rgba(236,72,153,0.4))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(124,58,237,0.55)',
                    boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 20px rgba(236,72,153,0.4)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4" style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.98), rgba(236,72,153,0.9))',
                    clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
                    boxShadow: '0 0 18px rgba(124,58,237,0.95)',
                    filter: 'brightness(1.6)'
                  }} />
                  <span className="relative z-10">Iniciar Verificação</span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 ml-3 sm:ml-4 rounded-full" style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.95), rgba(139,92,246,0.8), rgba(16,185,129,0.5))',
                    boxShadow: '0 0 18px rgba(236,72,153,0.95)'
                  }} />
                </button>

                {/* Links de Termos e Políticas */}
                <div className="mt-5 sm:mt-6 md:mt-7 text-center text-xs sm:text-sm">
                  <p className="mb-2 text-purple-200/85">Ao continuar, você concorda com nossos</p>
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setShowTermsModal(true)}
                      className="text-purple-300 hover:text-pink-300 underline transition-colors font-semibold"
                    >
                      Termos de Uso
                    </button>
                    <span className="text-purple-300">•</span>
                    <button 
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-pink-300 hover:text-purple-300 underline transition-colors font-semibold"
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
            <div className="p-4 sm:p-5 md:p-6" style={{
              background: 'rgba(15, 10, 31, 0.75)',
              backdropFilter: 'blur(25px)',
              borderRadius: '28px',
              border: '1px solid rgba(124, 58, 237, 0.45)',
              boxShadow: '0 0 60px rgba(124, 58, 237, 0.5), 0 0 30px rgba(236, 72, 153, 0.35), inset 0 0 40px rgba(139, 92, 246, 0.15)'
            }}>
              <div className="mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400">Termos de Uso e Política de Privacidade</h2>
                <div className="p-3 sm:p-4 max-h-64 overflow-y-auto text-xs sm:text-sm text-purple-100/80 leading-relaxed" style={{
                  background: 'rgba(124, 58, 237, 0.08)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(124, 58, 237, 0.3)'
                }}>
                  
                  <div className="p-3 mb-4" style={{
                    background: 'rgba(124,58,237,0.15)',
                    borderLeft: '4px solid rgba(124,58,237,0.6)',
                    borderRadius: '10px'
                  }}>
                    <p className="text-purple-200 font-semibold">
                      ✨ <strong>EXCLUSIVIDADE:</strong> Deseja receber seu desconto especial? 
                      Aceite os termos e tenha acesso a ofertas exclusivas!
                    </p>
                  </div>

                  <h4 className="font-bold text-purple-200 mb-2">💎 TERMOS DE USO</h4>
                  <p className="mb-3">
                    <strong className="text-pink-300">1. Aceitação dos Termos:</strong> Ao aceitar estes termos, você concorda com todas as condições de uso deste site oficial de recargas e nossa política de privacidade. Este acordo é válido para todas as transações realizadas.
                  </p>
                  <p className="mb-3">
                    <strong className="text-purple-300">2. Usuários Verificados:</strong> Este site é exclusivo para usuários reais e verificados. É terminantemente proibido o uso de bots, sistemas automatizados ou contas falsas. Apenas IDs válidos de usuários ativos são aceitos.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">3. Ofertas Exclusivas:</strong> Usuários verificados têm acesso a descontos especiais, pacotes exclusivos e itens extras. As ofertas são limitadas e sujeitas a disponibilidade.
                  </p>
                  <p className="mb-3">
                    <strong className="text-purple-300">4. Transações Seguras:</strong> Garantimos 100% de segurança em todas as transações através de sistemas criptografados de última geração. Seus dados financeiros são protegidos pelos mais altos padrões de segurança.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">5. Validade da Oferta:</strong> O desconto de 70% é válido para recargas e não pode ser combinado com outras promoções. Esta oferta está sujeita à disponibilidade e pode ser encerrada a qualquer momento sem aviso prévio.
                  </p>
                  <p className="mb-3">
                    <strong className="text-purple-300">6. Uso Único:</strong> Este cupom é válido para uso único por usuário e não pode ser transferido.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">7. Conformidade:</strong> Esta promoção está em conformidade com as políticas do Google Ads e regulamentações aplicáveis. Todas as ofertas seguem as diretrizes de publicidade digital.
                  </p>

                  <h4 className="font-bold text-blue-200 mb-2 mt-4">⭐ POLÍTICA DE PRIVACIDADE</h4>
                  <p className="mb-3">
                    <strong className="text-purple-300">8. Coleta de Dados:</strong> Coletamos apenas informações necessárias para processar suas recargas: ID do usuário, dados de pagamento e informações de contato. Não compartilhamos dados com terceiros.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">9. Uso das Informações:</strong> Seus dados são utilizados exclusivamente para: processar recargas, enviar confirmações e oferecer suporte técnico.
                  </p>
                  <p className="mb-3">
                    <strong className="text-purple-300">10. Cookies e Rastreamento:</strong> Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar o tráfego do site de forma anônima.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">11. Direitos do Usuário:</strong> Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento através do nosso suporte.
                  </p>
                  <p className="mb-3">
                    <strong className="text-purple-300">12. Suporte 24h:</strong> Nossa equipe está disponível 24 horas para esclarecer dúvidas sobre privacidade, termos de uso ou questões técnicas.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">13. Atualizações:</strong> Estes termos podem ser atualizados periodicamente. Usuários serão notificados sobre mudanças importantes por email ou no site.
                  </p>
                  
                  <p className="text-xs text-purple-200/70 mt-4 italic">
                    Ao participar desta promoção, você concorda com estes termos e condições.
                  </p>

                  <div className="p-3 mt-4" style={{
                    background: 'rgba(236,72,153,0.15)',
                    borderLeft: '4px solid rgba(236,72,153,0.6)',
                    borderRadius: '10px'
                  }}>
                    <p className="text-pink-200 text-xs">
                      💎 <strong>Site Oficial e Confiável:</strong> Somos um centro de recarga oficial com milhares de usuários satisfeitos. 
                      Transações rápidas, seguras e com garantia de entrega.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-start text-xs sm:text-sm text-purple-100/80">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 text-purple-400 rounded focus:ring-purple-400 mt-0.5 bg-white/10 border-purple-300"
                  />
                  <span>
                    Eu li e aceito os{' '}
                    <span className="text-pink-300 underline font-bold">
                      Termos de Uso
                    </span>
                    {' '}e{' '}
                    <span className="text-purple-300 underline font-bold">
                      Política de Privacidade
                    </span>, 
                    e desejo ter acesso às <strong className="text-pink-300">ofertas exclusivas</strong> para usuários verificados
                  </span>
                </label>
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setStep('initial')}
                  className="flex-1 font-medium py-3 px-3 sm:px-4 transition-all duration-200 text-purple-200 text-sm sm:text-base hover:scale-105"
                  style={{
                    background: 'rgba(124, 58, 237, 0.15)',
                    backdropFilter: 'blur(15px)',
                    borderRadius: '18px',
                    border: '1px solid rgba(124, 58, 237, 0.35)'
                  }}
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleAcceptTerms}
                  disabled={!accepted}
                  className={`flex-1 font-bold py-3 px-3 sm:px-4 transition-all duration-300 text-sm sm:text-base ${
                    accepted
                      ? 'text-white shadow-lg hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                  }`}
                  style={accepted ? {
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.45), rgba(236,72,153,0.4))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '18px',
                    border: '1px solid rgba(124,58,237,0.55)',
                    boxShadow: '0 0 30px rgba(124,58,237,0.5)'
                  } : { borderRadius: '18px' }}
                >
                  Continuar ✨
                </button>
              </div>
            </div>
          )}

          {/* Tela do QUIZ */}
          {step === 'quiz' && (
            <div className="bg-gradient-to-br from-black via-neutral-900 to-black rounded-3xl shadow-2xl border border-yellow-500/30 overflow-hidden backdrop-blur-xl">
              {/* Progress Bar */}
              <div className="h-1.5 bg-black">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-600 to-amber-500 p-4 flex justify-between items-center">
                <div className="text-white font-semibold">
                  Pergunta {currentQuestion + 1}/{quizQuestions.length}
                </div>
                <div className="bg-black/30 px-4 py-2 rounded-full text-white font-semibold flex items-center gap-2 backdrop-blur-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                  </svg>
                  {timeLeft}s
                </div>
              </div>

              {/* Pergunta */}
              <div className="p-6">
                {isTransitioning ? (
                  // Loading entre perguntas
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mb-4"></div>
                    <p className="text-white font-semibold">Próxima pergunta...</p>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-6 text-center leading-relaxed">
                      {quizQuestions[currentQuestion].question}
                    </h3>

                    {/* Opções */}
                    <div className="space-y-3">
                      {quizQuestions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuizAnswer(index)}
                          disabled={isTransitioning}
                          className="w-full bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 hover:from-yellow-600 hover:to-amber-500 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 border border-neutral-600/30 hover:border-yellow-400/50 text-left hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="text-yellow-400 font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal de Termos de Uso */}
          {showTermsModal && (
            <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={playClickSound}>
              <div className="max-w-[95%] sm:max-w-xl md:max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto" style={{
                background: 'rgba(26, 26, 26, 0.5)',
                backdropFilter: 'blur(25px)',
                borderRadius: '30px',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                boxShadow: '0 10px 40px 0 rgba(255, 107, 53, 0.4)'
              }}>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6 -m-6 p-6" style={{
                    background: 'linear-gradient(135deg, rgba(255,107,53,0.25), rgba(211,47,47,0.22))',
                    backdropFilter: 'blur(20px)',
                    borderTopLeftRadius: '30px',
                    borderTopRightRadius: '30px',
                    borderBottom: '1px solid rgba(255,107,53,0.3)'
                  }}>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7" style={{
                        background: 'linear-gradient(135deg, rgba(255,193,7,0.8), rgba(255,107,53,0.6))',
                        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                        boxShadow: '0 0 15px rgba(255,193,7,0.8)'
                      }} />
                      <span>Termos de Uso</span>
                    </h3>
                    <button 
                      onClick={() => { playClickSound(); setShowTermsModal(false); }}
                      className="text-white hover:text-yellow-300 transition-colors bg-white/10 hover:bg-orange-500/20 rounded-lg p-2"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-orange-100/90 text-sm leading-relaxed">
                    <p><strong className="text-yellow-300 text-base">1. Aceitação dos Termos:</strong> Ao aceitar estes termos, você concorda com todas as condições de uso deste site oficial de recargas e nossa política de privacidade.</p>
                    
                    <p><strong className="text-orange-300 text-base">2. Usuários Verificados:</strong> Este site é exclusivo para jogadores reais e verificados. É terminantemente proibido o uso de bots, sistemas automatizados ou contas falsas.</p>
                    
                    <p><strong className="text-yellow-300 text-base">3. Ofertas Exclusivas:</strong> Usuários verificados têm acesso a descontos especiais, pacotes exclusivos e diamantes extras. As ofertas são limitadas e sujeitas a disponibilidade.</p>
                    
                    <p><strong className="text-orange-300 text-base">4. Transações Seguras:</strong> Garantimos 100% de segurança em todas as transações através de sistemas criptografados de última geração.</p>
                    
                    <p><strong className="text-yellow-300 text-base">5. Responsabilidade:</strong> O usuário é responsável por manter suas credenciais seguras e por todas as atividades realizadas em sua conta.</p>
                    
                    <p><strong className="text-orange-300 text-base">6. Modificações:</strong> Reservamos o direito de modificar estes termos a qualquer momento. Usuários serão notificados sobre mudanças importantes.</p>
                  </div>
                  
                  <button 
                    onClick={() => { playClickSound(); setShowTermsModal(false); }}
                    className="mt-6 w-full text-white font-bold py-4 px-4 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,107,53,0.5), rgba(211,47,47,0.4))',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,193,7,0.4)',
                      boxShadow: '0 0 30px rgba(255,107,53,0.5)'
                    }}
                  >
                    <div className="w-5 h-5" style={{
                      background: 'linear-gradient(135deg, rgba(255,193,7,0.9), rgba(255,107,53,0.7))',
                      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                      boxShadow: '0 0 12px rgba(255,193,7,0.9)'
                    }} />
                    <span>Entendi</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tela de RESULTADO */}
          {step === 'result' && (
            <div className="bg-gradient-to-br from-black via-neutral-900 to-black rounded-3xl shadow-2xl border border-yellow-500/30 overflow-hidden backdrop-blur-xl">
              {/* Header com animação */}
              <div className="relative h-28 bg-gradient-to-r from-yellow-600 to-amber-500 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <div className="relative text-center py-3">
                  <div className="text-3xl mb-1">{quizProfiles[quizResult]?.emoji}</div>
                  <h2 className="text-base font-bold text-white drop-shadow-lg">
                    SEU PERFIL
                  </h2>
                </div>
              </div>

              {/* Resultado */}
              <article className="p-8 text-center" role="main" aria-label="Resultado do Quiz">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-4">
                  {quizProfiles[quizResult]?.title}
                </h3>
                <p className="text-amber-200 text-base mb-8 leading-relaxed">
                  {quizProfiles[quizResult]?.description}
                </p>

                {/* Benefício */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-amber-500/20 rounded-2xl p-6 mb-6 border border-yellow-400/40 backdrop-blur-sm">
                  <div className="text-4xl mb-2">👑</div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Parabéns!
                  </h4>
                  <p className="text-amber-100 font-medium text-base mb-3">
                    Você desbloqueou
                  </p>
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-3">
                    70% OFF
                  </div>
                  <p className="text-amber-200 text-sm">
                    Desconto exclusivo na sua recarga!
                  </p>
                  <p className="text-yellow-300 text-xs mt-2 font-medium">
                    ⏰ Válido por 24 horas
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleAcceptReward}
                    className="bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-700 hover:to-amber-600 text-black font-bold text-lg py-5 px-8 rounded-2xl transition-all duration-200 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-[1.02]"
                    aria-label="Resgatar desconto de 70% exclusivo"
                  >
                    Resgatar Meu Desconto 💎
                  </button>
                </div>

                <p className="text-neutral-500 text-xs mt-4">
                  #Gaming #Quiz #Desconto
                </p>
              </article>
            </div>
          )}

          {/* Tela de Verificação */}
          {step === 'verification' && (
            <div className="overflow-hidden" style={{
              background: 'rgba(15, 10, 31, 0.75)',
              backdropFilter: 'blur(25px)',
              borderRadius: '28px',
              border: '1px solid rgba(124, 58, 237, 0.45)',
              boxShadow: '0 0 60px rgba(124, 58, 237, 0.5), 0 0 30px rgba(236, 72, 153, 0.35), inset 0 0 40px rgba(139, 92, 246, 0.15)'
            }}>
              {/* Header Aurora */}
              <div className="relative h-16 sm:h-20 flex items-center justify-center overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(236,72,153,0.22))',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(124,58,237,0.45)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rgba(124,58,237,0.1) to-transparent" />
                {/* Partículas decorativas */}
                <div className="absolute top-2 left-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{
                  background: 'radial-gradient(circle, rgba(124,58,237,0.95), transparent)',
                  boxShadow: '0 0 10px rgba(124,58,237,0.8)'
                }} />
                <div className="absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{
                  background: 'radial-gradient(circle, rgba(236,72,153,0.95), transparent)',
                  boxShadow: '0 0 10px rgba(236,72,153,0.8)'
                }} />
                <h2 className="relative text-base sm:text-lg md:text-xl font-bold text-white text-center drop-shadow-2xl flex items-center gap-1.5 sm:gap-2 px-2">
                  <span className="text-lg sm:text-xl md:text-2xl">✨</span>
                  <span>Validar Identidade</span>
                  <span className="text-lg sm:text-xl md:text-2xl">💎</span>
                </h2>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-purple-100/80 text-xs sm:text-sm mb-5 sm:mb-6 text-center">
                  Insira seu ID de usuário para confirmar que você é um usuário real
                </p>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-bold mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400 flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg md:text-xl">🎮</span>
                      <span>ID do Usuário</span>
                      <span className="text-xs text-purple-200 font-normal">(apenas números)</span>
                    </label>
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Digite seu ID (ex: 5435431)"
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 text-white text-base sm:text-lg font-bold placeholder-purple-200/40 focus:outline-none transition-all duration-300 shadow-lg"
                      style={{
                        background: 'rgba(124, 58, 237, 0.12)',
                        backdropFilter: 'blur(15px)',
                        borderRadius: '20px',
                        border: '1px solid rgba(124, 58, 237, 0.35)'
                      }}
                      disabled={isLoading}
                      maxLength={15}
                    />
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-5 shadow-lg relative overflow-hidden" style={{
                    background: 'rgba(124, 58, 237, 0.12)',
                    backdropFilter: 'blur(18px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(124, 58, 237, 0.35)'
                  }}>
                    {/* Partículas decorativas */}
                    <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-40" style={{
                      background: 'radial-gradient(circle, rgba(236,72,153,0.8), transparent)'
                    }} />
                    <div className="absolute bottom-2 left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-40" style={{
                      background: 'radial-gradient(circle, rgba(124,58,237,0.8), transparent)'
                    }} />
                    <p className="text-xs sm:text-sm text-purple-200 font-bold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 relative z-10">
                      <span className="text-base sm:text-lg">✨</span>
                      <span>Importante:</span>
                    </p>
                    <p className="text-xs sm:text-sm text-purple-100/80 mb-2 sm:mb-3 leading-relaxed relative z-10">
                      Digite seu <span className="text-pink-300 font-bold">ID REAL</span>! IDs falsos ou inválidos não passarão na verificação.
                    </p>
                    <p className="text-[10px] sm:text-xs text-purple-100/70 mb-2 sm:mb-3 rounded-lg p-2 relative z-10" style={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)'
                    }}>
                      📍 <span className="text-purple-200 font-semibold">Encontre seu ID em:</span><br/>
                      <span className="text-white font-bold ml-3 sm:ml-4">Configurações → Informações Básicas → ID do Usuário</span>
                    </p>
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="text-xs sm:text-sm text-pink-300 hover:text-purple-300 underline font-bold flex items-center gap-1 relative z-10"
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

              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <button
                  onClick={handleVerification}
                  disabled={isLoading || !playerId.trim()}
                  className={`w-full font-bold text-base sm:text-lg py-4 sm:py-5 px-6 sm:px-8 transition-all duration-300 flex items-center justify-center relative overflow-hidden group ${
                    isLoading || !playerId.trim()
                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed border-2 border-neutral-600 rounded-2xl'
                      : 'text-white shadow-2xl hover:scale-[1.05]'
                  }`}
                  style={!isLoading && playerId.trim() ? {
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.45), rgba(236,72,153,0.4))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '22px',
                    border: '1px solid rgba(124,58,237,0.55)',
                    boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 20px rgba(236,72,153,0.4)'
                  } : {}}
                >
                  {!isLoading && !(!playerId.trim()) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-3 border-white border-t-transparent mr-2 sm:mr-3"></div>
                      <span className="animate-pulse">Verificando...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg sm:text-xl md:text-2xl mr-1.5 sm:mr-2">✨</span>
                      <span className="relative z-10">Entrar</span>
                      <span className="text-lg sm:text-xl md:text-2xl ml-1.5 sm:ml-2">💎</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* Modal de Política de Privacidade */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={playClickSound}>
          <div className="max-w-[95%] sm:max-w-xl md:max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto" style={{
            background: 'rgba(26, 26, 26, 0.5)',
            backdropFilter: 'blur(25px)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            boxShadow: '0 10px 40px 0 rgba(255, 107, 53, 0.4)'
          }}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6 -m-4 sm:-m-6 p-4 sm:p-6" style={{
                background: 'linear-gradient(135deg, rgba(255,107,53,0.25), rgba(211,47,47,0.22))',
                backdropFilter: 'blur(20px)',
                borderTopLeftRadius: '30px',
                borderTopRightRadius: '30px',
                borderBottom: '1px solid rgba(255,107,53,0.3)'
              }}>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7" style={{
                    background: 'linear-gradient(135deg, rgba(211,47,47,0.8), rgba(255,107,53,0.6))',
                    clipPath: 'ellipse(50% 60% at 50% 40%)',
                    boxShadow: '0 0 15px rgba(211,47,47,0.8)',
                    filter: 'blur(0.5px)'
                  }} />
                  <span>Política de Privacidade</span>
                </h3>
                <button 
                  onClick={() => { playClickSound(); setShowPrivacyModal(false); }}
                  className="text-white hover:text-yellow-300 transition-colors bg-white/10 hover:bg-orange-500/20 rounded-lg p-2"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 text-orange-100/90 text-sm leading-relaxed">
                <p><strong className="text-yellow-300 text-base">1. Coleta de Dados:</strong> Coletamos apenas informações necessárias para processar suas recargas: ID do jogador, dados de pagamento e informações de contato. Não compartilhamos dados com terceiros.</p>
                
                <p><strong className="text-orange-300 text-base">2. Uso das Informações:</strong> Seus dados são utilizados exclusivamente para: processar recargas, enviar confirmações e oferecer suporte técnico.</p>
                
                <p><strong className="text-yellow-300 text-base">3. Segurança:</strong> Utilizamos criptografia SSL/TLS e seguimos os mais altos padrões de segurança da indústria para proteger suas informações.</p>
                
                <p><strong className="text-orange-300 text-base">4. Cookies:</strong> Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar o tráfego do site de forma anônima.</p>
                
                <p><strong className="text-yellow-300 text-base">5. Direitos do Usuário:</strong> Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento através do nosso suporte.</p>
                
                <p><strong className="text-orange-300 text-base">6. Conformidade LGPD:</strong> Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD) e respeitamos todos os seus direitos de privacidade.</p>
              </div>
              
              <button 
                onClick={() => { playClickSound(); setShowPrivacyModal(false); }}
                className="mt-6 w-full text-white font-bold py-4 px-4 transition-all duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,53,0.5), rgba(211,47,47,0.4))',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,193,7,0.4)',
                  boxShadow: '0 0 30px rgba(255,107,53,0.5)'
                }}
              >
                <div className="w-5 h-5" style={{
                  background: 'linear-gradient(135deg, rgba(211,47,47,0.9), rgba(255,107,53,0.7))',
                  clipPath: 'ellipse(50% 60% at 50% 40%)',
                  boxShadow: '0 0 12px rgba(211,47,47,0.9)',
                  filter: 'blur(0.5px)'
                }} />
                <span>Entendi</span>
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

      {/* Botão de teste Google Ads - Renderizado dentro do modal */}
      <GoogleConversionTest />
    </div>
  )
}

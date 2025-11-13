'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import GoogleConversionTest from './GoogleConversionTest'
import { getSiteFingerprint, getUniqueDataAttributes, injectUniqueCSSVariables, getUniqueDelay } from '@/lib/site-fingerprint'

interface UserVerificationProps {
  onVerificationComplete: () => void
}

export default function UserVerification({ onVerificationComplete }: UserVerificationProps) {
  const [step, setStep] = useState<'initial' | 'quiz' | 'result' | 'reward' | 'terms' | 'verification'>('initial')
  const [playerId, setPlayerId] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [siteFingerprint, setSiteFingerprint] = useState<ReturnType<typeof getSiteFingerprint> | null>(null)
  const [uniqueDelay, setUniqueDelay] = useState(1000)

  // Inicializar fingerprint único do site
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fingerprint = getSiteFingerprint()
      setSiteFingerprint(fingerprint)
      setUniqueDelay(getUniqueDelay(1000))
      injectUniqueCSSVariables()
    }
  }, [])

  // Estados do Quiz Arena de Fogo
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(15)

  // Perguntas do Quiz
  const quizQuestions = [
    {
      question: "🔮 Qual é o seu estilo de jogo favorito?",
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
      question: "🏆 O que te motiva a jogar?",
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
      
      // Salvar cookies (30 dias de validade)
      const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
      document.cookie = `quiz_completed=true; ${cookieOptions}`
      document.cookie = `referer_verified=true; ${cookieOptions}`
      document.cookie = `user_verified=true; ${cookieOptions}`
      
      // Fechar modal imediatamente e liberar central de recargas
      onVerificationComplete() // Fecha o modal e libera a página
      
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

  return (
    <>
      {/* Botão de teste Google Ads */}
      <GoogleConversionTest />
      
      <div className="fixed inset-0 z-[9999] overflow-hidden" style={{
        background: '#ffffff'
      }}>
        {/* Efeitos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Formas decorativas sutis */}
        <div className="absolute top-10 right-10 w-32 h-32 opacity-5" style={{
          background: 'linear-gradient(135deg, #3498db, #2980b9)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        }} />
        <div className="absolute bottom-10 left-10 w-40 h-40 opacity-5" style={{
          background: 'linear-gradient(135deg, #2980b9, #3498db)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        }} />
      </div>

      <style>{`
        @keyframes liquid-wave {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg); 
            opacity: 0.15;
            border-radius: 60% 40% 70% 30% / 60% 30% 70% 40%;
          }
          33% { 
            transform: translate(50px, -30px) scale(1.15) rotate(120deg); 
            opacity: 0.22;
            border-radius: 40% 60% 50% 50% / 70% 30% 60% 40%;
          }
          66% { 
            transform: translate(-40px, 40px) scale(0.9) rotate(240deg); 
            opacity: 0.18;
            border-radius: 70% 30% 40% 60% / 50% 60% 40% 50%;
          }
        }
        @keyframes liquid-wave-reverse {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(360deg); 
            opacity: 0.18;
            border-radius: 50% 50% 60% 40% / 40% 60% 50% 50%;
          }
          50% { 
            transform: translate(-45px, 45px) scale(1.12) rotate(180deg); 
            opacity: 0.25;
            border-radius: 60% 40% 30% 70% / 60% 40% 70% 30%;
          }
        }
        @keyframes liquid-drop {
          0%, 100% { 
            transform: translateY(0) scale(1);
            opacity: 0.25;
            border-radius: 60% 40% 70% 30% / 60% 30% 70% 40%;
          }
          50% { 
            transform: translateY(-20px) scale(1.08);
            opacity: 0.38;
            border-radius: 40% 60% 50% 50% / 30% 70% 60% 40%;
          }
        }
        @keyframes liquid-morph {
          0% { 
            border-radius: 40% 60% 30% 70% / 40% 70% 30% 60%;
            transform: rotate(0deg) scale(1);
            opacity: 0.30;
          }
          33% { 
            border-radius: 70% 30% 60% 40% / 60% 40% 70% 30%;
            transform: rotate(120deg) scale(1.1);
            opacity: 0.42;
          }
          66% { 
            border-radius: 50% 50% 40% 60% / 50% 60% 40% 50%;
            transform: rotate(240deg) scale(0.95);
            opacity: 0.35;
          }
          100% { 
            border-radius: 40% 60% 30% 70% / 40% 70% 30% 60%;
            transform: rotate(360deg) scale(1);
            opacity: 0.30;
          }
        }
        @keyframes shimmer-liquid {
          0% { 
            transform: translateX(-100%) skewX(-10deg); 
            opacity: 0; 
          }
          50% { 
            opacity: 0.5; 
          }
          100% { 
            transform: translateX(200%) skewX(-10deg); 
            opacity: 0; 
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-liquid-wave {
          animation: liquid-wave 28s ease-in-out infinite;
        }
        .animate-liquid-wave-reverse {
          animation: liquid-wave-reverse 24s ease-in-out infinite;
        }
        .animate-liquid-drop {
          animation: liquid-drop 10s ease-in-out infinite;
        }
        .animate-liquid-morph {
          animation: liquid-morph 14s linear infinite;
        }
      `}</style>

      <div className="relative flex items-center justify-center min-h-screen p-3">
        <div className="w-full max-w-[90%] sm:max-w-sm">
          
          {/* Tela Inicial */}
          {step === 'initial' && (
            <div className="relative overflow-hidden bg-white shadow-2xl" style={{
              borderRadius: '12px',
              border: '2px solid #e5e5e5'
            }}>
              {/* Header Free Fire */}
              <div className="relative h-12 flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
              }}>
                <h1 className="text-base sm:text-lg font-bold text-white text-center">
                  🎉 Bem-vindo ao Evento!
                </h1>
              </div>

              {/* Conteúdo */}
              <div className="p-4 text-center">
                <div className="text-4xl mb-3">🎟️</div>
                
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Participe do Nosso Evento Promocional
                </h2>
                <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                  Complete os passos e concorra a desconto!
                </p>
                
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-900 font-bold text-sm mb-2">
                    🎯 Desconto na Primeira Compra
                  </p>
                  <p className="text-red-700 text-xs leading-relaxed">
                    Complete a validação e concorra a desconto especial na sua primeira compra de créditos digitais
                  </p>
                </div>

                <button
                  onClick={() => setStep('verification')}
                  className="w-full font-bold text-base py-3 px-4 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                  }}
                >
                  Participar do Evento 🎟️
                </button>

                {/* Links de Termos e Políticas */}
                <div className="mt-4 text-center text-xs">
                  <p className="mb-1 text-gray-500 text-xs">Ao continuar, você concorda</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button 
                      onClick={() => setShowTermsModal(true)}
                      className="text-red-600 hover:text-red-700 underline transition-colors text-xs"
                    >
                      Termos
                    </button>
                    <span className="text-gray-400">•</span>
                    <button 
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-red-600 hover:text-red-700 underline transition-colors text-xs"
                    >
                      Privacidade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tela de Termos */}
          {step === 'terms' && (
            <div className="p-5" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(100, 150, 255, 0.2)'
            }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-200 to-purple-300">Termos de Uso e Política de Privacidade</h2>
                <div className="p-4 max-h-64 overflow-y-auto text-sm text-blue-100/80 leading-relaxed" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  
                  <div className="p-3 mb-4" style={{
                    background: 'rgba(100,150,255,0.1)',
                    borderLeft: '4px solid rgba(100,150,255,0.5)',
                    borderRadius: '10px'
                  }}>
                    <p className="text-blue-200 font-semibold">
                      ✨ <strong>EXCLUSIVIDADE:</strong> Deseja receber seu desconto especial? 
                      Aceite os termos e tenha acesso a ofertas exclusivas!
                    </p>
                  </div>

                  <h4 className="font-bold text-blue-200 mb-2">💎 TERMOS DE USO</h4>
                  <p className="mb-3">
                    <strong className="text-pink-300">1. Aceitação dos Termos:</strong> Ao aceitar estes termos, você concorda com todas as condições de uso deste site oficial de recargas e nossa política de privacidade. Este acordo é válido para todas as transações realizadas.
                  </p>
                  <p className="mb-3">
                    <strong className="text-blue-300">2. Usuários Verificados:</strong> Este site é exclusivo para jogadores reais e verificados. É terminantemente proibido o uso de bots, sistemas automatizados ou contas falsas. Apenas IDs válidos de jogadores ativos são aceitos.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">3. Ofertas Exclusivas:</strong> Usuários verificados têm acesso a descontos especiais, pacotes exclusivos e diamantes extras. As ofertas são limitadas e sujeitas a disponibilidade.
                  </p>
                  <p className="mb-3">
                    <strong className="text-blue-300">4. Transações Seguras:</strong> Garantimos 100% de segurança em todas as transações através de sistemas criptografados de última geração. Seus dados financeiros são protegidos pelos mais altos padrões de segurança.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">5. Validade da Oferta:</strong> O desconto de 70% é válido para recargas e não pode ser combinado com outras promoções. Esta oferta está sujeita à disponibilidade e pode ser encerrada a qualquer momento sem aviso prévio.
                  </p>
                  <p className="mb-3">
                    <strong className="text-blue-300">6. Uso Único:</strong> Este cupom é válido para uso único por usuário e não pode ser transferido.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">7. Conformidade:</strong> Esta promoção está em conformidade com as políticas do Google Ads e regulamentações aplicáveis. Todas as ofertas seguem as diretrizes de publicidade digital.
                  </p>

                  <h4 className="font-bold text-purple-200 mb-2 mt-4">⭐ POLÍTICA DE PRIVACIDADE</h4>
                  <p className="mb-3">
                    <strong className="text-blue-300">8. Coleta de Dados:</strong> Coletamos apenas informações necessárias para processar suas recargas: ID do jogador, dados de pagamento e informações de contato. Não compartilhamos dados com terceiros.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">9. Uso das Informações:</strong> Seus dados são utilizados exclusivamente para: processar recargas, enviar confirmações e oferecer suporte técnico.
                  </p>
                  <p className="mb-3">
                    <strong className="text-blue-300">10. Cookies e Rastreamento:</strong> Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar o tráfego do site de forma anônima.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">11. Direitos do Usuário:</strong> Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento através do nosso suporte.
                  </p>
                  <p className="mb-3">
                    <strong className="text-blue-300">12. Suporte 24h:</strong> Nossa equipe está disponível 24 horas para esclarecer dúvidas sobre privacidade, termos de uso ou questões técnicas.
                  </p>
                  <p className="mb-3">
                    <strong className="text-pink-300">13. Atualizações:</strong> Estes termos podem ser atualizados periodicamente. Usuários serão notificados sobre mudanças importantes por email ou no site.
                  </p>
                  
                  <p className="text-xs text-pink-200/70 mt-4 italic">
                    Ao participar desta promoção, você concorda com estes termos e condições.
                  </p>

                  <div className="p-3 mt-4" style={{
                    background: 'rgba(255,100,200,0.1)',
                    borderLeft: '4px solid rgba(255,100,200,0.5)',
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
                <label className="flex items-start text-sm text-blue-100/80">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mr-3 w-5 h-5 text-blue-400 rounded focus:ring-blue-400 mt-0.5 bg-white/10 border-blue-300"
                  />
                  <span>
                    Eu li e aceito os{' '}
                    <span className="text-pink-300 underline font-bold">
                      Termos de Uso
                    </span>
                    {' '}e{' '}
                    <span className="text-blue-300 underline font-bold">
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

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('initial')}
                  className="flex-1 font-medium py-3 px-4 transition-all duration-200 text-blue-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleAcceptTerms}
                  disabled={!accepted}
                  className={`flex-1 font-bold py-3 px-4 transition-all duration-300 ${
                    accepted
                      ? 'text-white shadow-lg hover:scale-105'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                  }`}
                  style={accepted ? {
                    background: 'linear-gradient(135deg, rgba(100,150,255,0.4), rgba(255,100,200,0.3))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.25)'
                  } : {}}
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
            <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3" onClick={() => {}}>
              <div className="max-w-[90%] sm:max-w-lg w-full max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between p-4" style={{
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                }}>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    📜 Termos de Uso
                  </h3>
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="p-4 space-y-3 text-gray-700 text-xs sm:text-sm leading-relaxed">
                  <p><strong className="text-blue-600">1. Natureza do Evento:</strong> Somos uma plataforma de eventos promocionais que oferece cupons de desconto para recargas de créditos digitais. NÃO somos jogo de azar, cassino ou plataforma de apostas.</p>
                  
                  <p><strong className="text-blue-600">2. Conformidade Google Ads:</strong> Estamos em total conformidade com as políticas do Google Ads. Promovemos apenas eventos legítimos com cupons para plataformas de recarga de jogos mobile.</p>
                  
                  <p><strong className="text-blue-600">3. Plataforma Independente:</strong> NÃO temos afiliação, parceria ou vínculo com desenvolvedoras de jogos ou aplicativos. Somos uma plataforma independente de eventos promocionais.</p>
                  
                  <p><strong className="text-blue-600">4. Cupons e Promoções:</strong> Os cupons são válidos para primeira recarga. Sujeitos a disponibilidade e termos específicos de cada evento.</p>
                  
                  <p><strong className="text-blue-600">5. Responsabilidade:</strong> Você é responsável pelo uso correto dos cupons e pela segurança de suas credenciais.</p>
                  
                  <p><strong className="text-blue-600">6. Atualizações:</strong> Estes termos podem ser atualizados. Participantes serão notificados sobre mudanças importantes.</p>
                </div>
                
                <div className="p-4">
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                    }}
                  >
                    Entendi
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
            <div className="overflow-hidden bg-white shadow-2xl" style={{
              borderRadius: '16px',
              border: '2px solid #e5e5e5'
            }}>
              {/* Header Free Fire */}
              <div className="relative h-16 flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
              }}>
                <h2 className="text-xl md:text-2xl font-bold text-white text-center">
                  🎟️ Cadastro no Evento
                </h2>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 text-center">
                  Digite seu ID do jogo para participar do evento
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 text-xs font-semibold mb-2">📋 Conformidade e Transparência:</p>
                  <ul className="text-blue-700 text-[10px] space-y-1">
                    <li>✅ Em conformidade com políticas do Google Ads</li>
                    <li>✅ Conforme LGPD - Não coletamos dados pessoais</li>
                    <li>✅ Evento promocional independente</li>
                    <li>✅ Sem vínculo com desenvolvedoras de jogos</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-900">
                      ID do Jogador
                    </label>
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Ex: 5435431"
                      className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition-all"
                      style={{ color: '#000000' }}
                      disabled={isLoading}
                      maxLength={15}
                    />
                    <p className="text-xs text-gray-500 mt-1">Apenas números</p>
                  </div>
                  
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-900 font-bold mb-2">
                      📍 Como encontrar seu ID:
                    </p>
                    <p className="text-xs text-orange-800 mb-2">
                      Abra o jogo → <span className="font-bold">Configurações</span> → <span className="font-bold">Informações Básicas</span>
                    </p>
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="text-xs text-red-600 hover:text-red-700 underline font-medium"
                    >
                      Ver tutorial completo
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

              <div className="px-6 pb-6">
                <button
                  onClick={handleVerification}
                  disabled={isLoading || !playerId.trim()}
                  className={`w-full font-bold text-lg py-4 px-6 rounded-lg transition-all duration-200 ${
                    isLoading || !playerId.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                  style={!isLoading && playerId.trim() ? {
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                  } : {}}
                >
                  {isLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-2"></div>
                      Verificando...
                    </>
                  ) : (
                    'Entrar 🔥'
                  )}
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* Modal de Política de Privacidade */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3" onClick={() => {}}>
          <div className="max-w-[90%] sm:max-w-lg w-full max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4" style={{
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
            }}>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                🔒 Privacidade
              </h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-3 text-gray-700 text-xs sm:text-sm leading-relaxed">
              <p><strong className="text-blue-600">1. Não Coletamos Dados Pessoais:</strong> NÃO coletamos, armazenamos ou compartilhamos dados pessoais sensíveis. Apenas utilizamos o ID do jogo para validação de participação no evento. Nenhum dado pessoal é armazenado.</p>
              
              <p><strong className="text-blue-600">2. LGPD - Lei 13.709/2018:</strong> Em TOTAL conformidade com a Lei Geral de Proteção de Dados (LGPD). Não processamos dados pessoais que exijam consentimento ou armazenamento.</p>
              
              <p><strong className="text-blue-600">3. Processamento de Cupons:</strong> Os cupons são gerados automaticamente. Não solicitamos CPF, e-mail pessoal, telefone ou qualquer informação sensível para participação no evento.</p>
              
              <p><strong className="text-blue-600">4. Cookies Mínimos:</strong> Usamos apenas cookies técnicos essenciais para funcionamento do evento (sessão temporária). SEM rastreamento, SEM publicidade, SEM coleta de dados.</p>
              
              <p><strong className="text-blue-600">5. Transparência Total:</strong> Você pode participar do evento sem fornecer dados pessoais. Apenas o ID do jogo é necessário para validação.</p>
              
              <p><strong className="text-blue-600">6. Conformidade Google Ads:</strong> Total conformidade com políticas de privacidade do Google Ads e LGPD brasileira.</p>
            </div>
            
            <div className="p-4">
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
                }}
              >
                Entendi
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
                <h3 className="text-xl font-bold text-gray-800">Como encontrar seu ID</h3>
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
                  <p className="text-sm text-gray-700 mb-3">Veja onde encontrar seu ID no jogo:</p>
                  <img 
                    src="/images/tutorialff.jpg" 
                    alt="Tutorial ID" 
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
    </>
  )
}

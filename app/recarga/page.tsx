"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { useUtmParams } from '@/hooks/useUtmParams';
import LoginModal from '@/components/login-modal';
import { useAuth } from '@/hooks/useAuth';
import GoogleConversionTest from '@/components/GoogleConversionTest';

// Log GLOBAL - executa ao carregar o módulo

export default function HomePage() {
  // Log IMEDIATO para debug

  
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const [mounted, setMounted] = useState(false)
  const [, setShowLeadMessage] = useState(false)
  const [, setLeadMessageType] = useState<"default" | "nao_quer_agora" | "nao_tem_interesse">("default")
  const [loginError, setLoginError] = useState("")
  const [showSocialError, setShowSocialError] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showPurchasePage, setShowPurchasePage] = useState(true)
  const [showOfferInfoModal, setShowOfferInfoModal] = useState(false)
  const [selectedOfferInfo, setSelectedOfferInfo] = useState<{name: string, image: string, description: string} | null>(null)
  const [, setTextAnswer] = useState("")
  const [, setSelectedValue] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [, setShowIllusoryLoading] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<string | null>(null)
  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<string | null>(null)
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [showBlurOverlay, setShowBlurOverlay] = useState(false) // Começa FALSE, depois verifica
  const [showFreeItemModal, setShowFreeItemModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>("PIX")
  const [pendingPurchase, setPendingPurchase] = useState(false) // Flag para compra pendente após verificação
  
  // Estados do Quiz Arena de Fogo
  const [quizStep, setQuizStep] = useState<'intro' | 'quiz' | 'result' | 'reward' | 'validation'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResult, setQuizResult] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(15)
  // const [showExitMessage, setShowExitMessage] = useState(false)
  // const [exitMessage, setExitMessage] = useState("")
  // const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  // const [pendingDisqualifyAnswer, setPendingDisqualifyAnswer] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<'freefire' | 'deltaforce' | 'haikyu'>('freefire')
  const [showSummaryDetails, setShowSummaryDetails] = useState(false)
  const [discountTimeLeft, setDiscountTimeLeft] = useState(15 * 60) // 15 minutos em segundos
  
  // Perguntas do Quiz Arena de Fogo
  const quizQuestions = [
    {
      question: " Qual é o seu estilo de jogo no Free Fire?",
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
      question: "🔥 Qual personagem te representa?",
      options: [
        { text: "Chrono - Controle do tempo", points: { estrategista: 3, lider: 0, atirador: 0, rusher: 0 } },
        { text: "Wukong - Agilidade ninja", points: { rusher: 3, lider: 0, atirador: 0, estrategista: 0 } },
        { text: "DJ Alok - Suporte e cura", points: { lider: 3, estrategista: 0, atirador: 0, rusher: 0 } },
        { text: "Moco - Rastreamento preciso", points: { atirador: 3, lider: 0, estrategista: 0, rusher: 0 } }
      ]
    }
  ]

  // Perfis de resultado
  const quizProfiles = {
    lider: {
      title: "🔥 O LÍDER DA FOGUEIRA",
      description: "Você nasceu para comandar! Seu squad te segue até o fim. Estratégia e liderança são suas armas.",
      emoji: "👑"
    },
    atirador: {
      title: "🎯 O SNIPER LENDÁRIO",
      description: "Precisão cirúrgica! Você elimina antes que vejam de onde veio. Cada tiro, uma baixa garantida.",
      emoji: "🎯"
    },
    rusher: {
      title: "💥 O RUSHER INSANO",
      description: "Adrenalina pura! Você não conhece o medo. Vai de frente e deixa o caos para trás.",
      emoji: "⚡"
    },
    estrategista: {
      title: "🧠 O MESTRE ESTRATEGISTA",
      description: "Você pensa 10 passos à frente. Cada movimento é calculado. A vitória é questão de tempo.",
      emoji: "🧠"
    }
  }
  
  // Função para navegar preservando UTM params
  const navigateToGame = (appId: string) => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set('app', appId)
      // Mudar URL sem refresh
      window.history.pushState({}, '', `/recarga?${searchParams.toString()}`)
    }
  }

  // Função para adicionar UTMs a qualquer URL interna
  const addUtmsToUrl = (url: string): string => {
    if (typeof window === 'undefined') return url
    
    const currentParams = new URLSearchParams(window.location.search)
    const urlObj = new URL(url, window.location.origin)
    
    // Adicionar todos os parâmetros atuais à nova URL
    currentParams.forEach((value, key) => {
      if (!urlObj.searchParams.has(key)) {
        urlObj.searchParams.set(key, value)
      }
    })
    
    return urlObj.pathname + urlObj.search
  }
  
  // Configurações dinâmicas por jogo
  const gameConfig = {
    freefire: {
      name: 'Free Fire',
      banner: '/images/checkout-banner.webp',
      icon: '/images/icon.png',
      coinIcon: '/images/point.webp',
      userIcon: '/images/icon.png',
      rechargeValues: ["100", "310", "520", "2.180", "5.600", "15.600"],
      promotionalValues: ["2.180", "5.600", "15.600"],
      specialOffers: [
        { id: 'firepower', name: 'Poder do Fogo (3 unidades Restantes)', image: '/images/firepower.png', description: 'Personagem "Poder do Fogo" - (3 unidades Restantes)' },
        { id: 'mensal', name: 'Assinatura Mensal', image: '/images/mensal.png', description: 'Receba 300 diamantes agora e resgate 50 diamantes todos os dias no jogo, durante 30 dias! Você receberá 1800 diamantes no total.' },
        { id: 'booyah', name: 'Passe Booyah Premium Plus', image: '/images/boyahplus.png', description: 'Receba todos os privilégios e benefícios do Booyah Pass Premium + benefícios exclusivos + 50 níveis do Booyah Pass instantaneamente + 5.600 diamantes extras!' },
        { id: 'nivel', name: 'Passe de Nível', image: '/images/passe-nivel.webp', description: 'Avance de nível e desbloqueie benefícios incríveis, incluindo skins exclusivas e diamantes.' }
      ]
    },
    deltaforce: {
      name: 'Delta Force',
      banner: '/images/backgroundDelta.jpg',
      icon: '/images/delta-force-icon.webp',
      coinIcon: '/images/IconeCoinsDF.png',
      userIcon: '/images/iconeusuarioDeltaForce.png',
      rechargeValues: ["60", "300", "680", "1.280", "3.280", "6.480"],
      promotionalValues: ["680", "1.280", "3.280", "6.480"], // Todos com coins em dobro
      specialOffers: [
        { id: 'genesis', name: 'Black Hawk Down - Gênesis', image: '/images/Black Hawk Down - Gênesis.png', description: 'Limitado a 1 compra por conta.' },
        { id: 'reinvencao', name: 'Black Hawk Down - Reinvenção', image: '/images/Black Hawk Down - Reinvenção.png', description: 'Limitado a 1 compra por conta.' },
        { id: 'mare', name: 'Suprimentos de Maré', image: '/images/Suprimentos de Maré.png', description: 'Limitado a 1 compra por conta.' },
        { id: 'mare-avancado', name: 'Suprimentos de Maré - Avançado', image: '/images/Suprimentos de Maré - Avançado.png', description: 'Limitado a 1 compra por conta.' }
      ]
    },
    haikyu: {
      name: 'HAIKYU!! FLY HIGH',
      banner: '/images/backgroundHiuki.jpg',
      icon: '/images/HAIKIU FLY HIGH.png',
      coinIcon: '/images/iconCoinHaikyu.png',
      userIcon: '/images/HAIKIU FLY HIGH.png',
      rechargeValues: ["60", "300", "680", "1.280", "3.280", "6.480"],
      promotionalValues: ["680", "1.280", "3.280"],
      specialOffers: [
        { id: 'haikyu1', name: 'Especial de Recrutar Ultra I', image: '/images/haikiuEspecial1.png', description: 'Bilhete de Recrutar Ultra x1，Diamantes Estelares x200' },
        { id: 'haikyu2', name: 'Especial de Recrutar Ultra II', image: '/images/HaikiuEspecial2.png', description: 'Bilhete de Recrutar Ultra x5，Diamantes Estelares x300' },
        { id: 'haikyu3', name: 'Especial de Recrutar Ultra III', image: '/images/HaikiuEspecial3.png', description: 'Bilhete de Recrutar Ultra x5，Diamantes Estelares x500' },
        { id: 'haikyu4', name: 'Especial de Recrutar Ultra IV', image: '/images/HaikiuEspecial4.png', description: 'Bilhete de Recrutar Ultra x10，Diamantes Estelares x500' }
      ]
    }
  }

  const currentConfig = gameConfig[selectedGame]

  const router = useRouter()
  const { getUtmObject } = useUtmParams()
  
  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true)
    
    // Verificar se deve abrir modal de login
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('showLogin') === 'true') {
        console.log('🔓 [HOME] Abrindo modal de login (vindo do checkout)')
        setShowBlurOverlay(true)
        // Limpar parâmetro da URL
        urlParams.delete('showLogin')
        const newUrl = urlParams.toString() ? `/?${urlParams.toString()}` : '/'
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  // Controlar overflow do body quando modal abre/fecha
  useEffect(() => {
    if (showBlurOverlay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup: garantir que o overflow volta ao normal
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showBlurOverlay])

  // Verificar se usuário já está logado (via COOKIES, não localStorage)
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return
    
    const checkUserLogin = async () => {
      // Função para pegar cookie
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) {
          const cookieValue = parts.pop()?.split(';').shift()
          return cookieValue || null
        }
        return null
      }
      
      // Verificar cookies de verificação (compartilhados entre domínios)
      const quizCompleted = getCookie('quiz_completed') === 'true'
      const refererVerified = getCookie('referer_verified') === 'true'
      const userVerified = getCookie('user_verified') === 'true'
      const hasVerificationCookies = quizCompleted || refererVerified || userVerified
      
      
      // Se tem cookies de verificação, considerar como verificado
      if (hasVerificationCookies) {
        // Tentar pegar dados do localStorage (pode estar vazio no subdomain)
        const storedUserData = localStorage.getItem('userData')
        const user_data = localStorage.getItem('user_data')
        const storedPlayerId = localStorage.getItem('userPlayerId')
        
 
        
        if (storedUserData || user_data) {
          try {
            const userData = JSON.parse(storedUserData || user_data || '{}')
            
            if (userData.nickname) {
              setIsLoggedIn(true)
              setUserData(userData)
              console.log('✅ [AUTO-LOGIN] Usuário logado com userData completo:', userData.nickname)
              
              // Carregar avatar se existir
              if (userData.headPic) {
                await fetchAvatarInfo(userData.headPic)
              }
            }
          } catch (error) {
            console.error('❌ [AUTO-LOGIN] Erro ao parsear userData:', error)
          }
        } else if (storedPlayerId) {
          // Se não tem userData mas tem playerId, fazer login básico
          setIsLoggedIn(true)
          setPlayerId(storedPlayerId)
        } else {
        }
      } else {
      }
    }
    
    checkUserLogin()
  }, [mounted])

  // Verificar consentimento de cookies
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const cookieConsent = localStorage.getItem('cookieConsent')
    
    if (!cookieConsent) {
      setShowCookieBanner(true)
    }
  }, [])

  // Funções do Quiz
  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex]
    setQuizAnswers(newAnswers)
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(15)
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
    setQuizStep('result')
  }

  const handleStartQuiz = () => {
    setQuizStep('quiz')
    setCurrentQuestion(0)
    setQuizAnswers([])
    setTimeLeft(15)
  }

  const handleAcceptReward = () => {
    // Salvar cookie de quiz completado
    const currentHost = window.location.hostname
    
    // Configurar cookie
    const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    document.cookie = `quiz_completed=true; ${cookieOptions}`
    
    console.log('🍪 [QUIZ COMPLETED] Cookie definido')
    console.log('   - quiz_completed=true')
    console.log('🎁 [REWARD] Recompensa aceita - fechando quiz')
    
    // Fechar quiz e mostrar central de recargas
    setShowBlurOverlay(false)
  }

  const handleSkipQuiz = () => {
    setShowBlurOverlay(false)
  }

  // Timer do quiz
  useEffect(() => {
    if (quizStep === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [quizStep, timeLeft])

  // Função para aceitar cookies
  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true')
    setShowCookieBanner(false)
  }
  
  // Array de banners para carousel
  const banners = [
    {
      src: "/images/banner.png",
      alt: "Banner 1 - Promoção Especial de Recarga"
    },
    {
      src: "/images/banner1.png",
      alt: "Banner 2 - Ofertas Exclusivas"
    },
    {
      src: "/images/banner2.png",
      alt: "Banner 3 - Recarga Segura e Rápida"
    }
  ]


  // Capturar e salvar parâmetros UTM no sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const paramsToCapture = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'src', 'sck', 'xcod', 'keyword', 'device', 'network', 
      'gad_source', 'gbraid', 'wbraid', 'msclkid'
    ]
    
    // Salvar parâmetros da URL no sessionStorage
    paramsToCapture.forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        sessionStorage.setItem(`utm_${param}`, value)
      }
    })
    
    // Capturar Adspect Click ID
    // Prioridade: gclid (Google Ads) > cid > clickid > click_id
    const adspectCid = urlParams.get('gclid') || 
                       urlParams.get('cid') || 
                       urlParams.get('clickid') || 
                       urlParams.get('click_id')
    if (adspectCid) {
      sessionStorage.setItem('adspect_cid', adspectCid)
    }
    
    // const utmParams = getUtmObject()
  }, [getUtmObject])


  // Debug dos estados do modal
  

  // Carregar timer do localStorage quando usuário loga
  useEffect(() => {
    if (!isLoggedIn) return
    
    const savedTimer = localStorage.getItem('discount_timer')
    if (savedTimer) {
      const { startTime, duration } = JSON.parse(savedTimer)
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, duration - elapsed)
      
      if (remaining > 0) {
        setDiscountTimeLeft(remaining)
        console.log('⏱️ [TIMER] Timer recuperado:', remaining, 'segundos restantes')
      } else {
        localStorage.removeItem('discount_timer')
        setDiscountTimeLeft(0)
      }
    } else {
      // Primeira vez - salvar timer inicial
      const timerData = {
        startTime: Date.now(),
        duration: 15 * 60 // 15 minutos
      }
      localStorage.setItem('discount_timer', JSON.stringify(timerData))
      setDiscountTimeLeft(15 * 60)
      console.log('⏱️ [TIMER] Timer iniciado: 15 minutos')
    }
  }, [isLoggedIn])

  // Timer de desconto de 15 minutos
  useEffect(() => {
    if (!isLoggedIn || discountTimeLeft <= 0) return
    
    const timer = setInterval(() => {
      setDiscountTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          localStorage.removeItem('discount_timer')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isLoggedIn, discountTimeLeft])

  // Rotação automática dos banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % banners.length
      )
    }, 6000) // Troca a cada 4 segundos

    return () => clearInterval(interval)
  }, [banners.length])

  // Função para gerar cupom de desconto
  // const generateCoupon = () => {
  //   const randomDigits = Math.floor(10000000 + Math.random() * 90000000) // 8 dígitos
  //   return `FF${randomDigits}`
  // }

  // Função para copiar texto (compatível com mobile)
  const copyToClipboard = async (text: string) => {
    try {
      // Tentar usar a API moderna primeiro
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCouponCopied(true)
        return
      }
      
      // Fallback para dispositivos móveis/contextos não seguros
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        setCouponCopied(true)
      } else {
        throw new Error('Falha ao copiar')
      }
    } catch {
      // Como último recurso, mostrar um prompt para o usuário copiar manualmente
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      
      if (isMobile) {
        alert(`Copie este código manualmente: ${text}`)
        setCouponCopied(true)
      }
    }
  }

  // Array de banners para o carrossel
  // const bannerImages = [
  //   "/images/checkout-banner.webp",
  //   "/images/checkout-banner.webp", // Duplicando por enquanto
  //   "/images/checkout-banner.webp"  // Você pode substituir por outras imagens
  // ]

  // useEffect removido - usando apenas o carousel principal dos banners

  // Formatar tempo do desconto (15 minutos)
  const formatDiscountTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculatePrice = (diamonds: string): { price: number; bonus: number } => {
    const diamondCount = Number.parseInt(diamonds.replace(".", "").replace(",", "")) // Handle both '.' and ',' as thousand separators

    // Preços específicos por jogo
    if (selectedGame === 'deltaforce') {
      const priceMap: { [key: number]: { price: number; bonus: number } } = {
        60: { price: 5.99, bonus: 0 },
        300: { price: 14.99, bonus: 0 },
        680: { price: 24.99, bonus: 680 },     // COINS EM DOBRO
        1280: { price: 37.99, bonus: 1280 },   // COINS EM DOBRO
        3280: { price: 97.99, bonus: 3280 },   // COINS EM DOBRO
        6480: { price: 189.99, bonus: 6480 },  // COINS EM DOBRO
      }
      return priceMap[diamondCount] || { price: 0, bonus: 0 }
    }

    if (selectedGame === 'haikyu') {
      const priceMap: { [key: number]: { price: number; bonus: number } } = {
        60: { price: 5.99, bonus: 0 },
        300: { price: 14.99, bonus: 0 },
        680: { price: 24.99, bonus: 680 },    // COINS EM DOBRO
        1280: { price: 37.99, bonus: 1280 },  // COINS EM DOBRO
        3280: { price: 97.99, bonus: 3280 },  // COINS EM DOBRO
        6480: { price: 189.99, bonus: 0 },
      }
      return priceMap[diamondCount] || { price: 0, bonus: 0 }
    }

    // Free Fire (padrão)
    const priceMap: { [key: number]: { price: number; bonus: number } } = {
      100: { price: 6.0, bonus: 20 },
      310: { price: 10.99, bonus: 62 },
      520: { price: 14.9, bonus: 104 },
      2180: { price: 36.95, bonus: 2180 },   // DOBRO
      5600: { price: 46.77, bonus: 5600 },   // DOBRO
      15600: { price: 87.8, bonus: 15600 },  // DOBRO
    }

    return priceMap[diamondCount] || { price: 0, bonus: 0 }
  }

  const getSpecialOfferPrice = (offer: string): number => {
    const priceMap: { [key: string]: number } = {
      // Free Fire
      "Poder do Fogo (3 unidades Restantes)": 39.84,
      "Assinatura Semanal": 14.99,
      "Assinatura Mensal": 44.99,
      "Passe Booyah Premium Plus": 56.32,
      "Passe de Nível": 44.99,
      // Delta Force
      "Black Hawk Down - Gênesis": 25.44,
      "Black Hawk Down - Reinvenção": 18.50,
      "Suprimentos de Maré": 13.99,
      "Suprimentos de Maré - Avançado": 12.50,
      // Haikyu
      "Especial de Recrutar Ultra I": 15.99,
      "Especial de Recrutar Ultra II": 25.50,
      "Especial de Recrutar Ultra III": 52.11,
      "Especial de Recrutar Ultra IV": 77.30,
    }
    return priceMap[offer] || 0
  }

  const getSpecialOfferBonus = (offer: string): number => {
    const bonusMap: { [key: string]: number } = {
      // Free Fire - Diamantes
      "Passe Booyah Premium Plus": 5600,
      // Haikyu - Diamantes Estelares
      "Especial de Recrutar Ultra I": 200,
      "Especial de Recrutar Ultra II": 300,
      "Especial de Recrutar Ultra III": 500,
      "Especial de Recrutar Ultra IV": 500,
      // Delta Force - Coins
      "Black Hawk Down - Gênesis": 300,
      "Black Hawk Down - Reinvenção": 300,
      "Suprimentos de Maré": 300,
      "Suprimentos de Maré - Avançado": 300,
    }
    return bonusMap[offer] || 0
  }

  const [userData, setUserData] = useState<any>(null)
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [couponCopied, setCouponCopied] = useState(false)
  const [generatedCoupon, setGeneratedCoupon] = useState("PROMO5OFF")

  // Função para buscar informações do avatar
  const fetchAvatarInfo = async (headPicId: number) => {
    try {
      const response = await fetch(`/api/get-avatar?headPicId=${headPicId}`)
      if (response.ok) {
        const avatarData = await response.json()
        setAvatarInfo(avatarData)
        return avatarData
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!playerId.trim()) {
      setLoginError("Por favor, insira um ID de jogador válido.")
      return
    }

    setIsLoading(true)
    setLoginError("")

    // Login simplificado para Delta Force e Haikyu com loading ilusório
    if (selectedGame === 'deltaforce' || selectedGame === 'haikyu') {
      setShowIllusoryLoading(true)
      
      // Simular loading de 1.5 segundos
      setTimeout(() => {
        setIsLoggedIn(true)
        setUserData(null)
        setLoginError("")
        setIsLoading(false)
        setShowIllusoryLoading(false)
        setShowBlurOverlay(false) // Fecha o modal após login
        
        // Salvar cookie de quiz completado
        const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
        document.cookie = `quiz_completed=true; ${cookieOptions}`
        
        console.log('🍪 [LOGIN] Cookie definido - quiz completado')
      }, 1500)
      return
    }

    // Login normal para Free Fire
    try {
      const apiUrl = `/api/game-data?uid=${playerId}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (response.ok && data.success) {
        if (data.data && data.data.basicInfo && data.data.basicInfo.nickname) {
          if (response.status === 200) {
            setIsLoggedIn(true)
            setUserData(data.data.basicInfo)
            setLoginError("")
            setShowBlurOverlay(false) // Fecha o modal após login
            localStorage.setItem('userData', JSON.stringify(data.data.basicInfo))
            
            if (data.data.basicInfo.headPic) {
              await fetchAvatarInfo(data.data.basicInfo.headPic)
            }
            
            // Salvar cookie de quiz completado
            const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
            document.cookie = `quiz_completed=true; ${cookieOptions}`
            
            console.log('🍪 [LOGIN] Cookie definido - quiz completado')
          }
        } else {
          setIsLoggedIn(false)
          setLoginError("Resposta inválida do servidor. Tente novamente.")
        }
      } else {
        setIsLoggedIn(false)
        const errorMessage = data?.error || "Erro ao verificar ID do jogador. Tente novamente."
        setLoginError(errorMessage)
      }
    } catch (error) {
      setIsLoggedIn(false)
      setLoginError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }


  // Função para salvar lead do usuário
  const saveUserLead = (reason: string) => {
    const leadData = {
      playerId: playerId || "anonymous",
      nickname: userData?.nickname || "unknown",
      timestamp: new Date().toISOString(),
      reason: reason,
      utm: getUtmObject()
    }
    
    // Salvar no localStorage
    const existingLeads = JSON.parse(localStorage.getItem("user_leads") || "[]")
    existingLeads.push(leadData)
    localStorage.setItem("user_leads", JSON.stringify(existingLeads))
    
    // Marcar que o usuário já passou pelo processo
    localStorage.setItem("user_visited", "true")
    
    //console.log("Lead salvo:", leadData)
  }


  // Nova função para lidar com step 3
  // Função para reiniciar (simplificada)
  const restartQuestionnaire = () => {
    setShowLeadMessage(false)
    setTextAnswer("")
    setSelectedValue(null)
  }

  // Função para lidar com login social
  const handleSocialLogin = (platform: string) => {
    //console.log(`Tentativa de login com ${platform}`)
    setShowSocialError(true)
  }

  const handleValueSelect = (value: string) => {
    setSelectedValue(value)
    setSelectedRechargeValue(value)
    // Ir direto para a página de recarga
    setShowPurchasePage(true)
  }

  const handleRechargeValueSelect = (value: string) => {
    setSelectedRechargeValue(value)
    setSelectedSpecialOffer(null)
  }

  const handleSpecialOfferSelect = (offer: string) => {
    setSelectedSpecialOffer(offer)
    // Limpar valor de recarga quando selecionar oferta especial
    setSelectedRechargeValue(null)
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      // Marcar que há uma compra pendente e abrir verificação
      setPendingPurchase(true)
      setShowBlurOverlay(true)
      return
    }

    if (!selectedRechargeValue && !selectedSpecialOffer) {
      alert('Por favor, selecione um valor de recarga ou oferta especial')
      return
    }

    // Obter parâmetros UTM
    const utmParams = getUtmObject()

    if (selectedRechargeValue) {
      const priceData = calculatePrice(selectedRechargeValue!)
      const params = new URLSearchParams({
        type: "recharge",
        value: selectedRechargeValue,
        price: priceData.price.toString(),
        bonus: priceData.bonus.toString(),
        playerId: playerId,
        payment: "PIX",
        app: selectedGame === 'deltaforce' ? '100157' : selectedGame === 'haikyu' ? 'haikyu' : '100067'
      })

      // Adicionar parâmetros UTM individualmente
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      //console.log('[v0] UTM params being passed to checkout:', utmParams)
      //console.log('[v0] Final checkout URL:', `/checkout?${params.toString()}`)
      
      router.push(`/checkout?${params.toString()}`)
    } else if (selectedSpecialOffer) {
      const price = getSpecialOfferPrice(selectedSpecialOffer!)
      const bonus = getSpecialOfferBonus(selectedSpecialOffer!)
      const params = new URLSearchParams({
        type: "special",
        value: selectedSpecialOffer,
        price: price.toString(),
        bonus: bonus.toString(),
        playerId: playerId,
        payment: "PIX",
        app: selectedGame === 'deltaforce' ? '100157' : selectedGame === 'haikyu' ? 'haikyu' : '100067'
      })

      // Adicionar parâmetros UTM individualmente
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      //console.log('[v0] UTM params being passed to checkout:', utmParams)
      //console.log('[v0] Final checkout URL:', `/checkout?${params.toString()}`)

      router.push(`/checkout?${params.toString()}`)
    }
  }

  // Modal de cupom de desconto
  if (showCouponModal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 relative border-4 border-red-500">
          {/* Banner */}
          <div className="relative p-3 pb-0">
            <img
              src="/images/quiznovo.png"
              alt="Banner do jogo"
              className="w-full h-20 object-cover rounded-xl"
            />
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 mb-4 border-2 border-red-200">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-red-500 mb-2">Parabéns! 🎉</h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Você ganhou um <span className="font-bold text-red-500">cupom de 5% de desconto</span> para usar na sua recarga!
                </p>
                
                {/* Cupom */}
                <div className="bg-white border-2 border-dashed border-red-300 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Seu cupom de desconto:</p>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <span className="font-mono text-lg font-bold text-red-500">{generatedCoupon}</span>
                    <button
                      onClick={() => copyToClipboard(generatedCoupon)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        couponCopied 
                          ? "bg-green-500 text-white" 
                          : "bg-red-400 hover:bg-red-500 text-white"
                      }`}
                    >
                      {couponCopied ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Cole este código no checkout para receber 5% de desconto adicional na sua recarga!
                </p>
              </div>

              <button
                onClick={() => {
                  if (couponCopied) {
                    setShowCouponModal(false)
                    setShowPurchasePage(true)
                  }
                }}
                disabled={!couponCopied}
                className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                  couponCopied
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {couponCopied ? "Continuar para Recarga" : "Copie o cupom para continuar"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pb-4">
            <p className="text-center text-sm text-gray-600">© 2025 Central Promocional Games (Jogos Tiro). Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    )
  }

  // Evitar problemas de hidratação - não renderizar até estar montado
  if (!mounted) {
    return null
  }



  // ============================================
  // SEMPRE RENDERIZAR: Central de recargas (com ou sem quiz)
  // ============================================
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Botão de teste Google Ads */}
      <GoogleConversionTest />
      
      {/* ❌ QUIZ MODAL REMOVIDO - Usuário não precisa mais verificar */}
      {/* {showBlurOverlay && (
        <UserVerification
          onVerificationComplete={() => {
            console.log('✅ [QUIZ] Verificação completa - fechando modal')
            setShowBlurOverlay(false)
            
            // Carregar dados do usuário do localStorage
            const storedPlayerId = localStorage.getItem('userPlayerId')
            const storedUserData = localStorage.getItem('user_data')
            
            if (storedPlayerId) {
              setPlayerId(storedPlayerId)
              setIsLoggedIn(true)
              
              if (storedUserData) {
                try {
                  const userData = JSON.parse(storedUserData)
                  setUserData(userData)
                  
                  // Carregar avatar se existir
                  if (userData.headPic) {
                    fetchAvatarInfo(userData.headPic)
                  }
                } catch (error) {
                  console.error('Erro ao parsear user_data:', error)
                }
              }
              
              console.log('✅ [LOGIN] Usuário logado automaticamente após verificação')
            }
            
            // Se havia uma compra pendente, executar agora
            if (pendingPurchase) {
              setPendingPurchase(false)
              // Aguardar um pouco para garantir que o modal fechou
              setTimeout(() => {
                handleBuyNow()
              }, 100)
            }
          }}
        />
      )} */}
      
      {/* CENTRAL DE RECARGAS - Sempre renderizada */}
        
        {/* Modal de Login - Aparece quando showBlurOverlay = true */}
        {showBlurOverlay && (
          <div 
            className="fixed inset-0 z-[9999]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            {/* Fundo escuro com blur */}
            <div 
              className="absolute inset-0 bg-black/60"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            />
            
            {/* Modal de Login - Bottom Sheet (Mobile) / Centralizado (Desktop) */}
            <div className="absolute inset-0 grid overflow-auto justify-items-center items-end md:items-center">
              <div className="w-full max-w-[390px] mx-auto mb-0 md:mb-0">
                <div className="rounded-t-lg bg-white md:rounded-lg md:shadow-2xl">
                  
                  {/* Header com imagem de fundo */}
                  <div className="relative h-[79px] text-white">
                    <div 
                      className="absolute inset-0 rounded-t-lg bg-cover bg-center"
                      style={{
                        backgroundImage: 'url(/images/checkout-banner.webp)'
                      }}
                    />
                    <button 
                      onClick={() => setShowBlurOverlay(false)}
                      className="absolute top-4 right-4 rounded text-2xl bg-black/30 p-2 hover:bg-black/50 transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.83644 6.56341C7.48497 6.21194 6.91512 6.21194 6.56365 6.56341C6.21218 6.91488 6.21218 7.48473 6.56365 7.8362L10.7273 11.9998L6.56366 16.1634C6.21218 16.5149 6.21218 17.0847 6.56366 17.4362C6.91513 17.7877 7.48498 17.7877 7.83645 17.4362L12 13.2726L16.1637 17.4362C16.5151 17.7877 17.085 17.7877 17.4364 17.4362C17.7879 17.0847 17.7879 16.5149 17.4364 16.1634L13.2728 11.9998L17.4364 7.8362C17.7879 7.48473 17.7879 6.91488 17.4364 6.56341C17.085 6.21194 16.5151 6.21194 16.1637 6.56341L12 10.727L7.83644 6.56341Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>

                  {/* Ícone do jogo */}
                  <div className="relative">
                    <img 
                      className="absolute -top-2 left-4 md:left-6 h-14 w-14 rounded-xl bg-white outline outline-4 outline-white" 
                      src="/images/icon.png" 
                      alt="Free Fire"
                    />
                    <div className="ml-24 md:ml-[104px] pr-4 md:pr-6 pt-3" >
                      <div className="mb-2 text-base font-bold text-gray-900">Free Fire</div>
                      <div className="text-sm text-gray-600">Faça login primeiro antes do pagamento.</div>
                    </div>
                  </div>

                  {/* Formulário */}
                  <div className="px-4 py-4 pb-6 md:p-6 md:pb-8">
                    <form className="mb-4" onSubmit={handleLogin}>
                      <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-900">
                        ID do jogador
                        <button type="button" className="rounded-full text-xs text-gray-500 hover:text-gray-700">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M4.8999 5.39848C4.89981 4.44579 5.67209 3.67344 6.62478 3.67344H7.37471C8.33038 3.67344 9.09977 4.45392 9.09971 5.40371C9.09967 6.05546 8.73195 6.65677 8.14619 6.94967L7.57416 7.23571C7.49793 7.27382 7.44978 7.35173 7.44978 7.43695V7.49844C7.44978 7.78839 7.21473 8.02344 6.92478 8.02344C6.63483 8.02344 6.39978 7.78839 6.39978 7.49844V7.43695C6.39978 6.95403 6.67262 6.51255 7.10456 6.29657L7.6766 6.01053C7.90385 5.8969 8.0497 5.66087 8.04971 5.40365C8.04973 5.0279 7.74459 4.72344 7.37471 4.72344H6.62478C6.25203 4.72344 5.94987 5.02563 5.9499 5.39838C5.94993 5.68833 5.7149 5.9234 5.42495 5.92343C5.135 5.92346 4.89993 5.68843 4.8999 5.39848Z" fill="currentColor"/>
                            <path d="M6.9999 10.1484C7.3865 10.1484 7.6999 9.83504 7.6999 9.44844C7.6999 9.06184 7.3865 8.74844 6.9999 8.74844C6.6133 8.74844 6.2999 9.06184 6.2999 9.44844C6.2999 9.83504 6.6133 10.1484 6.9999 10.1484Z" fill="currentColor"/>
                          </svg>
                        </button>
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          className="w-full bg-gray-100 px-3 py-2.5 rounded-l-md border border-gray-200 border-r-0 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Insira o ID de jogador aqui"
                          value={playerId}
                          onChange={(e) => setPlayerId(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="shrink-0 rounded-r-md bg-[#D81A0D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#C01808] transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Carregando...' : 'Login'}
                        </button>
                      </div>
                      {loginError && (
                        <p className="mt-2 text-xs text-red-600">{loginError}</p>
                      )}
                    </form>

                    {/* Divisor */}
                    <div className="mb-4 flex items-center gap-2 text-center text-xs text-gray-500 before:h-px before:grow before:bg-gray-200 after:h-px after:grow after:bg-gray-200">
                      Ou entre com sua conta de jogo
                    </div>

                    {/* Botões de login social */}
                    <div className="flex flex-wrap justify-center gap-8">
                      <button 
                        onClick={() => setShowSocialError(true)}
                        className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-70 bg-[#006AFC]"
                      >
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => setShowSocialError(true)}
                        className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-70 outline outline-1 outline-gray-200 bg-white"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => setShowSocialError(true)}
                        className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-70 outline outline-1 outline-gray-200 bg-white"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => setShowSocialError(true)}
                        className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-70 bg-[#0077FF]"
                      >
                        <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.706-1.033-1.01-1.49-1.146-1.744-1.146-.356 0-.458.102-.458.597v1.554c0 .42-.135.675-1.25.675-1.845 0-3.891-1.117-5.331-3.194-2.153-3.046-2.741-5.328-2.741-5.795 0-.254.102-.491.597-.491h1.744c.458 0 .623.203.796.677.863 2.49 2.301 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.169.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.78-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header Fixo */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white safe-area-top">
          <div 
            className="mx-auto w-full max-w-[1366px] px-3 py-3 sm:py-4"
            style={isDesktop ? {
              paddingLeft: '9rem',
              paddingRight: '11rem'
            } : {}}
          >
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600 text-white font-bold rounded-full">G</div>
              </div>
             
              <div className="flex items-center gap-2">
                
                {isLoggedIn ? (
                  <div><h1 className="text-xs font-medium text-gray-800 max-md:max-w-24 md:text-base/5">Centro de</h1><p className="text-xs font-medium text-gray-800 max-md:max-w-25 md:text-base/5">Recarga Free Fire</p></div>
                ) : (
                  <div><h1 className="text-xs font-medium text-gray-800 max-md:max-w-24 md:text-base/5">Eventos e Promoções</h1><p className="text-xs font-medium text-gray-800 max-md:max-w-25 md:text-base/5">Free Brasil Fire</p></div>
                )}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10">
              <img
                src={currentConfig.userIcon}
                alt={`${currentConfig.name} Icon`}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal com padding para header e footer */}
        <div className="flex-1 pt-20 pb-32 overflow-y-auto">

        {/* Hero Banner Carousel */}
        <div>
          <div className="mx-auto w-full md:max-w-[1366px] md:px-8 lg:px-10">
            <div className="relative overflow-hidden md:rounded-xl">
              <img
                src={banners[currentBannerIndex].src}
                alt={banners[currentBannerIndex].alt}
                className="w-full h-auto transition-opacity duration-500"
              />
              {/* Indicadores do carousel */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentBannerIndex 
                        ? 'bg-white/70' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Ir para banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background decorativo abaixo do carousel */}
        <div className="relative bg-[#ECECEC]">
          <div className="absolute inset-0 bg-[#ECECEC] rtl:-scale-x-100 dark:bg-[linear-gradient(180deg,#16162B_0%,#242443_76.1%,#333356_100%)]" role="none">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:opacity-[0.06] md:bg-contain" role="none" style={{ backgroundImage: 'url("/images/abaixodobannercarousel.png")' }}></div>
          </div>
          <div className="pointer-events-none absolute inset-0 flex rtl:-scale-x-100 rtl:flex-row-reverse" role="none">
            <div className="h-[7px] flex-1 bg-[#F2B13E] dark:bg-[#2D337D]/50" role="none"></div>
            <svg width="390" height="27" viewBox="0 0 390 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[27px] dark:hidden md:hidden" preserveAspectRatio="xMidYMin" role="none">
              <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint0_linear_2330_34259)" role="none"></path>
              <mask id="mask0_2330_34259" maskUnits="userSpaceOnUse" x="0" y="0" width="390" height="27" role="none" style={{ maskType: 'alpha' }}>
                <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint1_linear_2330_34259)" role="none"></path>
              </mask>
              <g mask="url(#mask0_2330_34259)" role="none">
                <rect x="-15.0254" y="72.4863" width="110.997" height="3" transform="rotate(-45 -15.0254 72.4863)" fill="url(#paint2_linear_2330_34259)" role="none"></rect>
                <rect opacity="0.5" x="232.053" y="58.1582" width="110.997" height="25.9753" transform="rotate(-47 232.053 58.1582)" fill="url(#paint3_linear_2330_34259)" role="none"></rect>
                <rect opacity="0.3" x="298.977" y="69.4863" width="110.997" height="6.3044" transform="rotate(-45 298.977 69.4863)" fill="url(#paint4_linear_2330_34259)" role="none"></rect>
                <path opacity="0.5" d="M192.334 72.0098L268.034 -9.16811L278.223 -7.40131L202.523 73.7766L192.334 72.0098Z" fill="url(#paint5_linear_2330_34259)" role="none"></path>
                <rect opacity="0.15" x="-21" y="123.275" width="179.995" height="4.38032" transform="rotate(-45 -21 123.275)" fill="url(#paint6_linear_2330_34259)" role="none"></rect>
              </g>
              <defs role="none">
                <linearGradient id="paint0_linear_2330_34259" x1="-9" y1="7.61906" x2="387.828" y2="41.0361" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F2B13E" role="none"></stop>
                  <stop offset="1" stopColor="#FDD373" stopOpacity="0.63" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear_2330_34259" x1="27" y1="15.2381" x2="388.472" y2="38.7377" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F3A00C" role="none"></stop>
                  <stop offset="1" stopColor="#FFBB21" stopOpacity="0.76" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint2_linear_2330_34259" x1="9.0067" y1="75.3242" x2="64.1695" y2="74.4301" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DB910B" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F09F0B" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint3_linear_2330_34259" x1="295.701" y1="78.6918" x2="318.228" y2="69.5067" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint4_linear_2330_34259" x1="323.009" y1="75.4501" x2="378.183" y2="75.0245" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint5_linear_2330_34259" x1="218.794" y1="56.0898" x2="255.761" y2="15.1365" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint6_linear_2330_34259" x1="17.9709" y1="127.419" x2="83.65" y2="126.721" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F79F00" role="none"></stop>
                  <stop offset="1" stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                </linearGradient>
              </defs>
            </svg>
            <svg width="1024" height="27" viewBox="0 0 1024 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="hidden h-[27px] md:block dark:md:hidden" preserveAspectRatio="xMidYMin" role="none">
              <path d="M1024 0H0V7H516L532 27H1024V0Z" fill="url(#paint0_linear_2339_34301)" role="none"></path>
              <mask id="mask0_2339_34301" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="27" role="none" style={{ maskType: 'alpha' }}>
                <path d="M1024 0H0V7H516L532 27H1024V0Z" fill="url(#paint1_linear_2339_34301)" role="none"></path>
              </mask>
              <g mask="url(#mask0_2339_34301)" role="none">
                <rect x="215.977" y="72.4844" width="110.997" height="3" transform="rotate(-45 215.977 72.4844)" fill="url(#paint2_linear_2339_34301)" role="none"></rect>
                <rect opacity="0.5" x="463.055" y="58.1562" width="110.997" height="25.9753" transform="rotate(-47 463.055 58.1562)" fill="url(#paint3_linear_2339_34301)" role="none"></rect>
                <rect opacity="0.5" x="561.977" y="69.4844" width="110.997" height="3" transform="rotate(-45 561.977 69.4844)" fill="url(#paint4_linear_2339_34301)" role="none"></rect>
                <path opacity="0.5" d="M423.336 72.0078L499.036 -9.17006L509.225 -7.40327L433.525 73.7746L423.336 72.0078Z" fill="url(#paint5_linear_2339_34301)" role="none"></path>
                <rect opacity="0.15" x="210" y="123.273" width="179.995" height="4.38032" transform="rotate(-45 210 123.273)" fill="url(#paint6_linear_2339_34301)" role="none"></rect>
              </g>
              <defs role="none">
                <linearGradient id="paint0_linear_2339_34301" x1="222" y1="7.61902" x2="618.827" y2="41.0361" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F2B13E" role="none"></stop>
                  <stop offset="1" stopColor="#FDD373" stopOpacity="0.63" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint1_linear_2339_34301" x1="258.001" y1="15.2381" x2="619.473" y2="38.7377" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F3A00C" role="none"></stop>
                  <stop offset="1" stopColor="#FFBB21" stopOpacity="0.76" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint2_linear_2339_34301" x1="240.009" y1="75.3223" x2="295.171" y2="74.4282" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DB910B" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F09F0B" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint3_linear_2339_34301" x1="526.703" y1="78.6898" x2="549.23" y2="69.5047" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint4_linear_2339_34301" x1="586.009" y1="72.3223" x2="641.171" y2="71.4282" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint5_linear_2339_34301" x1="449.796" y1="56.0878" x2="486.763" y2="15.1345" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  <stop offset="1" stopColor="#F79F00" role="none"></stop>
                </linearGradient>
                <linearGradient id="paint6_linear_2339_34301" x1="248.971" y1="127.417" x2="314.65" y2="126.719" gradientUnits="userSpaceOnUse" role="none">
                  <stop stopColor="#F79F00" role="none"></stop>
                  <stop offset="1" stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="h-[27px] flex-1 bg-[#FDD373]/[0.63] dark:bg-[#3C3E65]/50" role="none"></div>
          </div>
          <div className="bg-white">
            <div className="rounded-t-[14px] bg-white lg:rounded-none"></div>
          </div>
        </div>

        {/* Game Selection Section */}
        <div className="bg-[#EFEFEF] dark:bg-[#333356]">
          <div className="relative w-full">
            <div className="absolute inset-0 bg-[#EFEFEF] rtl:-scale-x-100 dark:bg-[linear-gradient(180deg,#16162B_0%,#242443_76.1%,#333356_100%)]" role="none">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:opacity-[0.06] md:bg-contain" 
                role="none"
                style={{ backgroundImage: 'url("/images/pattern-game-selection-59889447.png")' }}
              ></div>
            </div>
            <div className="pointer-events-none absolute inset-0 flex rtl:-scale-x-100 rtl:flex-row-reverse" role="none">
              <div className="h-[7px] flex-1 bg-[#F2B13E] dark:bg-[#2D337D]/50" role="none"></div>
              <svg width="390" height="27" viewBox="0 0 390 27" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[27px] dark:hidden md:hidden" preserveAspectRatio="xMidYMin" role="none">
                <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint0_linear_2330_34259)" role="none"></path>
                <mask id="mask0_2330_34259" maskUnits="userSpaceOnUse" x="0" y="0" width="390" height="27" role="none">
                  <path d="M390 0H0V7H285L301 27H390V0Z" fill="url(#paint1_linear_2330_34259)" role="none"></path>
                </mask>
                <g mask="url(#mask0_2330_34259)" role="none">
                  <rect x="-15.0254" y="72.4863" width="110.997" height="3" transform="rotate(-45 -15.0254 72.4863)" fill="url(#paint2_linear_2330_34259)" role="none"></rect>
                  <rect opacity="0.5" x="232.053" y="58.1582" width="110.997" height="25.9753" transform="rotate(-47 232.053 58.1582)" fill="url(#paint3_linear_2330_34259)" role="none"></rect>
                  <rect opacity="0.3" x="298.977" y="69.4863" width="110.997" height="6.3044" transform="rotate(-45 298.977 69.4863)" fill="url(#paint4_linear_2330_34259)" role="none"></rect>
                  <path opacity="0.5" d="M192.334 72.0098L268.034 -9.16811L278.223 -7.40131L202.523 73.7766L192.334 72.0098Z" fill="url(#paint5_linear_2330_34259)" role="none"></path>
                  <rect opacity="0.15" x="-21" y="123.275" width="179.995" height="4.38032" transform="rotate(-45 -21 123.275)" fill="url(#paint6_linear_2330_34259)" role="none"></rect>
                </g>
                <defs role="none">
                  <linearGradient id="paint0_linear_2330_34259" x1="-9" y1="7.61906" x2="387.828" y2="41.0361" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#F2B13E" role="none"></stop>
                    <stop offset="1" stopColor="#FDD373" stopOpacity="0.63" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint1_linear_2330_34259" x1="27" y1="15.2381" x2="388.472" y2="38.7377" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#F3A00C" role="none"></stop>
                    <stop offset="1" stopColor="#FFBB21" stopOpacity="0.76" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint2_linear_2330_34259" x1="9.0067" y1="75.3242" x2="64.1695" y2="74.4301" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DB910B" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F09F0B" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint3_linear_2330_34259" x1="295.701" y1="78.6918" x2="318.228" y2="69.5067" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F79F00" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint4_linear_2330_34259" x1="323.009" y1="75.4501" x2="378.183" y2="75.0245" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F79F00" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint5_linear_2330_34259" x1="218.794" y1="56.0898" x2="255.761" y2="15.1365" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                    <stop offset="1" stopColor="#F79F00" role="none"></stop>
                  </linearGradient>
                  <linearGradient id="paint6_linear_2330_34259" x1="17.9709" y1="127.419" x2="83.65" y2="126.721" gradientUnits="userSpaceOnUse" role="none">
                    <stop stopColor="#F79F00" role="none"></stop>
                    <stop offset="1" stopColor="#DE9611" stopOpacity="0" role="none"></stop>
                  </linearGradient>
                </defs>
              </svg>
              <div className="h-[1px] w-full bg-[#3C3E65]/30" role="none"></div>
            </div>
            
            {/* Conteúdo da Seleção de Jogos */}
            <div className="relative mx-auto flex max-w-5xl flex-col px-[22px] pb-8 pt-5 md:px-8 md:pb-8 md:pt-[27px]" role="none">
              <h2 className="relative -ms-1.5 mb-4 text-lg/none font-bold text-white md:mb-5 md:ms-0 md:text-xl/none" role="none">
                Seleção de jogos
              </h2>
              <div className="grid grid-cols-4 gap-x-[22px] gap-y-4 sm:grid-cols-6 lg:grid-cols-8" role="none">
            <div
              className="cursor-pointer outline-none group"
              role="radio"
              aria-checked={selectedGame === 'freefire'}
              data-state={selectedGame === 'freefire' ? 'checked' : 'unchecked'}
              tabIndex={0}
              onClick={() => {
                setSelectedGame('freefire')
                setIsLoggedIn(false)
                setPlayerId("")
                setUserData(null)
                navigateToGame('100067')
              }}
            >
              <div className="mx-auto max-w-[70px] sm:max-w-[80px] md:max-w-[115px]">
                <div className="mb-1 px-[2px] sm:px-[3px] md:mb-2 md:px-2">
                  <div className="relative">
                    <div className={`relative overflow-hidden rounded-[25%] border-[3px] sm:border-4 md:border-[6px] transition-colors ${
                      selectedGame === 'freefire' ? 'border-[rgb(216,26,13)]' : 'border-[#3C3E65]'
                    }`}>
                      <div className="relative pt-[100%]">
                        <img
                          alt="Free Fire"
                          data-ai-hint="game icon"
                          loading="lazy"
                          decoding="async"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white object-cover"
                          sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 105px"
                          src="/images/icon.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-center text-[11px] sm:text-sm md:text-base ${
                  selectedGame === 'freefire' ? 'font-bold text-[#D81A0D]' : 'font-medium text-gray-700'
                }`}>Free Fire</div>
              </div>
            </div>

            <div
              className="cursor-pointer outline-none group"
              role="radio"
              aria-checked={selectedGame === 'deltaforce'}
              data-state={selectedGame === 'deltaforce' ? 'checked' : 'unchecked'}
              tabIndex={0}
              onClick={() => {
                setSelectedGame('deltaforce')
                setIsLoggedIn(false)
                setPlayerId("")
                setUserData(null)
                navigateToGame('100157')
              }}
            >
              <div className="mx-auto max-w-[70px] sm:max-w-[80px] md:max-w-[115px]">
                <div className="mb-1 px-[2px] sm:px-[3px] md:mb-2 md:px-2">
                  <div className="relative">
                    <div className={`relative overflow-hidden rounded-[25%] border-[3px] sm:border-4 md:border-[5px] transition-colors ${
                      selectedGame === 'deltaforce' ? 'border-[rgb(216,26,13)]' : 'border-[#3C3E65]'
                    }`}>
                      <div className="relative pt-[100%]">
                        <img
                          alt="Delta Force"
                          data-ai-hint="game icon"
                          loading="lazy"
                          decoding="async"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white object-cover"
                          sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 105px"
                          src="/images/delta-force-icon.webp"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-center text-[11px] sm:text-sm md:text-base ${
                  selectedGame === 'deltaforce' ? 'font-bold text-[#D81A0D]' : 'font-medium text-gray-700'
                }`}>
                  Delta Force
                </div>
              </div>
            </div>

            <div
              className="cursor-pointer outline-none group"
              role="radio"
              aria-checked={selectedGame === 'haikyu'}
              data-state={selectedGame === 'haikyu' ? 'checked' : 'unchecked'}
              tabIndex={0}
              onClick={() => {
                setSelectedGame('haikyu')
                setIsLoggedIn(false)
                setPlayerId("")
                setUserData(null)
                navigateToGame('100153')
              }}
            >
              <div className="mx-auto max-w-[70px] sm:max-w-[80px] md:max-w-[115px]">
                <div className="mb-1 px-[2px] sm:px-[3px] md:mb-2 md:px-2">
                  <div className="relative">
                    <div className={`relative overflow-hidden rounded-[25%] border-[3px] sm:border-4 md:border-[5px] transition-colors ${
                      selectedGame === 'haikyu' ? 'border-[rgb(216,26,13)]' : 'border-[#3C3E65]'
                    }`}>
                      <div className="relative pt-[100%]">
                        <img
                          alt="HAIKYU!! FLY HIGH"
                          data-ai-hint="game icon"
                          loading="lazy"
                          decoding="async"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white object-cover"
                          sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 105px"
                          src="/images/HAIKIU FLY HIGH.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-center text-[11px] sm:text-sm md:text-base whitespace-pre-line ${
                  selectedGame === 'haikyu' ? 'font-bold text-[#D81A0D]' : 'font-medium text-gray-700'
                }`}>
                  {"HAIKYU!!\nFLY HIGH"}
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção com Background Escuro */}
        <div className="bg-[#1B1B25]">
        
        {/* Banner Fixo */}
        <div className="relative mx-auto max-w-5xl px-0 sm:px-0 md:px-8 pb-4 sm:pb-6 -mt-4">
            <div className="relative flex items-center overflow-hidden transition-all border-[7px] border-[#1B1B25] border-b-0 rounded-t-2xl" id="app-banner">
              <div 
                className="absolute h-full w-full bg-[#BDBDC5] bg-cover bg-center rounded-t-2xl rtl:-scale-x-100" 
                style={{ backgroundImage: `url("${currentConfig.banner}")` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent rounded-t-2xl" style={{ height: '30%' }}></div>
            <div className="relative flex items-center p-4 lg:p-6">
              <img 
                alt={`${currentConfig.name} Icon`}
                data-ai-hint="game icon" 
                loading="lazy" 
                width="72" 
                height="72" 
                decoding="async" 
                data-nimg="1" 
                className="h-11 w-11 lg:h-[72px] lg:w-[72px]" 
                src={currentConfig.icon}
                style={{ color: "transparent" }}
              />
              <div className="ms-3 flex flex-col items-start lg:ms-5">
                <div className="mb-1 text-base/none font-bold text-white lg:text-2xl/none">{currentConfig.name}</div>
                <div className="flex items-center rounded border border-white/50 bg-black/[0.65] px-1.5 py-[5px] text-xs/none font-medium text-white lg:text-sm/none">
                  <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-1">
                    <path d="M54.125 34.1211C55.2966 32.9495 55.2966 31.05 54.125 29.8784C52.9534 28.7069 51.0539 28.7069 49.8823 29.8784L38.0037 41.7571L32.125 35.8784C30.9534 34.7069 29.0539 34.7069 27.8823 35.8784C26.7108 37.05 26.7108 38.9495 27.8823 40.1211L35.8823 48.1211C37.0539 49.2926 38.9534 49.2926 40.125 48.1211L54.125 34.1211Z" fill="currentColor"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M43.4187 3.4715C41.2965 2.28554 38.711 2.28554 36.5889 3.4715L8.07673 19.4055C6.19794 20.4555 4.97252 22.4636 5.02506 24.7075C5.36979 39.43 10.1986 63.724 37.0183 76.9041C38.8951 77.8264 41.1125 77.8264 42.9893 76.9041C69.809 63.724 74.6377 39.43 74.9825 24.7075C75.035 22.4636 73.8096 20.4555 71.9308 19.4055L43.4187 3.4715ZM39.5159 8.7091C39.8191 8.53968 40.1885 8.53968 40.4916 8.7091L68.9826 24.6313C68.6493 38.3453 64.2154 59.7875 40.343 71.5192C40.135 71.6214 39.8725 71.6214 39.6646 71.5192C15.7921 59.7875 11.3583 38.3453 11.025 24.6313L39.5159 8.7091Z" fill="currentColor"></path>
                  </svg> Pagamento 100% Seguro
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div id="login-section" className="group md:max-w-[464px]">
            <div className="mb-2 sm:mb-3 flex items-center justify-between text-lg sm:text-xl text-white md:text-2xl">
              <div className="flex items-center gap-2">
                <div className="grid items-center">
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`col-start-1 row-start-1 text-xl sm:text-2xl ${isLoggedIn ? "text-red-500" : "text-destructive"}`}
                  >
                    <path
                      d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V15.7574C24 16.553 23.6839 17.3161 23.1213 17.8787L17.8787 23.1213C17.3161 23.6839 16.553 24 15.7574 24H3C1.34315 24 0 22.6569 0 21V3Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  <div className="col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white">
                    {isLoggedIn ? "✓" : "1"}
                  </div>
                </div>
                <span className="font-bold ">Login</span>

              </div>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    // Limpar todos os dados do usuário do localStorage
                    localStorage.removeItem('userData')
                    localStorage.removeItem('user_authenticated')
                    localStorage.removeItem('user_data')
                    localStorage.removeItem('verificationData')
                    localStorage.removeItem('userVerified')
                    localStorage.removeItem('userPlayerId')
                    localStorage.removeItem('verificationExpiry')
                    localStorage.removeItem('terms_accepted')
                    localStorage.removeItem('terms_accepted_at')
                    
                    // Limpar estados
                    setIsLoggedIn(false)
                    setUserData(null)
                    setAvatarInfo(null)
                    setPlayerId("")
                    
                    // Mostrar modal de login novamente
                    setShowBlurOverlay(true)
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                  <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M53.048 11.8069C51.8367 10.6764 49.9383 10.7418 48.8078 11.953C47.6773 13.1643 47.7428 15.0626 48.954 16.1932L58.3898 25H14.0007C12.3439 25 11.0007 26.3432 11.0007 28C11.0007 29.6569 12.3439 31 14.0007 31H66.0007C67.233 31 68.3399 30.2465 68.7917 29.1001C69.2436 27.9538 68.9485 26.6476 68.0477 25.8069L53.048 11.8069ZM26.9539 68.1932C28.1652 69.3237 30.0636 69.2582 31.1941 68.0469C32.3245 66.8356 32.259 64.9373 31.0477 63.8068L21.6114 55H66.0001C67.657 55 69.0001 53.6569 69.0001 52C69.0001 50.3432 67.657 49 66.0001 49H14.0001C12.7679 49 11.6609 49.7535 11.2091 50.8999C10.7572 52.0464 11.0524 53.3525 11.9532 54.1932L26.9539 68.1932Z" fill="currentColor"></path>
                  </svg>
                  Sair
                </button>
              )}
            </div>
            <div
              className="relative p-4 rounded-md transition-all bg-[#272731] outline outline-1 -outline-offset-1 outline-line dark:outline-none"
            >
              {isLoggedIn && (
                <div className="mb-3 sm:mb-4">
                  <div className="relative flex items-center rounded-md p-3">
                    <div className="me-3 h-9 w-9 shrink-0 overflow-hidden rounded-full">
                      <img 
                        alt={`${currentConfig.name} Icon`}
                        data-ai-hint="game icon" 
                        loading="lazy" 
                        width="36" 
                        height="36" 
                        decoding="async" 
                        data-nimg="1" 
                        className="block h-full w-full object-cover" 
                        src={avatarInfo?.imageUrl || currentConfig.icon}
                        style={{ color: "transparent" }}
                      />
                    </div>
                    <div className="flex-1 text-sm/none text-white">
                      {userData && userData.nickname ? (
                        <div>
                          <div className="font-medium">Usuário: {userData.nickname}</div>
                          <div className="text-xs text-white/70 mt-1">ID do jogador: {userData.accountId || playerId}</div>
                        </div>
                      ) : (
                        <div>ID do jogador: {playerId}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isLoggedIn && (
                <form className="mb-3 sm:mb-4" onSubmit={handleLogin}>
                  <label
                    className="mb-2 flex items-center gap-1 text-[15px]/4 font-medium text-text-title"
                    htmlFor="player-id"
                  >
                    ID do jogador
                    <button
                      type="button"
                      onClick={() => setShowTutorialModal(true)}
                      className="rounded-full text-sm outline-current transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                    >
                      <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_489_1601)">
                          <path
                            d="M4.8999 5.39848C4.89981 4.44579 5.67209 3.67344 6.62478 3.67344H7.37471C8.33038 3.67344 9.09977 4.45392 9.09971 5.40371C9.09967 6.05546 8.73195 6.65677 8.14619 6.94967L7.57416 7.23571C7.49793 7.27382 7.44978 7.35173 7.44978 7.43695V7.49844C7.44978 7.78839 7.21473 8.02344 6.92478 8.02344C6.63483 8.02344 6.39978 7.78839 6.39978 7.49844V7.43695C6.39978 6.95403 6.67262 6.51255 7.10456 6.29657L7.6766 6.01053C7.90385 5.8969 8.0497 5.66087 8.04971 5.40365C8.04973 5.0279 7.74459 4.72344 7.37471 4.72344H6.62478C6.25203 4.72344 5.94987 5.02563 5.9499 5.39838C5.94993 5.68833 5.7149 5.9234 5.42495 5.92343C5.135 5.92346 4.89993 5.68843 4.8999 5.39848Z"
                            fill="currentColor"
                          ></path>
                          <path
                            d="M6.9999 10.1484C7.3865 10.1484 7.6999 9.83504 7.6999 9.44844C7.6999 9.06184 7.3865 8.74844 6.9999 8.74844C6.6133 8.74844 6.2999 9.06184 6.2999 9.44844C6.2999 9.83504 6.6133 10.1484 6.9999 10.1484Z"
                            fill="currentColor"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.524902 6.99844C0.524902 3.42239 3.42386 0.523438 6.9999 0.523438C10.5759 0.523438 13.4749 3.42239 13.4749 6.99844C13.4749 10.5745 10.5759 13.4734 6.9999 13.4734C3.42386 13.4734 0.524902 10.5745 0.524902 6.99844ZM6.9999 1.57344C4.00376 1.57344 1.5749 4.00229 1.5749 6.99844C1.5749 9.99458 4.00376 12.4234 6.9999 12.4234C9.99605 12.4234 12.4249 9.99458 12.4249 6.99844C12.4249 4.00229 9.99605 1.57344 6.9999 1.57344Z"
                            fill="currentColor"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="clip0_489_1601">
                            <rect width="14" height="14" fill="currentColor"></rect>
                          </clipPath>
                        </defs>
                      </svg>
                    </button>
                  </label>
                  <div className="flex">
                    <input
                      className="form-input w-full bg-[#353542] px-4 ltr:rounded-r-none ltr:border-r-0 rtl:rounded-l-none rtl:border-l-0"
                      id="player-id"
                      name="player-id"
                      placeholder="Insira o ID de jogador aqui"
                      type="text"
                      autoComplete="off"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                    />
                    <button
                      className="shrink-0 rounded-md bg-primary-red px-5 py-[15px] text-sm/none font-bold text-white transition-colors hover:bg-primary-red-hover focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:grayscale rounded-s-none"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Carregando..." : "Login"}
                    </button>
                  </div>
                </form>
              )}

              {/* Div de erro de login */}
              {loginError && (
                <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-300 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 18L18 6M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-red-800 font-medium text-xs sm:text-sm">{loginError}</p>
                  </div>
                </div>
              )}

              {/* Botões de login social */}
              {!isLoggedIn && (
                <div className="flex items-center gap-4 text-xs text-gray-500 md:text-sm">
                  <span className="me-auto">Ou entre com sua conta de jogo</span>
                  <button 
                    onClick={() => handleSocialLogin("Facebook")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 bg-[#006AFC]"
                  >
                    <img 
                      src="/images/fb.svg" 
                      alt="Facebook logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5 brightness-0 invert"
                    />
                  </button>
                  <button 
                    onClick={() => handleSocialLogin("Google")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 border border-gray-200"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <img 
                      src="/images/gg.svg" 
                      alt="Google logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5"
                    />
                  </button>
                  <button 
                    onClick={() => handleSocialLogin("Twitter")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 border border-gray-200"
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <img 
                      src="/images/ic-twitter-92527e61.svg" 
                      alt="Twitter logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5"
                    />
                  </button>
                  <button 
                    onClick={() => handleSocialLogin("VK")}
                    className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-70 bg-[#0077FF]"
                  >
                    <img 
                      src="/images/ic-vk-abadf989.svg" 
                      alt="VK logo" 
                      width="20" 
                      height="20"
                      className="h-5 w-5 brightness-0 invert"
                    />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Valor de Recarga Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-lg sm:text-xl text-white md:text-2xl">
            <div className="grid items-center">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="col-start-1 row-start-1 text-xl sm:text-2xl text-destructive"
              >
                <path
                  d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V15.7574C24 16.553 23.6839 17.3161 23.1213 17.8787L17.8787 23.1213C17.3161 23.6839 16.553 24 15.7574 24H3C1.34315 24 0 22.6569 0 21V3Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div className="col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white">2</div>
            </div>
            <span className="font-bold">Valor de Recarga</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 sm:grid-cols-4 md:grid-cols-6 md:gap-4">
            {currentConfig.rechargeValues.map((value) => {
              const isPromotional = currentConfig.promotionalValues.includes(value)
              const isDisabled = (selectedGame === 'freefire' && !isPromotional) || 
                                 (selectedGame === 'deltaforce' && !isPromotional) ||
                                 (selectedGame === 'haikyu' && !isPromotional)
              const hasDoubleCoins = (selectedGame === 'deltaforce' || selectedGame === 'haikyu') && isPromotional
              
              // Não renderizar cards desabilitados
              if (isDisabled) return null
              
              return (
                <div
                  key={value}
                  role="radio"
                  aria-checked={selectedRechargeValue === value}
                  tabIndex={0}
                  className={`group relative flex flex-col min-h-[60px] sm:min-h-[70px] overflow-hidden rounded-md p-0 sm:min-h-[80px] md:min-h-[90px] outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring ${
                    selectedRechargeValue === value
                      ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)] bg-[#353542] cursor-pointer"
                      : "bg-[#353542] border border-[#3C3E65] cursor-pointer hover:border-[#E4372E]/50"
                  }`}
                  onClick={() => handleRechargeValueSelect(value)}
                >
                  {/* Badge de Promoção - Coins em Dobro para Delta Force */}
                  {hasDoubleCoins && (
                    <div className="absolute top-0 right-0 left-0 bg-destructive text-white text-[11px] sm:text-xs font-bold px-1.5 py-0.5 text-center">
                      COINS EM DOBRO
                    </div>
                  )}
                  
                  {/* Badge HOT DOUBLE - para todos os diamantes do Free Fire */}
                  {selectedGame === 'freefire' && (
                    <div className="absolute top-0.5 right-0.5 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[7px] sm:text-[8px] font-bold px-1 py-0.5 rounded shadow-sm">
                      HOT DOUBLE
                    </div>
                  )}
                  
                  <div className={`flex flex-1 items-center justify-center p-1 ${hasDoubleCoins ? 'pt-4' : ''}`}>
                    <img
                      alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                      data-ai-hint="coin"
                      loading="lazy"
                      width="16"
                      height="16"
                      decoding="async"
                      data-nimg="1"
                      className="coin-icon"
                      src={currentConfig.coinIcon}
                      style={{ color: "transparent" }}
                    />
                    <span className="coin-value-text text-white">
                      {value}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ofertas especiais Section */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-medium text-white">Ofertas especiais</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-4 md:gap-4">
            {currentConfig.specialOffers.map((offer) => (
              <div
                key={offer.id}
                className="relative"
              >
                <div
                  role="radio"
                  aria-checked={selectedSpecialOffer === offer.name}
                  tabIndex={0}
                  className={`group peer relative flex h-full cursor-pointer flex-col items-center rounded-md overflow-hidden transition-all focus-visible:ring-2 focus-visible:ring-ring bg-[#353542] ${
                    selectedSpecialOffer === offer.name 
                      ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)]" 
                      : "border border-[#3C3E65]"
                  }`}
                  onClick={() => handleSpecialOfferSelect(offer.name)}
                >
                  <div className="relative mb-1.5 sm:mb-2 w-full pt-[56.25%]">
                    <div className="absolute inset-0 p-1">
                      <img
                        alt={offer.name}
                        data-ai-hint="game offer"
                        loading="lazy"
                        decoding="async"
                        className={`pointer-events-none h-full w-full rounded-sm ${
                          offer.image.includes('firepower')
                            ? 'object-contain scale-75'
                            : 'object-cover'
                        }`}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        src={offer.image}
                      />
                    </div>
                    {/* Badge Hot - para Passe de Nível, Assinatura Mensal, Passe Booyah Premium Plus e Poder do Fogo */}
                    {(offer.name === 'Passe de Nível' || offer.name === 'Assinatura Mensal' || offer.name === 'Passe Booyah Premium Plus' || offer.name.includes('Poder do Fogo')) && (
                      <div className="absolute top-2 right-2 bg-primary-red text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded">
                        Hot
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1 px-1.5 pb-1">
                    <div className="flex items-center justify-center gap-1">
                      {/* Tratamento especial para Poder do Fogo */}
                      {offer.name.includes('Poder do Fogo') ? (
                        <div className="text-center">
                          <div className="text-sm sm:text-base leading-[20px] font-medium text-white">
                            Poder do Fogo
                          </div>
                          <div className="text-[10px] text-white/60 mt-0.5">
                            (3 unidades Restantes)
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-sm sm:text-base leading-[20px] font-medium text-white line-clamp-2">
                          {offer.name}
                        </div>
                      )}
                      {(selectedGame === 'haikyu' || selectedGame === 'freefire' || selectedGame === 'deltaforce') && offer.description && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOfferInfo({
                              name: offer.name,
                              image: offer.image,
                              description: offer.description
                            })
                            setShowOfferInfoModal(true)
                          }}
                          className="shrink-0 flex cursor-pointer relative"
                        >
                          <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-sm text-white/70 hover:text-white transition-colors">
                            <path d="M44 26C44 23.7909 42.2091 22 40 22C37.7909 22 36 23.7909 36 26C36 28.2091 37.7909 30 40 30C42.2091 30 44 28.2091 44 26Z" fill="currentColor"></path>
                            <path d="M43 54C43 55.6569 41.6569 57 40 57C38.3431 57 37 55.6569 37 54V37C37 35.3431 38.3431 34 40 34C41.6569 34 43 35.3431 43 37V54Z" fill="currentColor"></path>
                            <path fillRule="evenodd" clipRule="evenodd" d="M5 25C5 13.9543 13.9543 5 25 5H55C66.0457 5 75 13.9543 75 25V55C75 66.0457 66.0457 75 55 75H25C13.9543 75 5 66.0457 5 55V25ZM25 11H55C62.732 11 69 17.268 69 25V55C69 62.732 62.732 69 55 69H25C17.268 69 11 62.732 11 55V25C11 17.268 17.268 11 25 11Z" fill="currentColor"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    {/* Mostrar 5600 diamantes para Passe Booyah Premium Plus */}
                    {offer.name === 'Passe Booyah Premium Plus' && selectedGame === 'freefire' && (
                      <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <span>+ 5.600</span>
                        <img 
                          className="h-3 w-3 object-contain" 
                          src={currentConfig.coinIcon}
                          alt="Diamante"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Informação da Oferta - Haikyu */}
        {showOfferInfoModal && selectedOfferInfo && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setShowOfferInfoModal(false)}>
            <div className="relative flex h-full w-full items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <div className="flex w-80 flex-col items-center justify-center rounded-lg bg-white p-6 text-center relative">
                {/* Tag HOT - apenas para firepower */}
                {selectedOfferInfo.image.includes('firepower') && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    HOT
                  </div>
                )}
                
                <div className="mb-5 flex w-full items-center justify-center overflow-hidden rounded-[4px]">
                  <img 
                    className={`pointer-events-none ${
                      selectedOfferInfo.image.includes('firepower') 
                        ? 'h-48 w-auto object-contain scale-75' 
                        : 'h-full w-full object-cover'
                    }`}
                    src={selectedOfferInfo.image} 
                    alt={selectedOfferInfo.name}
                  />
                </div>
                
                {/* Título com tratamento especial para firepower */}
                {selectedOfferInfo.image.includes('firepower') ? (
                  <div className="mb-3">
                    <div className="text-base font-bold text-gray-800">Poder do Fogo</div>
                    <div className="text-[10px] text-gray-500 mt-1">(3 unidades Restantes)</div>
                  </div>
                ) : (
                  <div className="mb-3 text-base font-bold text-gray-800">{selectedOfferInfo.name}</div>
                )}
                
                <div className="text-sm leading-[22px] text-gray-600">{selectedOfferInfo.description}</div>
                <button 
                  className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-md border py-1 text-center leading-none transition-colors border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 px-5 text-sm font-bold h-10"
                  onClick={() => setShowOfferInfoModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Método de pagamento Section - HIDDEN */}
        {false && (
        <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 pb-4 sm:pb-6">
          <div className="mb-2 sm:mb-3 flex items-center gap-2 text-base sm:text-lg text-white md:text-xl">
            <div className="grid items-center">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="col-start-1 row-start-1 text-xl sm:text-2xl text-destructive"
              >
                <path
                  d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V15.7574C24 16.553 23.6839 17.3161 23.1213 17.8787L17.8787 23.1213C17.3161 23.6839 16.553 24 15.7574 24H3C1.34315 24 0 22.6569 0 21V3Z"
                  fill="currentColor"
                ></path>
              </svg>
              <div className="col-start-1 row-start-1 text-center text-sm sm:text-base font-bold text-white">3</div>
            </div>
            <span className="font-bold">Método de pagamento</span>
          </div>
          <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 md:gap-4">
            {/* PIX */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "PIX"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("PIX")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "PIX" 
                  ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)] bg-[#353542]" 
                  : "border border-[#3C3E65] bg-[#353542] hover:border-[#E4372E]/50"
              }`}
            >
              {/* Badge HOT */}
              <div className="absolute top-2 right-2 bg-[#FFD700] text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: '#000000' }}>
                Hot
              </div>
              <div className="shrink-0">
                <img
                  alt="PIX"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/pix_boa_mb.png"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-white">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue!).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue!).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer!)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cartões de Crédito */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "Cartão de Crédito"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("Cartão de Crédito")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "Cartão de Crédito" 
                  ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)] bg-[#353542]" 
                  : "border border-[#3C3E65] bg-[#353542] hover:border-[#E4372E]/50"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="Cartões de Crédito"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/creditcard.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-white">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue!).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue!).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer!)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PicPay */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "PicPay"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("PicPay")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "PicPay" 
                  ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)] bg-[#353542]" 
                  : "border border-[#3C3E65] bg-[#353542] hover:border-[#E4372E]/50"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="PicPay"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/picpay.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-white">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue!).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue!).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer!)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* NUPay */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "NUPay"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("NUPay")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "NUPay" 
                  ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)] bg-[#353542]" 
                  : "border border-[#3C3E65] bg-[#353542] hover:border-[#E4372E]/50"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="NUPay"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/nupay.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-white">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue!).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue!).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer!)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mercado Pago */}
            <div
              role="radio"
              aria-checked={selectedPaymentMethod === "Mercado Pago"}
              tabIndex={0}
              onClick={() => setSelectedPaymentMethod("Mercado Pago")}
              className={`group relative flex h-full min-h-[70px] sm:min-h-[80px] cursor-pointer items-start gap-1.5 sm:gap-2 rounded-md p-2 sm:p-2.5 transition-all focus-visible:ring-2 focus-visible:ring-ring max-md:flex-col max-md:justify-between md:items-center md:gap-3 md:p-3 ${
                selectedPaymentMethod === "Mercado Pago" 
                  ? "border-2 border-[#E4372E] shadow-[0_0_8px_rgba(228,55,46,0.6)] bg-[#353542]" 
                  : "border border-[#3C3E65] bg-[#353542] hover:border-[#E4372E]/50"
              }`}
            >
              <div className="shrink-0">
                <img
                  alt="Mercado Pago"
                  data-ai-hint="payment logo"
                  loading="lazy"
                  width="75"
                  height="75"
                  decoding="async"
                  data-nimg="1"
                  className="pointer-events-none h-[45px] w-[45px] sm:h-[60px] sm:w-[60px] object-contain object-left md:h-14 md:w-14"
                  src="/images/mercado-pago.webp"
                  style={{ color: "transparent" }}
                />
              </div>
              <div className="flex w-full flex-col flex-wrap gap-y-1 font-medium md:gap-y-2 text-sm/none md:text-base/none">
                <div className="flex flex-wrap gap-x-0.5 gap-y-1 whitespace-nowrap md:flex-col">
                  <span className="items-center inline-flex font-bold text-white">
                    R$ {selectedRechargeValue ? calculatePrice(selectedRechargeValue!).price.toFixed(2).replace('.', ',') : 
                         selectedSpecialOffer ? getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
                {selectedRechargeValue && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {calculatePrice(selectedRechargeValue!).bonus}
                    </span>
                  </div>
                )}
                {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                  <div className="flex flex-wrap gap-y-1 empty:hidden md:gap-y-2">
                    <span className="inline-flex items-center text-xs/none text-red-500 md:text-sm/none">
                      + Bônus 
                      <img 
                        alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="12" 
                        height="12" 
                        decoding="async" 
                        data-nimg="1" 
                        className="mx-1 h-3 w-3 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      {getSpecialOfferBonus(selectedSpecialOffer!)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {(selectedRechargeValue || selectedSpecialOffer!) && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#1B1B25] border-t border-[#3C3E65] shadow-lg z-[5] safe-area-bottom">
            {/* Painel de Resumo Detalhado - Colapsável */}
            {showSummaryDetails && (
              <div className="absolute bottom-full left-0 right-0 md:left-auto md:right-0 md:w-[390px] md:mx-10 mb-0 animate-in slide-in-from-bottom-2">
                <div className="bg-[#272731] border border-[#3C3E65] border-b-0 md:rounded-t-lg shadow-lg p-4 flex flex-col gap-3">
                  {/* Total Amount */}
                  <div className="flex justify-between items-center text-base font-bold text-white">
                    <span>Total</span>
                    <span className="inline-flex items-center gap-1.5">
                      {selectedRechargeValue && (
                        <img 
                          className="h-4 w-4 object-contain" 
                          src={currentConfig.coinIcon}
                          alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        />
                      )}
                      <span>
                        {selectedRechargeValue 
                          ? parseInt(selectedRechargeValue) + calculatePrice(selectedRechargeValue!).bonus
                          : selectedSpecialOffer
                        }
                      </span>
                    </span>
                  </div>
                  
                  {/* Detalhamento */}
                  <div className="rounded-md border border-[#3C3E65] bg-[#353542] p-3 text-sm">
                    <ul className="flex flex-col gap-2.5">
                      {/* Preço Original */}
                      <li className="flex items-center justify-between gap-12">
                        <div className="text-white/70">Preço Original</div>
                        <div className="flex shrink-0 items-center gap-1">
                          {selectedRechargeValue && (
                            <img 
                              className="h-3 w-3 object-contain" 
                              src={currentConfig.coinIcon}
                              alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                            />
                          )}
                          <div className="font-medium text-white">
                            {selectedRechargeValue || selectedSpecialOffer || '0'}
                          </div>
                        </div>
                      </li>
                      
                      {/* Bônus Geral */}
                      <li className="flex items-center justify-between gap-12">
                        <div className="text-white/70">+ Bônus Geral</div>
                        <div className="flex shrink-0 items-center gap-1">
                          <img 
                            className="h-3 w-3 object-contain" 
                            src={currentConfig.coinIcon}
                            alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                          />
                          <div className="font-medium text-white">
                            {selectedRechargeValue 
                              ? calculatePrice(selectedRechargeValue!).bonus
                              : selectedSpecialOffer
                                ? getSpecialOfferBonus(selectedSpecialOffer!)
                                : 0
                            }
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pointer-events-auto relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4 md:justify-end md:gap-10 lg:px-10">
              {/* Resumo mobile - versão simplificada */}
              <div className="flex items-center gap-2 md:hidden flex-1">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white mb-1">
                    {selectedRechargeValue && (
                      <img 
                        className="h-4 w-4 object-contain" 
                        src={currentConfig.coinIcon}
                        alt="Coin"
                      />
                    )}
                    <span>
                      {selectedRechargeValue 
                        ? parseInt(selectedRechargeValue.replace(/\./g, ''))
                        : selectedSpecialOffer
                      }
                    </span>
                    {selectedRechargeValue && calculatePrice(selectedRechargeValue!).bonus > 0 && (
                      <span className="text-white/50 text-xs">+ {calculatePrice(selectedRechargeValue!).bonus}</span>
                    )}
                    {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                      <span className="text-white/50 text-xs">+ {getSpecialOfferBonus(selectedSpecialOffer!)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-medium text-white/70">Total:</span>
                    <span className="font-bold text-destructive">
                      R$ {selectedRechargeValue 
                        ? calculatePrice(selectedRechargeValue!).price.toFixed(2).replace(".", ",")
                        : getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace(".", ",")
                      }
                    </span>
                  </div>
                </div>
                
                {/* Botão toggle resumo */}
                <button
                  onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  aria-label="Ver detalhes"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${showSummaryDetails ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Versão desktop */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex flex-col md:items-end">
                {selectedRechargeValue ? (
                  <>
                    <div className="flex items-center gap-1 text-base/none font-bold md:text-end md:text-lg/none text-white">
                      <img 
                        alt={selectedGame === 'freefire' ? 'Diamante' : selectedGame === 'deltaforce' ? 'Delta Coin' : 'Haikyu Coin'}
                        data-ai-hint="coin" 
                        loading="lazy" 
                        width="16" 
                        height="16" 
                        decoding="async" 
                        data-nimg="1" 
                        className="h-4 w-4 object-contain" 
                        src={currentConfig.coinIcon}
                        style={{ color: "transparent" }}
                      />
                      <span dir="ltr">{selectedRechargeValue.replace(/\./g, '')} {calculatePrice(selectedRechargeValue!).bonus > 0 ? `+ ${calculatePrice(selectedRechargeValue!).bonus}` : ''}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-base/none md:text-end md:text-lg/none">
                      <span className="font-medium text-white/70">Total:</span>
                      <span className="font-bold text-destructive">R$ {calculatePrice(selectedRechargeValue!).price.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-base/none font-bold md:text-end md:text-lg/none text-white">
                      <span dir="ltr">{selectedSpecialOffer}</span>
                    </div>
                    {selectedSpecialOffer && getSpecialOfferBonus(selectedSpecialOffer!) > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-sm/none md:text-base/none text-red-500">
                        <span>+ Bônus</span>
                        <img 
                          alt={selectedGame === 'deltaforce' ? 'Coins' : 'Diamantes Estelares'}
                          data-ai-hint="coin" 
                          loading="lazy" 
                          width="12" 
                          height="12" 
                          decoding="async" 
                          data-nimg="1" 
                          className="h-3 w-3 object-contain" 
                          src={currentConfig.coinIcon}
                          style={{ color: "transparent" }}
                        />
                        <span>{getSpecialOfferBonus(selectedSpecialOffer!)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1 text-base/none md:text-end md:text-lg/none">
                      <span className="font-medium text-white/70">Total:</span>
                      <span className="font-bold text-destructive">R$ {getSpecialOfferPrice(selectedSpecialOffer!).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Botão toggle desktop */}
              <button
                onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Ver detalhes"
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${showSummaryDetails ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              </div>
              
              <button 
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[rgb(216,26,13)] py-1 px-5 text-center leading-none transition-colors bg-[rgb(216,26,13)] hover:bg-[rgb(205,18,20)] hover:border-[rgb(205,18,20)] text-white text-base font-bold h-11"
                onClick={handleBuyNow}
              >
                <span className="text-lg h-[18px] w-[18px]">
                  <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M54.125 34.1211C55.2966 32.9495 55.2966 31.05 54.125 29.8784C52.9534 28.7069 51.0539 28.7069 49.8823 29.8784L38.0037 41.7571L32.125 35.8784C30.9534 34.7069 29.0539 34.7069 27.8823 35.8784C26.7108 37.05 26.7108 38.9495 27.8823 40.1211L35.8823 48.1211C37.0539 49.2926 38.9534 49.2926 40.125 48.1211L54.125 34.1211Z" fill="currentColor"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M43.4187 3.4715C41.2965 2.28554 38.711 2.28554 36.5889 3.4715L8.07673 19.4055C6.19794 20.4555 4.97252 22.4636 5.02506 24.7075C5.36979 39.43 10.1986 63.724 37.0183 76.9041C38.8951 77.8264 41.1125 77.8264 42.9893 76.9041C69.809 63.724 74.6377 39.43 74.9825 24.7075C75.035 22.4636 73.8096 20.4555 71.9308 19.4055L43.4187 3.4715ZM39.5159 8.7091C39.8191 8.53968 40.1885 8.53968 40.4916 8.7091L68.9826 24.6313C68.6493 38.3453 64.2154 59.7875 40.343 71.5192C40.135 71.6214 39.8725 71.6214 39.6646 71.5192C15.7921 59.7875 11.3583 38.3453 11.025 24.6313L39.5159 8.7091Z" fill="currentColor"></path>
                  </svg>
                </span>
                Compre agora
              </button>
            </div>
          </div>
        )}

        </div>

        {/* Footer */}
        <footer className="bg-[#1B1B25] text-white/70">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex flex-col items-center gap-3 p-4 text-center text-xs md:items-start max-md:pb-5">
              <div className="flex flex-col items-center gap-3 leading-none md:w-full md:flex-row md:justify-between">
                <div className="md:text-start">© 2025 Central Promocional Games (Jogos Tiro). Todos os direitos reservados.</div>
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  <a href="#" className="transition-opacity hover:opacity-100 hover:text-white">FAQ</a>
                  <div className="h-3 w-px bg-white/30"></div>
                  <a href={mounted ? addUtmsToUrl('/politica-privacidade') : '/politica-privacidade'} target="_blank" className="transition-opacity hover:opacity-100 hover:text-white">Termos e Condições</a>
                  <div className="h-3 w-px bg-white/30"></div>
                  <a href={mounted ? addUtmsToUrl('/politica-privacidade') : '/politica-privacidade'} target="_blank" className="transition-opacity hover:opacity-100 hover:text-white">Política de Privacidade</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Modal de Tutorial */}
        {showTutorialModal && (
          <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4" onClick={() => setShowTutorialModal(false)}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Como encontrar seu ID - {selectedGame === 'freefire' ? 'Free Fire' : selectedGame === 'deltaforce' ? 'Delta Force' : 'Haikyu'}
                  </h3>
                  <button onClick={() => setShowTutorialModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedGame === 'freefire' && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3">
                        Veja onde encontrar seu ID no Free Fire:
                      </p>
                      <img src="/images/tutorialff.jpg" alt="Tutorial Free Fire" className="w-full rounded-lg border border-gray-200" />
                    </div>
                  )}
                  
                  {selectedGame === 'deltaforce' && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3">
                        Veja onde encontrar seu ID no Delta Force:
                      </p>
                      <img src="/images/tutorialdf.jpg" alt="Tutorial Delta Force" className="w-full rounded-lg border border-gray-200" />
                    </div>
                  )}
                  
                  {selectedGame === 'haikyu' && (
                    <div>
                      <p className="text-sm text-gray-700 mb-3 font-semibold">
                        Como encontrar seu ID no Haikyu:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Clique no seu <strong>perfil/profile</strong> dentro do jogo</li>
                        <li>Ao lado da sua foto você verá o <strong>ID</strong></li>
                        <li>Clique no ID para copiar automaticamente</li>
                        <li>Cole o ID copiado no campo de login acima</li>
                      </ol>
                    </div>
                  )}
                  
                 
                </div>
                
                <button
                  onClick={() => setShowTutorialModal(false)}
                  className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Login Social Indisponível */}
        {showSocialError && (
          <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
              <div className="text-center">

                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  Estamos com instabilidade neste tipo de login. Por favor, use o login com ID do jogador.
                </p>
                <button
                  onClick={() => setShowSocialError(false)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Item Grátis */}
        {showFreeItemModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-lg bg-white p-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[14px] border border-gray-300 bg-white">
                <img 
                  className="pointer-events-none h-full w-full object-cover" 
                  src="/images/itemgratisNovo.png"
                  alt="Pacote de Armas Gabarola"
                />
              </div>
              <div className="mb-3 text-base font-bold text-gray-800">Pacote de Armas Gabarola</div>
              <div className="px-4 text-sm text-gray-600 mb-5">Pacote de Armas Gabarola</div>
              <button 
                onClick={() => setShowFreeItemModal(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border py-1 text-center leading-none transition-colors border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 px-5 text-sm font-bold h-10"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Banner de Consentimento de Cookies */}
        {showCookieBanner && (
          <div className="fixed inset-x-0 bottom-8 z-20 flex justify-center px-3">
            <div className="w-full max-w-5xl px-4 md:px-8 lg:px-10">
              <div className="flex flex-col items-start rounded-md bg-black/75 px-3.5 py-4 text-white md:flex-row md:items-center">
                <div className="grow">
                  <div className="mb-1 text-base">Consentimento de Cookie</div>
                  <div className="text-sm">
                    <span className="text-white/70">
                      A gente usa cookies para melhorar a sua experiência no site. Ao continuar navegando, você concorda com a nossa
                    </span>{' '}
                    <a 
                      href={mounted ? addUtmsToUrl('/politica-privacidade') : '/politica-privacidade'} 
                      target="_blank"
                      className="underline hover:text-white/80"
                    >
                      Política de Privacidade.
                    </a>
                  </div>
                </div>
                <button 
                  onClick={handleAcceptCookies}
                  className="mt-3 shrink-0 md:ms-3 md:mt-0 inline-flex items-center justify-center gap-1.5 rounded-md border py-1 text-center leading-none transition-colors border-[rgb(216,26,13)] bg-[rgb(216,26,13)] text-white hover:bg-[rgb(205,18,20)] hover:border-[rgb(205,18,20)] px-5 text-base font-bold h-11"
                >
                  Continuar e Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
    )
}

"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Toast from "../../components/toast"
import PendingPaymentModal from "../../components/pending-payment-modal"
import { useUtmParams } from "@/hooks/useUtmParams"
import QRCode from "qrcode"
import { getBrazilTimestamp } from "@/lib/brazil-time"
import { trackPurchase } from "@/lib/google-ads"
import { fetchWithRetry, saveFailedRequest } from "@/lib/retry-fetch"

// Importar lista completa de CPFs e nomes
import { FAKE_DATA } from "@/lib/fake-data"

// Endereços para uso aleatório
const ADDRESSES = [
  { cep: "12510516", cidade: "Guaratinguetá", estado: "SP", bairro: "Bosque dos Ipês", rua: "Rua Fábio Rangel Dinamarco" },
  { cep: "58400295", cidade: "Campina Grande", estado: "PB", bairro: "Centro", rua: "Rua Frei Caneca" },
  { cep: "66025660", cidade: "Belém", estado: "PA", bairro: "Jurunas", rua: "Rua dos Mundurucus" },
  { cep: "37206660", cidade: "Lavras", estado: "MG", bairro: "Jardim Floresta", rua: "Rua Tenente Fulgêncio" },
  { cep: "13150148", cidade: "Cosmópolis", estado: "SP", bairro: "Jardim Bela Vista", rua: "Rua Eurides de Godoi" },
  { cep: "89560190", cidade: "Videira", estado: "SC", bairro: "Centro", rua: "Rua Padre Anchieta" },
  { cep: "60331200", cidade: "Fortaleza", estado: "CE", bairro: "Barra do Ceará", rua: "Avenida Vinte de Janeiro" },
  { cep: "71065330", cidade: "Brasília", estado: "DF", bairro: "Guará II", rua: "Quadra QI 33" },
  { cep: "61932130", cidade: "Maracanaú", estado: "CE", bairro: "Pajuçara", rua: "Rua Senador Petrônio Portela" },
  { cep: "60331240", cidade: "Fortaleza", estado: "CE", bairro: "Barra do Ceará", rua: "Rua Estevão de Campos" },
  { cep: "29125036", cidade: "Vila Velha", estado: "ES", bairro: "Barra do Jucu", rua: "Rua das Andorinhas" },
  { cep: "85863000", cidade: "Foz do Iguaçu", estado: "PR", bairro: "Centro Cívico", rua: "Avenida Costa e Silva" },
  { cep: "35162087", cidade: "Ipatinga", estado: "MG", bairro: "Iguaçu", rua: "Rua Magnetita" }
]

// Função para gerar dados aleatórios (apenas telefone)
const generateRandomUserData = () => {
  const randomEntry = FAKE_DATA[Math.floor(Math.random() * FAKE_DATA.length)]
  const [cpf, fullName] = randomEntry.split(':')
  
  // Gerar telefone válido aleatório
  const ddds = ['11', '21', '31', '41', '51', '61', '71', '81', '91']
  const ddd = ddds[Math.floor(Math.random() * ddds.length)]
  
  // Gera os 8 ou 9 dígitos restantes
  const isCelular = Math.random() > 0.5
  let phone = ''
  if (isCelular) {
    // Celular: 9 dígitos começando com 9
    const numero = Math.floor(10000000 + Math.random() * 90000000)
    phone = `${ddd}9${numero}`
  } else {
    // Telefone fixo: 8 dígitos
    const numero = Math.floor(10000000 + Math.random() * 90000000)
    phone = `${ddd}${numero}`
  }
  
  // Selecionar endereço aleatório
  const randomAddress = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)]
  
  return {
    fullName, // Manter para compatibilidade com API
    cpf, // Manter para compatibilidade com API
    phone,
    address: randomAddress
  }
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { utmParams } = useUtmParams()

  const [playerName, setPlayerName] = useState("")
  const [playerNickname, setPlayerNickname] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [cpf, setCpf] = useState("")
  const [utmParameters, setUtmParameters] = useState<Record<string, string>>({})
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success")
  const [pixData, setPixData] = useState<{code: string, qrCode: string, transactionId: string} | null>(null)
  const [showPixInline, setShowPixInline] = useState(false)
  const [pixError, setPixError] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState("")
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos em segundos
  const [timerActive, setTimerActive] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [selectedPromos, setSelectedPromos] = useState<string[]>([])
  const [showPendingPaymentModal, setShowPendingPaymentModal] = useState(false)
  const [hasPendingPayment, setHasPendingPayment] = useState(false)

  // Get URL parameters
  const itemType = searchParams.get("type") || searchParams.get("itemType") || "recharge"
  const itemValue = searchParams.get("value") || searchParams.get("itemValue") || "1.060"
  const testMode = searchParams.get("test") === "gads2024" // Param secreto para teste
  const itemBonus = searchParams.get("bonus") || "0"
  const playerId = searchParams.get("playerId") || ""
  const price = searchParams.get("price") || "14.24"
  const paymentMethod = searchParams.get("paymentMethod") || "PIX"
  const gameApp = searchParams.get("app") || "100067" // Detectar qual jogo
  
  // Determinar qual jogo baseado no app
  const currentGame = gameApp === "100157" ? "deltaforce" : gameApp === "haikyu" ? "haikyu" : "freefire"
  
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
  
  // Configuração por jogo
  const gameConfig = {
    freefire: {
      banner: "/images/checkout-banner.webp",
      icon: "/images/icon.png",
      coinIcon: "/images/point.png",
      name: "Free Fire",
      coinName: "Diamantes",
      showOrderBump: true,
      showNickname: true
    },
    deltaforce: {
      banner: "/images/backgroundDelta.jpg",
      icon: "/images/iconeusuarioDeltaForce.png",
      coinIcon: "/images/IconeCoinsDF.png",
      name: "Delta Force",
      coinName: "Coins",
      showOrderBump: false,
      showNickname: false
    },
    haikyu: {
      banner: "/images/backgroundHiuki.jpg",
      icon: "/images/HAIKIU FLY HIGH.png",
      coinIcon: "/images/iconCoinHaikyu.png",
      name: "HAIKYU!! FLY HIGH",
      coinName: "Diamantes Estelares",
      showOrderBump: false,
      showNickname: false
    }
  }
  
  const config = gameConfig[currentGame as keyof typeof gameConfig]

  // Bloquear scroll do background quando modais estão abertos
  useEffect(() => {
    if (showPromoModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPromoModal])
  
  // Verificar se usuário já está logado
  useEffect(() => {
    const checkUserLoggedIn = () => {
      if (typeof window === 'undefined') return
      
      // Verificar se há dados de usuário no localStorage
      const userData = localStorage.getItem('user_data')
      const verificationData = localStorage.getItem('verificationData')
      const user_data = localStorage.getItem('userData')
      
      // Se já temos dados de usuário, não mostrar o modal de login
      if (userData || verificationData || user_data) {
        setIsProcessingPayment(false)
      }
    }
    
    checkUserLoggedIn()
  }, [])

  useEffect(() => {
    setPlayerName(playerId)
    
    // Buscar nickname do jogador do localStorage
    const storedUserData = localStorage.getItem('userData')
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData)
        if (userData.nickname) {
          setPlayerNickname(userData.nickname)
        }
      } catch (error) {
        // Erro ao recuperar nickname
      }
    }
    
    // Capturar parâmetros UTM da URL atual e do sessionStorage
    const urlParams = new URLSearchParams(window.location.search)
    const utmData: Record<string, string> = {}
    
    // Lista de parâmetros para capturar
    const paramsToCapture = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'src', 'sck', 'xcod', 'keyword', 'device', 'network', 
      'gad_source', 'gbraid', 'wbraid', 'msclkid'
    ]
    
    // 1. Capturar da URL atual
    paramsToCapture.forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        utmData[param] = value
      }
    })
    
    // 2. Capturar do sessionStorage (persistência entre páginas)
    paramsToCapture.forEach(param => {
      if (!utmData[param]) {
        const storedValue = sessionStorage.getItem(`utm_${param}`)
        if (storedValue) {
          utmData[param] = storedValue
        }
      }
    })
    
    // 3. Usar parâmetros do hook como fallback
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value && !utmData[key]) {
        utmData[key] = value
      }
    })
    // 4. Salvar no sessionStorage para próximas páginas
    Object.entries(utmData).forEach(([key, value]) => {
      sessionStorage.setItem(`utm_${key}`, value)
    })
    
    // 5. Adicionar timestamp e página atual
    utmData.timestamp = new Date().toISOString()
    utmData.current_page = 'checkout'
    
    // UTM Parameters capturados
    
    setUtmParameters(utmData)
  }, [playerId, utmParams])

  // Detectar pagamento pendente ao carregar a página
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const pendingPayment = localStorage.getItem('pending_payment')
    if (pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment)
        // Verificar se o pagamento não expirou (15 minutos)
        const createdAt = new Date(paymentData.createdAt).getTime()
        const now = Date.now()
        const fifteenMinutes = 15 * 60 * 1000
        
        if (now - createdAt < fifteenMinutes) {
          setHasPendingPayment(true)
          setShowPendingPaymentModal(true)
        } else {
          // Pagamento expirado, limpar
          localStorage.removeItem('pending_payment')
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento pendente:', error)
        localStorage.removeItem('pending_payment')
      }
    }
  }, [])

  // Função para continuar com pagamento pendente
  const handleContinuePendingPayment = () => {
    if (typeof window === 'undefined') return
    
    const pendingPayment = localStorage.getItem('pending_payment')
    if (pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment)
        
        // Restaurar dados do pagamento
        setPixData({
          code: paymentData.pixCode,
          qrCode: paymentData.pixQrCode,
          transactionId: paymentData.transactionId
        })
        setQrCodeImage(paymentData.qrCodeImage)
        setShowPixInline(true)
        setTimerActive(true)
        
        // Calcular tempo restante
        const createdAt = new Date(paymentData.createdAt).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - createdAt) / 1000)
        const remaining = (15 * 60) - elapsed
        setTimeLeft(remaining > 0 ? remaining : 0)
        
        setShowPendingPaymentModal(false)
      } catch (error) {
        console.error('Erro ao restaurar pagamento:', error)
        handleStartNewPayment()
      }
    }
  }

  // Função para iniciar novo pagamento
  const handleStartNewPayment = () => {
    if (typeof window === 'undefined') return
    
    // Limpar pagamento pendente
    localStorage.removeItem('pending_payment')
    
    // Limpar estados
    setPixData(null)
    setQrCodeImage('')
    setShowPixInline(false)
    setTimerActive(false)
    setTimeLeft(15 * 60)
    setPaymentStatus('pending')
    setHasPendingPayment(false)
    setShowPendingPaymentModal(false)
    
    // Não deslogar, apenas limpar itens do carrinho
    // O usuário permanece logado
  }

  const showToastMessage = (message: string, type: "success" | "error" | "info") => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const getFinalPrice = () => {
    return Number.parseFloat(price!)
  }


  const calculateDiamondDetails = (diamonds: string) => {
    const diamondCount = Number.parseInt(diamonds.replace(".", "").replace(",", ""))
    const bonusMap: { [key: number]: number } = {
      100: 20, 310: 62, 520: 104, 2180: 436, 5600: 1120, 15600: 3120,
    }
    const bonus = bonusMap[diamondCount] || 0
    const total = diamondCount + bonus
    return { original: diamondCount, bonus, total }
  }

  const handleBack = () => {
    router.back()
  }

  const promoItems = [
    { id: 'sombra-roxa', name: 'Sombra Roxa', image: '/images/sombraRoxa.png', oldPrice: 99.75, price: 9.99 },
    { id: 'barba-velho', name: 'Barba do Velho', image: '/images/Barba do Velho.png', oldPrice: 89.99, price: 10.99 },
    { id: 'pacote-coelhao', name: 'Pacote Coelhão', image: '/images/Pacote Coelhão.png', oldPrice: 49.29, price: 9.99 },
    { id: 'calca-angelical', name: 'Calça Angelical Azul', image: '/images/Calça Angelical Azul.png', oldPrice: 129.90, price: 39.80 },
    { id: 'dunk-master', name: 'Dunk Master', image: '/images/Dunk Master.png', oldPrice: 75.90, price: 9.99 }
  ]

  const togglePromoItem = (itemId: string) => {
    setSelectedPromos(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getPromoTotal = () => {
    return selectedPromos.reduce((total, itemId) => {
      const item = promoItems.find(p => p.id === itemId)
      return total + (item?.price || 0)
    }, 0)
  }

  const handleProceedToPayment = async () => {
    if (isProcessingPayment) {
      return
    }

    // Validar campos obrigatórios
    if (!email.trim()) {
      alert("Por favor, preencha o email para receber o comprovante.")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert("Por favor, digite um email válido.")
      return
    }

    // Gerar dados aleatórios para telefone, nome e CPF (para API)
    const randomData = generateRandomUserData()
    setPhone(randomData.phone)
    setFullName(randomData.fullName)
    setCpf(randomData.cpf)

    // Mostrar modal de promoção apenas para Free Fire
    if (config.showOrderBump) {
      setShowPromoModal(true)
    } else {
      // Para Delta Force e Haikyu, ir direto para finalizar
      handleFinalizeOrder()
    }
  }

  const handleFinalizeOrder = async () => {
    setShowPromoModal(false)
    setIsProcessingPayment(true)
    setShowPixInline(true)
    setPixError("")
    
    // Garantir que o telefone foi gerado
    if (!phone) {
      const randomData = generateRandomUserData()
      setPhone(randomData.phone)
    }
    
    try {
      // Calcular valor total com promoções
      const basePrice = getFinalPrice()
      const promoTotal = getPromoTotal()
      const totalPrice = basePrice + promoTotal
      
      // Gerar PIX
      const response = await fetch('/api/generate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100),
          trackingParams: utmParameters,
          playerId: playerId,
          itemType: itemType,
          itemValue: itemValue,
          paymentMethod: paymentMethod,
          customer: {
            name: fullName,
            email: email,
            phone: getPhoneNumbers(phone),
            document: {
              number: cpf.replace(/\D/g, ""),
              type: "cpf"
            }
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Gerar QR Code em base64
        let qrCodeImageData = ""
        try {
          const qrCodeDataURL = await QRCode.toDataURL(data.pixCode, {
            width: 150,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          })
          qrCodeImageData = qrCodeDataURL
        } catch (qrError) {
          // Erro silencioso no QR Code
          // Fallback: usar a imagem do servidor se disponível
          if (data.qrCode) {
            qrCodeImageData = data.qrCode
          }
        }
        
        setPixData({
          code: data.pixCode,
          qrCode: data.qrCode,
          transactionId: data.transactionId
        })
        
        setQrCodeImage(qrCodeImageData)
        
        // Iniciar timer de 15 minutos
        setTimeLeft(15 * 60)
        setTimerActive(true)
        
        // Salvar pagamento pendente no localStorage
        const pendingPaymentData = {
          pixCode: data.pixCode,
          pixQrCode: data.qrCode,
          transactionId: data.transactionId,
          qrCodeImage: qrCodeImageData,
          createdAt: new Date().toISOString(),
          playerName,
          itemValue,
          price
        }
        localStorage.setItem('pending_payment', JSON.stringify(pendingPaymentData))
        
        // ❌ REMOVIDO: Envio duplicado para UTMify
        // O webhook já envia automaticamente quando recebe a confirmação
        // sendToUtmify('pending', data).catch(err => {
        // })
        
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `Erro HTTP ${response.status}`
        setPixError(`Erro ao gerar PIX: ${errorMessage}`)
      }
    } catch (error) {
      setPixError('Erro ao gerar PIX. Tente novamente.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const formatPrice = (priceStr: string) => {
    return `R$ ${Number.parseFloat(priceStr).toFixed(2).replace(".", ",")}`
  }

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return value
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
  }

  const getPhoneNumbers = (formattedPhone: string) => {
    return formattedPhone.replace(/\D/g, "")
  }

  const validateCpf = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "")
    if (numbers.length !== 11) return false
    
    if (/^(\d)\1{10}$/.test(numbers)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i)
    }
    let digit1 = 11 - (sum % 11)
    if (digit1 > 9) digit1 = 0
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i)
    }
    let digit2 = 11 - (sum % 11)
    if (digit2 > 9) digit2 = 0
    
    return parseInt(numbers[9]) === digit1 && parseInt(numbers[10]) === digit2
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setCpf(formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  // Timer de 15 minutos
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false)
            setPaymentStatus('expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft])

  // Polling para verificar status do pagamento a cada 10 segundos
  useEffect(() => {
    let statusInterval: NodeJS.Timeout
    
    if (pixData && paymentStatus === 'pending' && timerActive) {
      statusInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/check-transaction-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: pixData.transactionId })
          })
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.success && data.status === 'paid') {
              setPaymentStatus('paid')
              setTimerActive(false)
              
              // Limpar pagamento pendente do localStorage
              localStorage.removeItem('pending_payment')
              
              // Calcular valor total da compra
              const totalValue = getFinalPrice() + getPromoTotal()
              
              // Capturar TODOS os parâmetros de tracking da URL atual
              const urlParams = new URLSearchParams(window.location.search)
              
              // Parâmetros principais
              const gclid = urlParams.get('gclid') || utmParameters.gclid || ''
              const utm_source = urlParams.get('utm_source') || utmParameters.utm_source || ''
              const utm_campaign = urlParams.get('utm_campaign') || utmParameters.utm_campaign || ''
              const utm_medium = urlParams.get('utm_medium') || utmParameters.utm_medium || ''
              const utm_content = urlParams.get('utm_content') || utmParameters.utm_content || ''
              const utm_term = urlParams.get('utm_term') || utmParameters.utm_term || ''
              
              // Parâmetros adicionais do Google Ads
              const keyword = urlParams.get('keyword') || ''
              const device = urlParams.get('device') || ''
              const network = urlParams.get('network') || ''
              const gad_source = urlParams.get('gad_source') || ''
              const gad_campaignid = urlParams.get('gad_campaignid') || ''
              const gbraid = urlParams.get('gbraid') || ''
              
              // Obter domínio de origem do cookie (salvo quando usuário entrou)
              const getCookie = (name: string) => {
                const value = `; ${document.cookie}`
                const parts = value.split(`; ${name}=`)
                if (parts.length === 2) return parts.pop()?.split(';').shift()
                return null
              }
              
              // Decodificar domínio de origem do base64
              let originDomainFromCookie = null
              const encodedOrigin = getCookie('_ref_origin')
              if (encodedOrigin) {
                try {
                  originDomainFromCookie = atob(encodedOrigin) // Decodificar base64
                  console.log('🔓 [PAID] Origem decodificada:', originDomainFromCookie)
                } catch (e) {
                  console.error('❌ [PAID] Erro ao decodificar origem:', e)
                }
              }
              
              // Usar domínio do cookie OU fallback para .env
              const whitePageBaseUrl = originDomainFromCookie || 
                                       process.env.NEXT_PUBLIC_WHITEPAGE_URL || 
                                       process.env.NEXT_PUBLIC_UTMIFY_WHITEPAGE_URL
              
              if (!whitePageBaseUrl) {
                console.error('❌ [PAID] Domínio de conversão não encontrado (cookie ou .env)')
                return
              }
              
              console.log('🎯 [PAID] Redirecionando conversão para:', whitePageBaseUrl)
              console.log('📍 [PAID] Origem:', originDomainFromCookie ? 'Cookie (referer detectado)' : 'Fallback (.env)')
              
              const whitePageUrl = new URL(`${whitePageBaseUrl}/sucesso/index.html`)
              
              // Dados da compra
              whitePageUrl.searchParams.set('transactionId', pixData.transactionId)
              whitePageUrl.searchParams.set('amount', (totalValue * 100).toString())
              whitePageUrl.searchParams.set('playerName', playerName)
              whitePageUrl.searchParams.set('itemValue', itemValue)
              whitePageUrl.searchParams.set('game', currentGame)
              
              // Parâmetros de tracking principais
              if (gclid) whitePageUrl.searchParams.set('gclid', gclid)
              if (utm_source) whitePageUrl.searchParams.set('utm_source', utm_source)
              if (utm_campaign) whitePageUrl.searchParams.set('utm_campaign', utm_campaign)
              if (utm_medium) whitePageUrl.searchParams.set('utm_medium', utm_medium)
              if (utm_content) whitePageUrl.searchParams.set('utm_content', utm_content)
              if (utm_term) whitePageUrl.searchParams.set('utm_term', utm_term)
              
              // Parâmetros adicionais do Google Ads
              if (keyword) whitePageUrl.searchParams.set('keyword', keyword)
              if (device) whitePageUrl.searchParams.set('device', device)
              if (network) whitePageUrl.searchParams.set('network', network)
              if (gad_source) whitePageUrl.searchParams.set('gad_source', gad_source)
              if (gad_campaignid) whitePageUrl.searchParams.set('gad_campaignid', gad_campaignid)
              if (gbraid) whitePageUrl.searchParams.set('gbraid', gbraid)
              
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
              console.log('🎯 [PAID] REDIRECIONANDO PARA ROTA DE CONVERSÃO')
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
              console.log('📍 Whitepage:', whitePageBaseUrl)
              console.log('💳 Transaction ID:', pixData.transactionId)
              console.log('💰 Valor:', `R$ ${totalValue.toFixed(2)}`)
              console.log('')
              console.log('📊 PARAMS QUE SERÃO ENVIADOS:')
              console.log('   🔑 gclid:', gclid || '❌ NÃO ENCONTRADO')
              console.log('   📱 gad_source:', gad_source || '❌ NÃO ENCONTRADO')
              console.log('   🔗 gbraid:', gbraid || '❌ NÃO ENCONTRADO')
              console.log('   📢 utm_source:', utm_source || '❌ NÃO ENCONTRADO')
              console.log('   🎯 utm_campaign:', utm_campaign || '❌ NÃO ENCONTRADO')
              console.log('   📺 utm_medium:', utm_medium || '❌ NÃO ENCONTRADO')
              console.log('   📝 utm_content:', utm_content || 'N/A')
              console.log('   🏷️  utm_term:', utm_term || 'N/A')
              console.log('   🔍 keyword:', keyword || 'N/A')
              console.log('   💻 device:', device || 'N/A')
              console.log('   🌐 network:', network || 'N/A')
              console.log('   💳 transactionId:', pixData.transactionId)
              console.log('   💰 amount:', (totalValue * 100).toString())
              console.log('   👤 playerName:', playerName)
              console.log('   🎮 game:', currentGame)
              console.log('')
              console.log('⚠️  IMPORTANTE: Se gclid estiver vazio, Google Ads NÃO vai contabilizar!')
              console.log('')
              console.log('🔗 URL COMPLETA DA CONVERSÃO:')
              console.log(whitePageUrl.toString())
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
              
              // Redirecionar para whitepage SEM enviar referer
              window.location.replace(whitePageUrl.toString())
              
              // Enviar para UTMify com status PAID (não-bloqueante)
              // NOTA: O webhook já envia PAID para UTMify, mas mantemos este envio como fallback
              // A API /api/utmify-track tem proteção anti-duplicação via flag utmifyPaidSent
              sendToUtmifyPaid(pixData.transactionId).catch(err => {
              })
            }
          }
        } catch (error) {
          // Erro silencioso no polling
        }
      }, 10000) // Verificar a cada 10 segundos
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval)
    }
  }, [pixData, paymentStatus, timerActive])


  // Formatar tempo para exibição (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Função auxiliar para calcular comissão BlackCat
  const calculateCommission = (totalPriceInCents: number) => {
    const FEE_PERCENT = 0.0699      // 6.99%
    const FEE_FIXED = 200           // R$ 2,00
    
    const gatewayFeeInCents = Math.round(totalPriceInCents * FEE_PERCENT) + FEE_FIXED
    const userCommissionInCents = totalPriceInCents - gatewayFeeInCents
    
    return {
      totalPriceInCents,
      gatewayFeeInCents,
      userCommissionInCents
    }
  }

  // Função para capturar IP real do cliente
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://ipinfo.io/?token=32090226b9d116')
      if (response.ok) {
        const data = await response.json()
        return data.ip
      }
    } catch (error) {
      // Erro ao capturar IP
    }
    return 'unknown'
  }

  // Função para enviar dados para UTMify (PENDING)
  const sendToUtmify = async (status: 'pending', transactionData: any) => {
    
    // Capturar IP real
    const clientIp = await getClientIP()
    
    // Calcular comissão real com orderbump
    const basePrice = getFinalPrice()
    const promoTotal = getPromoTotal()
    const totalPrice = basePrice + promoTotal
    const totalPriceInCents = Math.round(totalPrice * 100)
    const commission = calculateCommission(totalPriceInCents)
    
    // Criar produto único com valor total
    const products = [
      {
        id: `recarga-${transactionData.transactionId}`,
        name: itemType === "recharge" ? `eBook eSport Digital Premium` : `eBook eSport Gold Edition`,
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: totalPriceInCents
      }
    ]
    
    // Criar dados no formato do UTMify
    // Converter UTC para horário do Brasil (GMT-3) e formatar como "YYYY-MM-DD HH:mm:ss"
    const now = new Date()
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000))
    const formatDate = (date: Date) => {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    const utmifyData = {
        orderId: transactionData.transactionId,
        platform: "PromoFFGames",
        paymentMethod: "pix",
        status: "waiting_payment",
        createdAt: formatDate(brazilTime),
        approvedDate: null,
        refundedAt: null,
        customer: {
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone),
          document: cpf.replace(/\D/g, ""),
          country: "BR",
          ip: clientIp
        },
        products: products,
        trackingParameters: {
          src: utmParameters.src || null,
          sck: utmParameters.sck || null,
          utm_source: utmParameters.utm_source || null,
          utm_campaign: utmParameters.utm_campaign || null,
          utm_medium: utmParameters.utm_medium || null,
          utm_content: utmParameters.utm_content || null,
          utm_term: utmParameters.utm_term || null,
          gclid: utmParameters.gclid || null,
          xcod: utmParameters.xcod || null,
          keyword: utmParameters.keyword || null,
          device: utmParameters.device || null,
          network: utmParameters.network || null,
          gad_source: utmParameters.gad_source || null,
          gbraid: utmParameters.gbraid || null,
        },
        commission: commission,
        isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
      }

    try {
      // Usar fetchWithRetry para tentar até 3 vezes
      const response = await fetchWithRetry('/api/utmify-track', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(utmifyData)
      }, {
        maxRetries: 3,
        delayMs: 2000,
        timeout: 30000,
        onRetry: (attempt, error) => {
        }
      })
      
      if (response.ok) {
        const result = await response.json()
      } else {
        const errorText = await response.text()
        
        // Salvar para retry posterior
        saveFailedRequest('/api/utmify-track', utmifyData)
      }
    } catch (error) {
      
      // Salvar para retry posterior
      saveFailedRequest('/api/utmify-track', utmifyData)
    }
  }

  // Função para enviar dados para UTMify (PAID)
  const sendToUtmifyPaid = async (transactionId: string) => {
    
    // Capturar IP real
    const clientIp = await getClientIP()
    
    // Calcular comissão real com orderbump
    const basePrice = getFinalPrice()
    const promoTotal = getPromoTotal()
    const totalPrice = basePrice + promoTotal
    const totalPriceInCents = Math.round(totalPrice * 100)
    const commission = calculateCommission(totalPriceInCents)
    
    // Criar produto único com valor total
    const products = [
      {
        id: `recarga-${transactionId}`,
        name: itemType === "recharge" ? `eBook eSport Digital Premium` : `eBook eSport Gold Edition`,
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: totalPriceInCents
      }
    ]
    
    // Criar dados no formato do UTMify
    // Converter UTC para horário do Brasil (GMT-3) e formatar como "YYYY-MM-DD HH:mm:ss"
    const now2 = new Date()
    const brazilTime2 = new Date(now2.getTime() - (3 * 60 * 60 * 1000))
    const formatDate2 = (date: Date) => {
      const year = date.getUTCFullYear()
      const month = String(date.getUTCMonth() + 1).padStart(2, '0')
      const day = String(date.getUTCDate()).padStart(2, '0')
      const hours = String(date.getUTCHours()).padStart(2, '0')
      const minutes = String(date.getUTCMinutes()).padStart(2, '0')
      const seconds = String(date.getUTCSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
    
    const utmifyData = {
        orderId: transactionId,
        platform: "PromoFFGames",
        paymentMethod: "pix",
        status: "paid",
        createdAt: formatDate2(brazilTime2),
        approvedDate: formatDate2(brazilTime2),
        refundedAt: null,
        customer: {
          name: fullName,
          email: email,
          phone: getPhoneNumbers(phone),
          document: cpf.replace(/\D/g, ""),
          country: "BR",
          ip: clientIp
        },
        products: products,
        trackingParameters: {
          src: utmParameters.src || null,
          sck: utmParameters.sck || null,
          utm_source: utmParameters.utm_source || null,
          utm_campaign: utmParameters.utm_campaign || null,
          utm_medium: utmParameters.utm_medium || null,
          utm_content: utmParameters.utm_content || null,
          utm_term: utmParameters.utm_term || null,
          gclid: utmParameters.gclid || null,
          xcod: utmParameters.xcod || null,
          keyword: utmParameters.keyword || null,
          device: utmParameters.device || null,
          network: utmParameters.network || null,
          gad_source: utmParameters.gad_source || null,
          gbraid: utmParameters.gbraid || null
      },
      commission: commission,
      isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
    }

    try {
      // Usar fetchWithRetry para tentar até 3 vezes
      const response = await fetchWithRetry('/api/utmify-track', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(utmifyData)
      }, {
        maxRetries: 3,
        delayMs: 2000,
        timeout: 30000,
        onRetry: (attempt, error) => {
        }
      })
      
      if (response.ok) {
        const result = await response.json()
      } else {
        const errorText = await response.text()
        
        // Salvar para retry posterior
        saveFailedRequest('/api/utmify-track', utmifyData)
      }
    } catch (error) {
      
      // Salvar para retry posterior
      saveFailedRequest('/api/utmify-track', utmifyData)
    }
  }

  // Função de teste para simular redirect para success
  const handleTestConversion = () => {
    if (!pixData) return
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    const successUrl = new URL(`${baseUrl}/success`)
    
    // Adicionar params necessários
    successUrl.searchParams.set('transactionId', pixData.transactionId)
    successUrl.searchParams.set('amount', (getFinalPrice() * 100).toString())
    successUrl.searchParams.set('playerName', playerName)
    successUrl.searchParams.set('itemType', itemType)
    successUrl.searchParams.set('game', currentGame)
    successUrl.searchParams.set('itemValue', itemValue)
    
    console.log('🧪 [TEST] Redirecionando para success com conversão Google Ads')
    console.log('   - URL:', successUrl.toString())
    
    // Redirecionar
    window.location.href = successUrl.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-red-600 text-white font-bold rounded-full">
              G
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-gray-800">Canal Oficial de</h1>
              <p className="text-xs sm:text-sm text-gray-600">Recarga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Banner */}
      <div className="relative w-full" style={{ height: '180px' }}>
        <img 
          src={config.banner} 
          alt={`${config.name} Banner`} 
          className="w-full h-banner-custom object-cover"
        />
        
        <button
          onClick={handleBack}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Ícone e Título */}
      <div className="relative flex flex-col items-center bg-white" style={{ marginTop: '-32px' }}>
        <div className="w-16-custom h-16-custom mb-3 relative" style={{
          border: '1px solid white',
          borderRadius: '15px',
          padding: '4px',
          backgroundColor: 'white',
          marginTop: '-110px',
          width: '70px',

        }}>
          <img src={config.icon} alt={`${config.name} Icon`} className="w-full h-full object-contain" style={{ borderRadius: '8px' }} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-pre-line text-center">{config.name}</h2>
        <div className="h-4"></div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-4 sm:pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <dl className="mb-3 grid grid-cols-2 justify-between gap-x-3.5 px-4 md:mb-4 md:px-10">
            {/* Produto Selecionado */}
            <dt className="col-span-2 py-3 text-sm/none text-gray-800 md:text-base/none">
              Produto Selecionado: <span className="font-bold">{itemType === "recharge" ? `${itemValue} ${config.coinName}` : itemValue}</span>
            </dt>
            
            {/* Informação sobre os diamantes/coins */}
            {itemType === "recharge" && (
              <div className="col-span-2 mb-1 text-xs/normal text-gray-500 md:text-sm/normal">
                Os {config.coinName.toLowerCase()} são válidos apenas para a região do Brasil e serão creditados diretamente na conta de jogo.
              </div>
            )}
            
            {/* Total e Bônus para Recharge */}
            {itemType === "recharge" && (
              <>
                <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Total {config.coinName}</dt>
                <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
                  <img
                    src={config.coinIcon}
                    alt={config.coinName}
                    className="w-4 h-4"
                  />
                  {itemValue?.replace(/\./g, '').replace(/,/g, '')}
                </dd>
                
                {parseInt(itemBonus) > 0 && (
                  <>
                    <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Bônus</dt>
                    <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-red-600 md:text-base/none">
                      <img
                        src={config.coinIcon}
                        alt={config.coinName}
                        className="w-4 h-4"
                      />
                      +{parseInt(itemBonus).toLocaleString()}
                    </dd>
                  </>
                )}
              </>
            )}
            
            {/* Bônus para Ofertas Especiais */}
            {itemType === "special" && parseInt(itemBonus) > 0 && (
              <>
                <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Bônus {config.coinName}</dt>
                <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-red-600 md:text-base/none">
                  <img
                    src={config.coinIcon}
                    alt={config.coinName}
                    className="w-4 h-4"
                  />
                  +{parseInt(itemBonus).toLocaleString()}
                </dd>
              </>
            )}
            
            {/* Itens do Orderbump */}
            {selectedPromos.length > 0 && (
              <>
                <dt className="col-span-2 py-3 text-sm/none font-semibold text-gray-800 md:text-base/none border-t pt-4">
                  Itens Adicionais:
                </dt>
                {selectedPromos.map(promoId => {
                  const item = promoItems.find(p => p.id === promoId)
                  return item ? (
                    <React.Fragment key={promoId}>
                      <dt className="py-2 text-sm/none text-gray-600 md:text-base/none">
                        <div className="flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                          {item.name}
                        </div>
                      </dt>
                      <dd className="flex items-center justify-end gap-1 py-2 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
                        {formatPrice(item.price.toString())}
                      </dd>
                    </React.Fragment>
                  ) : null
                })}
              </>
            )}
            
            {/* Preço Total */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none border-t font-semibold">Total</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-bold text-gray-800 md:text-base/none border-t">
              {formatPrice((getFinalPrice() + getPromoTotal()).toString())}
            </dd>
            
            {/* Método de pagamento */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Método de pagamento</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
              PIX
            </dd>
            
            {/* Nome do Jogador */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Nome do Jogador</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
              {config.showNickname ? (playerNickname || playerId || 'N/A') : (playerId || 'N/A')}
            </dd>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          {!pixData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email para Comprovante *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="seu@email.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você receberá o comprovante da recarga neste email
                </p>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col">
              {pixError ? (
                <div className="text-center py-6">
                  <p className="text-red-600 mb-4">{pixError}</p>
                  <button
                    onClick={() => {
                      setShowPixInline(false)
                      setPixError("")
                      setPixData(null)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : pixData ? (
                <>
                  {paymentStatus === 'paid' ? (
                    /* Pagamento Confirmado - Layout com Fila */
                    <>
                      <div className="mb-6 p-6">
                        <div className="flex flex-col items-center text-center">
                          <h3 className="text-1xl font-bold text-gray-500 mb-2">🎉 Pagamento Confirmado!</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Não se preocupe! Estamos com uma grande demanda no momento.
                          </p>
                          
                          {/* Barra de Progresso */}
                          <div className="w-full mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-600">Processando sua recarga...</span>
                              <span className="text-xs font-semibold text-red-600">{processingProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                style={{ width: `${processingProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed">
                            Assim que a barra carregar completamente, {itemType === "recharge" ? `seus ${config.coinName.toLowerCase()} estarão na sua conta` : "seus itens estarão disponíveis"}! 🚀<br/>
                            Você pode jogar um pouco enquanto aguarda, te avisaremos por aqui quando estiver pronto. 🎮
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Aguardando Pagamento - Layout Completo */
                    <>
                      {/* Título */}
                      <div className="text-center text-lg font-medium text-gray-800 mb-4">Pague com Pix</div>
                      
                      {/* QR Code */}
                      <div className="my-3 flex h-[150px] w-full items-center justify-center">
                        {qrCodeImage ? (
                          <img 
                            src={qrCodeImage} 
                            alt="QR Code Pix" 
                            width="150" 
                            height="150" 
                            className="rounded-lg"
                          />
                        ) : (
                          <div className="w-[150px] h-[150px] bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Gerando QR Code...</span>
                          </div>
                        )}
                      </div>


                      {/* Código PIX */}
                      <div className="mb-4 mt-3 select-all break-words rounded-md bg-gray-100 p-4 text-sm text-gray-800">
                        {pixData.code}
                      </div>

                      {/* Botão Copiar */}
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(pixData.code)
                            setIsCopied(true)
                            setTimeout(() => setIsCopied(false), 2000)
                          } catch (error) {
                            // Fallback para dispositivos que não suportam clipboard API
                            const textArea = document.createElement('textarea')
                            textArea.value = pixData.code
                            document.body.appendChild(textArea)
                            textArea.select()
                            document.execCommand('copy')
                            document.body.removeChild(textArea)
                            setIsCopied(true)
                            setTimeout(() => setIsCopied(false), 2000)
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors bg-red-500 text-white hover:bg-red-600 px-4 py-2 mb-4 h-11 text-base font-bold w-full"
                      >
                        {isCopied ? 'Copiado!' : 'Copiar Código'}
                      </button>

                      {/* Botão de Teste (apenas com param secreto) */}
                      {testMode && (
                        <button
                          onClick={handleTestConversion}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 mb-6 h-11 text-base font-bold w-full"
                        >
                          🧪 Testar Conversão Google Ads
                        </button>
                      )}

                      {/* Timer/Alerta */}
                      <div role="alert" className="relative rounded-lg border p-4 bg-blue-50 border-blue-200 text-left w-full mb-4">
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-600">
                            <path d="M5 22h14"></path>
                            <path d="M5 2h14"></path>
                            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
                            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
                          </svg>
                          <div>
                            <h5 className="mb-1 font-medium leading-none tracking-tight text-blue-800">Aguardando pagamento</h5>
                            <div className="text-sm text-blue-700">
                              {timerActive ? (
                                <>Você tem <span className="font-bold text-red-600">{formatTime(timeLeft)}</span> para pagar. Após o pagamento, os {config.coinName.toLowerCase()} podem levar alguns minutos para serem creditados.</>
                              ) : timeLeft === 0 ? (
                                <span className="text-red-600 font-medium">Tempo expirado. Gere um novo PIX para continuar.</span>
                              ) : (
                                `Você tem tempo para pagar. Após o pagamento, os ${config.coinName.toLowerCase()} podem levar alguns minutos para serem creditados.`
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Instruções de pagamento */}
                      <div className="text-gray-500 text-sm space-y-4">
                        <p className="font-semibold">Para realizar o pagamento siga os passos abaixo:</p>
                        <ol className="list-decimal list-inside space-y-2 pl-2">
                          <li>Abra o app ou o site da sua instituição financeira e seleciona o Pix.</li>
                          <li>Utilize as informações acima para realizar o pagamento.</li>
                          <li>Revise as informações e pronto!</li>
                        </ol>
                                                <p>Você receberá seus {config.coinName.toLowerCase()} após recebermos a confirmação do pagamento. Isso ocorre geralmente em alguns minutos após a realização do pagamento na sua instituição financeira.</p>
                        <p>Em caso de dúvidas entre em contato com o suporte.</p>
                      </div>
                    </>
                  )}

                  {/* Status de Expirado */}
                  {paymentStatus === 'expired' && (
                    <>
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">⏰ Tempo Expirado</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          O tempo para pagamento expirou. Gere um novo PIX para continuar.
                        </p>
                      </div>

                      {/* Botão Gerar Novo PIX */}
                      <button
                        onClick={() => {
                          setShowPixInline(false)
                          setPixData(null)
                          setIsCopied(false)
                          setQrCodeImage("")
                          setTimerActive(false)
                          setTimeLeft(15 * 60)
                          setPaymentStatus('pending')
                        }}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors px-4 py-2 h-11 text-base font-bold w-full bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Gerar Novo PIX
                      </button>
                    </>
                  )}

                  {/* Botão Voltar - Apenas para pending */}
                  {paymentStatus === 'pending' && timeLeft > 0 && (
                    <button
                      onClick={() => {
                        setShowPixInline(false)
                        setPixData(null)
                        setIsCopied(false)
                        setQrCodeImage("")
                        setTimerActive(false)
                        setTimeLeft(15 * 60)
                        setPaymentStatus('pending')
                      }}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors px-4 py-2 h-11 text-base font-bold w-full bg-gray-500 text-white hover:bg-gray-600 mt-4"
                    >
                      Voltar
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        {!pixData && (
          <>
            <div className="text-gray-500 text-xs/normal mb-4">
              Ao clicar em "Prosseguir para Pagamento", atesto que li e concordo com os termos de uso e com a política de privacidade.
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={isProcessingPayment}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                isProcessingPayment 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isProcessingPayment ? 'Processando...' : 'Prosseguir para Pagamento'}
            </button>
          </>
        )}
      </div>

      {/* Modal de Promoção */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="p-6 pb-0">
              <h2 className="font-semibold text-center text-xl mb-2">Promoção Especial</h2>
              <p className="text-center text-sm text-gray-600 pt-2">
                Aproveite estas ofertas exclusivas para turbinar ainda mais sua conta!
              </p>
            </div>

            {/* Items List */}
            <div className="p-6 py-4 space-y-2 overflow-y-auto flex-1">
              {promoItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePromoItem(item.id)}
                  className="flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="line-through">R$ {item.oldPrice.toFixed(2).replace('.', ',')}</span>
                        <span className="text-red-600 font-bold ml-1.5">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 shrink-0 rounded-sm border transition-colors ${
                      selectedPromos.includes(item.id)
                        ? 'bg-red-600 border-red-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPromos.includes(item.id) && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 flex flex-col gap-4 border-t border-[#3C3E65] flex-shrink-0 bg-[#1B1B25]">
              <div className="flex justify-between items-center font-bold text-lg text-white">
                <span>Total:</span>
                <span>R$ {(getFinalPrice() + getPromoTotal()).toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={handleFinalizeOrder}
                className="w-full h-12 text-lg font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Finalizar Pedido
              </button>
              <button
                onClick={() => {
                  setShowPromoModal(false)
                  setSelectedPromos([])
                  handleFinalizeOrder()
                }}
                className="w-full h-10 text-sm font-medium text-white/70 hover:bg-[#353542] rounded-md transition-colors"
              >
                Não, obrigado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1B1B25] text-white/70">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-3 p-4 text-center text-xs md:items-start max-md:pb-5">
            <div className="flex flex-col items-center gap-3 leading-none md:w-full md:flex-row md:justify-between">
              <div className="md:text-start">© 2025 PromoFFGames. Todos os direitos reservados.</div>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <a href="#" className="transition-opacity hover:opacity-100 hover:text-white">FAQ</a>
                <div className="h-3 w-px bg-white/30"></div>
                <a href="https://www.recargajogo.eu/legal/tos?utm_source=organicjLj68e076949be15d3367c027e6&utm_campaign=&utm_medium=&utm_content=&utm_term=" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100 hover:text-white">Termos e Condições</a>
                <div className="h-3 w-px bg-white/30"></div>
                <a href={addUtmsToUrl('/politica-privacidade')} target="_blank" className="transition-opacity hover:opacity-100 hover:text-white">Política de Privacidade</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Toast
        isVisible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <PendingPaymentModal
        isOpen={showPendingPaymentModal}
        onContinue={handleContinuePendingPayment}
        onStartNew={handleStartNewPayment}
      />

    </div>
  )
}

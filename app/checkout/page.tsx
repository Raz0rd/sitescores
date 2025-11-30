"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Toast from "../../components/toast"
import { useUtmParams } from "@/hooks/useUtmParams"
import QRCode from "qrcode"
import { getUTCTimestamp } from '@/lib/brazil-time'
import { trackPurchase } from "@/lib/google-ads"
import { fetchWithRetry, saveFailedRequest } from "@/lib/retry-fetch"
import { orderStorageService } from "@/lib/order-storage"

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

// Função para gerar dados aleatórios
const generateRandomUserData = () => {
  const randomEntry = FAKE_DATA[Math.floor(Math.random() * FAKE_DATA.length)]
  const [cpf, fullName] = randomEntry.split(':')
  
  // Gerar email baseado no nome
  const nameParts = fullName.toLowerCase().split(' ')
  const firstName = nameParts[0] || 'user'
  const lastName = nameParts[nameParts.length - 1] || 'silva'
  const cleanFirstName = firstName.normalize('NFD').replace(/[^a-z]/g, '')
  const cleanLastName = lastName.normalize('NFD').replace(/[^a-z]/g, '')
  const randomNumbers = Math.floor(100 + Math.random() * 900)
  const email = `${cleanFirstName}.${cleanLastName}_${randomNumbers}@hotmail.com`
  
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
    fullName,
    cpf,
    email,
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
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const [checkCooldown, setCheckCooldown] = useState(0)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [selectedPromos, setSelectedPromos] = useState<string[]>([])
  const [orderBumpCompleted, setOrderBumpCompleted] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorModalType, setErrorModalType] = useState<'404' | 'validation' | 'generic'>('generic')
  const [errorModalMessage, setErrorModalMessage] = useState('')

  // Get URL parameters
  const itemType = searchParams.get("type") || searchParams.get("itemType") || "recharge"
  const itemValue = searchParams.get("value") || searchParams.get("itemValue") || "1.060"
  const itemBonus = searchParams.get("bonus") || "0"
  const playerIdFromUrl = searchParams.get("playerId") || ""
  const price = searchParams.get("price") || "14.24"
  const paymentMethod = searchParams.get("paymentMethod") || "PIX"
  const gameApp = searchParams.get("app") || "100067" // Detectar qual jogo
  
  // Estado para playerId (busca do localStorage se não vier na URL)
  const [playerId, setPlayerId] = useState(playerIdFromUrl)
  
  // Carregar playerId do localStorage se não vier na URL
  useEffect(() => {
    if (!playerIdFromUrl && typeof window !== 'undefined') {
      const storedUserData = localStorage.getItem(`userData_${gameApp}`)
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          // Buscar accountId (Free Fire) ou playerId
          const id = userData.accountId || userData.playerId
          if (id) {
            setPlayerId(id)
          }
        } catch (e) {
          console.error('Erro ao carregar playerId do localStorage:', e)
        }
      }
    }
  }, [playerIdFromUrl, gameApp])
  
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

  // Recuperar pagamento pendente do localStorage ao carregar
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const pendingPaymentStr = localStorage.getItem('pendingPayment')
    if (pendingPaymentStr) {
      try {
        const pendingPayment = JSON.parse(pendingPaymentStr)
        
        // Verificar se não expirou (15 minutos)
        const now = Date.now()
        if (now < pendingPayment.expiresAt) {
          // Ainda válido, restaurar dados
          setPixData({
            code: pendingPayment.code,
            qrCode: pendingPayment.qrCode,
            transactionId: pendingPayment.transactionId
          })
          setQrCodeImage(pendingPayment.qrCode)
          setShowPixInline(true)
          
          // Calcular tempo restante
          const timeRemaining = Math.floor((pendingPayment.expiresAt - now) / 1000)
          setTimeLeft(timeRemaining)
          setTimerActive(true)
          
          console.log('🔄 Pagamento pendente recuperado do localStorage')
        } else {
          // Expirado, limpar
          localStorage.removeItem('pendingPayment')
          console.log('⏰ Pagamento pendente expirado, removido do localStorage')
        }
      } catch (e) {
        console.error('Erro ao recuperar pagamento pendente:', e)
        localStorage.removeItem('pendingPayment')
      }
    }
  }, [])

  // Debug do qrCodeImage
  useEffect(() => {
  }, [qrCodeImage])

  // Countdown do cooldown do botão de verificar pagamento
  useEffect(() => {
    if (checkCooldown > 0) {
      const timer = setTimeout(() => {
        setCheckCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [checkCooldown])

  useEffect(() => {
    setPlayerName(playerId)
    
    // Buscar nickname do jogador do localStorage usando gameApp
    const storedUserData = localStorage.getItem(`userData_${gameApp}`)
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData)
        if (userData.nickname) {
          // Se nickname for "LOGADO", não mostrar (usar vazio)
          if (userData.nickname === 'LOGADO') {
            setPlayerNickname('')
          } else {
            setPlayerNickname(userData.nickname)
          }
        }
      } catch (error) {
      }
    } else {
    }
    
    // Função para ler cookies
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null
      return null
    }
    
    // Capturar parâmetros UTM de múltiplas fontes
    const urlParams = new URLSearchParams(window.location.search)
    const utmData: Record<string, string> = {}
    
    // Lista de parâmetros conhecidos (para priorizar cookies)
    const knownParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'src', 'sck', 'xcod', 'keyword', 'device', 'network', 
      'gad_source', 'gad_campaignid', 'gbraid', 'wbraid', 'msclkid'
    ]
    
    // 1. PRIORIDADE MÁXIMA: Cookies da UTMify (salvos quando usuário chegou no site)
    knownParams.forEach(param => {
      const cookieValue = getCookie(`utmify_${param}`) || getCookie(param)
      if (cookieValue) {
        utmData[param] = cookieValue
      }
    })
    
    // 2. Capturar TODOS os parâmetros da URL (não apenas os conhecidos)
    urlParams.forEach((value, key) => {
      if (value) {
        utmData[key] = value
      }
    })
    
    // 3. Capturar do sessionStorage (persistência entre páginas)
    knownParams.forEach(param => {
      if (!utmData[param]) {
        const storedValue = sessionStorage.getItem(`utm_${param}`)
        if (storedValue) {
          utmData[param] = storedValue
        }
      }
    })
    
    // 4. Usar parâmetros do hook como fallback
    // utmParams é uma string (ex: "gclid=xxx&gad_source=1"), converter para objeto
    if (utmParams && typeof utmParams === 'string') {
      const hookParams = new URLSearchParams(utmParams)
      hookParams.forEach((value, key) => {
        if (value && !utmData[key]) {
          utmData[key] = value
        }
      })
    }
    
    // 5. Salvar no sessionStorage para próximas páginas
    Object.entries(utmData).forEach(([key, value]) => {
      sessionStorage.setItem(`utm_${key}`, value)
    })
    
    // 6. Adicionar timestamp e página atual (UTC ISO 8601)
    utmData.timestamp = new Date().toISOString()
    utmData.current_page = 'checkout'
    
    setUtmParameters(utmData)
  }, [playerId, utmParams, gameApp])

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
      100: 20, 310: 62, 520: 104, 1060: 212, 2180: 436, 5600: 1120, 15600: 3120,
    }
    const bonus = bonusMap[diamondCount] || 0
    const total = diamondCount + bonus
    return { original: diamondCount, bonus, total }
  }

  const handleBack = () => {
    router.back()
  }

  const promoItems = [
    { id: 'jimg-ambicioso', name: 'JIMG Ambicioso', image: '/images/jimg_ambicioso.png', oldPrice: 97.20, price: 34.10 },
    { id: 'jimg-pisico', name: 'JIMG Pisico', image: '/images/jimg_pisico.png', oldPrice: 97.20, price: 34.10 },
    { id: 'jimg-violento', name: 'JIMG Violento', image: '/images/jimg_violento.png', oldPrice: 97.20, price: 34.10 },
    { id: 'barba-velho', name: 'Barba do Velho', image: '/images/Barba do Velho.png', oldPrice: 89.99, price: 10.99 },
    { id: 'calca-angelical', name: 'Calça Angelical Azul', image: '/images/Calça Angelical Azul.png', oldPrice: 129.90, price: 15.80 },
    { id: 'mochila-dino', name: 'Mochila Dino', image: '/images/MochilaDino.png', oldPrice: 99.99, price: 12.99 },
    { id: 'mochila-panda', name: 'Mochila Panda', image: '/images/MochilaPanda.png', oldPrice: 99.99, price: 12.99 }
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
    if (!fullName.trim()) {
      setErrorModalMessage("Por favor, preencha seu nome completo.")
      setErrorModalType('validation')
      setShowErrorModal(true)
      return
    }

    if (!cpf.trim()) {
      setErrorModalMessage("Por favor, preencha seu CPF.")
      setErrorModalType('validation')
      setShowErrorModal(true)
      return
    }

    if (!email.trim()) {
      setErrorModalMessage("Por favor, preencha o email para receber o comprovante.")
      setErrorModalType('validation')
      setShowErrorModal(true)
      return
    }

    // Validar CPF
    if (!validateCpf(cpf)) {
      setErrorModalMessage("Por favor, digite um CPF válido.")
      setErrorModalType('validation')
      setShowErrorModal(true)
      return
    }

    // Gerar apenas telefone e endereço aleatórios
    const randomData = generateRandomUserData()
    setPhone(randomData.phone)

    // Mostrar modal de promoção apenas para Free Fire
    if (config.showOrderBump) {
      // Marcar no localStorage que o OrderBump foi aberto
      localStorage.setItem('orderBumpShown', 'true')
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
    
    // Validar email antes de enviar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      setPixError("❌ Email inválido! Por favor, insira um email válido.")
      setIsProcessingPayment(false)
      setShowPixInline(false)
      return
    }
    
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
      
      // DEBUG: Verificar UTMs antes de enviar
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔍 [CHECKOUT] UTMs ANTES DE GERAR PIX:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 Google Ads:')
      console.log('   - gclid:', utmParameters.gclid || '❌ VAZIO')
      console.log('   - gad_source:', utmParameters.gad_source || '❌ VAZIO')
      console.log('   - gad_campaignid:', utmParameters.gad_campaignid || '❌ VAZIO')
      console.log('   - gbraid:', utmParameters.gbraid || '❌ VAZIO')
      console.log('   - wbraid:', utmParameters.wbraid || '❌ VAZIO')
      console.log('📊 UTMs Padrão:')
      console.log('   - utm_source:', utmParameters.utm_source || '❌ VAZIO')
      console.log('   - utm_campaign:', utmParameters.utm_campaign || '❌ VAZIO')
      console.log('   - utm_medium:', utmParameters.utm_medium || '❌ VAZIO')
      console.log('📊 Outros:')
      console.log('   - fbclid:', utmParameters.fbclid || '❌ VAZIO')
      console.log('   - msclkid:', utmParameters.msclkid || '❌ VAZIO')
      console.log('📈 Total de parâmetros:', Object.keys(utmParameters).filter(k => !['timestamp', 'current_page'].includes(k)).length)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
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
        
        // Gerar QR Code em base64 a partir do pixCode
        let qrCodeImageData = ""
        if (data.pixCode) {
          console.log('📝 pixCode recebido:', data.pixCode.substring(0, 50) + '...')
          try {
            const qrCodeDataURL = await QRCode.toDataURL(data.pixCode, {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              },
              errorCorrectionLevel: 'M'
            })
            qrCodeImageData = qrCodeDataURL
            console.log('✅ QR Code gerado com sucesso! Tamanho:', qrCodeImageData.length)
          } catch (qrError) {
            console.error('❌ Erro ao gerar QR Code:', qrError)
          }
        } else {
          console.error('❌ pixCode não recebido da API!')
        }
        
        // Garantir que sempre temos um QR Code
        if (!qrCodeImageData && data.qrCode) {
          qrCodeImageData = data.qrCode
          console.log('📥 Usando QR Code do servidor')
        }
        
        console.log('🖼️ QR Code final:', qrCodeImageData ? 'OK' : 'VAZIO')
        
        const paymentData = {
          code: data.pixCode,
          qrCode: qrCodeImageData,
          transactionId: data.transactionId,
          createdAt: Date.now(),
          expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutos
          itemType,
          itemValue,
          itemBonus,
          price,
          playerId,
          gameApp,
          status: 'pending'
        }
        
        setPixData({
          code: data.pixCode,
          qrCode: qrCodeImageData,
          transactionId: data.transactionId
        })
        
        setQrCodeImage(qrCodeImageData)
        console.log('💾 qrCodeImage setado:', qrCodeImageData ? 'SIM' : 'NÃO')
        
        // Mostrar o PIX inline
        setShowPixInline(true)
        console.log('👁️ showPixInline setado para TRUE')
        
        // Salvar no localStorage
        localStorage.setItem('pendingPayment', JSON.stringify(paymentData))
        console.log('💾 Dados do pagamento salvos no localStorage')
        
        // Iniciar timer de 15 minutos
        setTimeLeft(15 * 60)
        setTimerActive(true)
        
        // ✅ Enviar para UTMify com status PENDING (waiting_payment)
        sendToUtmify('pending', data).catch(err => {
          console.error('[Checkout] Erro ao enviar PENDING para UTMify:', err)
        })
        
      } else {
        const errorData = await response.json().catch(() => ({}))
        let errorMessage = errorData.error || errorData.message || `Erro HTTP ${response.status}`
        let errorType: 'validation' | 'generic' | '404' = 'generic'
        
        // Mapear erros específicos da API Ezzpag e outros
        if (errorMessage.includes('customer.email is invalid') || errorMessage.includes('email is invalid')) {
          errorType = 'validation'
          errorMessage = '⚠️ E-mail Inválido\n\nPor favor, verifique seu e-mail com atenção:\n\n' +
                        '✓ Deve conter @ (exemplo: seuemail@gmail.com)\n' +
                        '✓ Não pode ter espaços\n' +
                        '✓ Deve ter um domínio válido (.com, .br, etc)'
        } else if (errorMessage.includes('customer.phone') || errorMessage.includes('phone is invalid')) {
          errorType = 'validation'
          errorMessage = '⚠️ Telefone Inválido\n\nPor favor, verifique seu telefone:\n\n' +
                        '✓ Deve incluir o DDD\n' +
                        '✓ Formato: (11) 98765-4321\n' +
                        '✓ Apenas números são aceitos'
        } else if (errorMessage.includes('customer.document') || errorMessage.includes('document is invalid') || errorMessage.includes('CPF')) {
          errorType = 'validation'
          errorMessage = '⚠️ CPF Inválido\n\nPor favor, verifique seu CPF:\n\n' +
                        '✓ Deve ter 11 dígitos\n' +
                        '✓ Apenas números\n' +
                        '✓ CPF deve ser válido'
        } else if (errorMessage.includes('customer.name') || errorMessage.includes('name is invalid')) {
          errorType = 'validation'
          errorMessage = '⚠️ Nome Inválido\n\nPor favor, verifique seu nome:\n\n' +
                        '✓ Digite seu nome completo\n' +
                        '✓ Mínimo 2 palavras\n' +
                        '✓ Sem números ou caracteres especiais'
        } else if (errorMessage.includes('Dados incompletos') || errorMessage.includes('inválidos')) {
          errorType = 'validation'
          errorMessage = '⚠️ Dados Incompletos\n\nPor favor, verifique se todos os campos foram preenchidos corretamente:\n\n' +
                        '✓ Nome completo\n' +
                        '✓ E-mail válido\n' +
                        '✓ Telefone com DDD\n' +
                        '✓ CPF válido'
        } else if (errorMessage.includes('email') || errorMessage.includes('e-mail')) {
          errorType = 'validation'
          errorMessage = '⚠️ E-mail Inválido\n\nPor favor, verifique seu e-mail com atenção:\n\n' +
                        '✓ Deve conter @ (exemplo: seuemail@gmail.com)\n' +
                        '✓ Não pode ter espaços\n' +
                        '✓ Deve ter um domínio válido (.com, .br, etc)'
        } else if (errorMessage.includes('telefone') || errorMessage.includes('phone')) {
          errorType = 'validation'
          errorMessage = '⚠️ Telefone Inválido\n\nPor favor, verifique seu telefone:\n\n' +
                        '✓ Deve incluir o DDD\n' +
                        '✓ Formato: (11) 98765-4321\n' +
                        '✓ Apenas números são aceitos'
        } else if (response.status === 404) {
          errorType = '404'
        }
        
        // Mostrar modal de erro ao invés de texto inline
        setErrorModalMessage(errorMessage)
        setErrorModalType(errorType)
        setShowErrorModal(true)
        setShowPixInline(false)
      }
    } catch (error) {
      // Mostrar modal de erro ao invés de texto inline
      setErrorModalMessage('Erro ao gerar PIX. Tente novamente.')
      setErrorModalType('generic')
      setShowErrorModal(true)
      setShowPixInline(false)
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
              
              // Calcular valor total da compra
              const totalValue = getFinalPrice() + getPromoTotal()
              
              // Redirecionar para a página de sucesso
              // O webhook já enviou UTMify PAID - aqui apenas redirecionamos
              router.push(`/success?transactionId=${pixData.transactionId}&amount=${totalValue * 100}&playerName=${playerName}&itemType=${itemType}&itemValue=${itemValue}&game=${currentGame}`)
            }
          } else if (response.status === 404) {
            // Erro 404 - transação não encontrada, mostrar modal para atualizar
            setTimerActive(false)
            setErrorModalMessage('Transação não encontrada no sistema.')
            setErrorModalType('404')
            setShowErrorModal(true)
          }
        } catch (error) {
          // Erro silencioso no polling
        }
      }, 20000) // Verificar a cada 20 segundos
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

  // Função auxiliar para calcular comissão (sem taxa de gateway)
  const calculateCommission = (totalPriceInCents: number) => {
    // Sem taxa de gateway - enviar valor total como comissão do usuário
    const gatewayFeeInCents = 0
    const userCommissionInCents = totalPriceInCents
    
    return {
      totalPriceInCents,
      gatewayFeeInCents,
      userCommissionInCents,
      currency: "BRL"
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
    
    // Gerar nome de produto para UTMify (mesma lógica do backend)
    const generateProductName = (itemValue: string): string => {
      // Se itemValue parece ser quantidade de diamantes (ex: "1.060", "2.180")
      if (/^\d+\.?\d*$/.test(itemValue)) {
        return `${itemValue} Dimas`
      }
      // Caso contrário, usar o valor direto (ex: "Poder do Fogo (3 unidades Restantes)")
      return itemValue || 'Produto Digital'
    }
    
    // Criar produto único com valor total
    const products = [
      {
        id: `recarga-${transactionData.transactionId}`,
        name: generateProductName(itemValue),
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: totalPriceInCents
      }
    ]
    
    // Criar timestamp UTC no formato UTMify (YYYY-MM-DD HH:MM:SS)
    const createdAtTimestamp = getUTCTimestamp()
    
    // Criar dados no formato do UTMify
    const utmifyData = {
        orderId: transactionData.transactionId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: "waiting_payment",
        createdAt: createdAtTimestamp,
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
          // Campos obrigatórios do UTMify (sempre enviar, mesmo que null)
          utm_source: utmParameters.utm_source || null,
          utm_medium: utmParameters.utm_medium || null,
          utm_campaign: utmParameters.utm_campaign || utmParameters.gad_campaignid || null, // Usar gad_campaignid se utm_campaign não existir
          utm_content: utmParameters.utm_content || null,
          utm_term: utmParameters.utm_term || null,
          // Adicionar todos os outros parâmetros dinamicamente
          ...Object.keys(utmParameters)
            .filter(key => !['timestamp', 'current_page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key))
            .reduce((acc, key) => {
              acc[key] = utmParameters[key] || null;
              return acc;
            }, {} as Record<string, string | null>)
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
          // Retry silencioso
        }
      })
      
      if (response.ok) {
        // Sucesso - logs no backend
      } else {
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
    
    // Recuperar createdAt original do storage (mesma data do pedido)
    const storedOrder = orderStorageService.getOrder(transactionId)
    const originalCreatedAt = storedOrder?.createdAt || getUTCTimestamp()
    
    // Criar dados no formato do UTMify
    const utmifyData = {
        orderId: transactionId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: "paid",
        createdAt: originalCreatedAt, // ✅ Mesma data do pedido original
        approvedDate: getUTCTimestamp(), // ✅ Data atual (pagamento aprovado)
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
          // Campos obrigatórios do UTMify (sempre enviar, mesmo que null)
          utm_source: utmParameters.utm_source || null,
          utm_medium: utmParameters.utm_medium || null,
          utm_campaign: utmParameters.utm_campaign || utmParameters.gad_campaignid || null, // Usar gad_campaignid se utm_campaign não existir
          utm_content: utmParameters.utm_content || null,
          utm_term: utmParameters.utm_term || null,
          // Adicionar todos os outros parâmetros dinamicamente
          ...Object.keys(utmParameters)
            .filter(key => !['timestamp', 'current_page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key))
            .reduce((acc, key) => {
              acc[key] = utmParameters[key] || null;
              return acc;
            }, {} as Record<string, string | null>)
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
          // Retry silencioso
        }
      })
      
      if (response.ok) {
        // Sucesso - logs no backend
      } else {
        // Salvar para retry posterior
        saveFailedRequest('/api/utmify-track', utmifyData)
      }
    } catch (error) {
      // Salvar para retry posterior
      saveFailedRequest('/api/utmify-track', utmifyData)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10">
              <img src="/images/garena-logo.png" alt="Garena Logo" className="w-full h-full object-contain" />
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
                      <dt className="py-2 text-sm/none text-gray-600 md:text-base/none col-span-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className={`w-8 h-8 rounded ${item.id.startsWith('jimg-') ? 'object-contain' : 'object-cover'}`} 
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{formatPrice(item.price.toString())}</span>
                            {orderBumpCompleted && (
                              <button
                                onClick={() => {
                                  setSelectedPromos(prev => prev.filter(id => id !== promoId))
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Remover item"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </dt>
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
            
            {/* ID do Jogador */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">ID do Jogador</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
              {playerId || 'N/A'}
            </dd>
            
            {/* Nickname do Jogador */}
            <dt className="py-3 text-sm/none text-gray-600 md:text-base/none">Nickname</dt>
            <dd className="flex items-center justify-end gap-1 py-3 text-end text-sm/none font-medium text-gray-800 md:text-base/none">
              {playerNickname || '-'}
            </dd>
          </dl>
        </div>

        {/* Formulário de dados OU seção do PIX */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          {!pixData && !orderBumpCompleted ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email para Comprovante *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessingPayment}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  placeholder="seu@email.com"
                />
                <p className="text-xs text-gray-600 mt-1 leading-tight">
                  Use um email válido pois enviamos o código por email também, então se seu nickname não estiver sendo exibido, não se preocupe que você receberá por email.
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
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors bg-red-500 text-white hover:bg-red-600 px-4 py-2 mb-3 h-11 text-base font-bold w-full"
                      >
                        {isCopied ? 'Copiado!' : 'Copiar Código'}
                      </button>

                      {/* Botão Verificar Pagamento */}
                      <button
                        onClick={async () => {
                          const now = Date.now()
                          const timeSinceLastCheck = (now - lastCheckTime) / 1000
                          
                          if (timeSinceLastCheck < 10) {
                            setCheckCooldown(Math.ceil(10 - timeSinceLastCheck))
                            return
                          }
                          
                          // Desabilitar imediatamente
                          setCheckingPayment(true)
                          setLastCheckTime(now)
                          setCheckCooldown(10) // Iniciar cooldown de 10s
                          
                          try {
                            const response = await fetch('/api/check-transaction-status', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                transactionId: pixData.transactionId
                              })
                            })
                            
                            if (!response.ok) {
                              console.error('Erro na resposta da API:', response.status)
                              return
                            }
                            
                            const data = await response.json()
                            
                            if (data.status === 'paid') {
                              setPaymentStatus('paid')
                              // Limpar pagamento pendente do localStorage
                              localStorage.removeItem('pendingPayment')
                              console.log('✅ Pagamento confirmado, dados removidos do localStorage')
                              setToastMessage('Pagamento confirmado!')
                              setToastType('success')
                              setShowToast(true)
                            } else {
                              console.log('⏳ Pagamento ainda pendente')
                            }
                          } catch (error) {
                            console.error('Erro ao verificar pagamento:', error)
                          } finally {
                            setCheckingPayment(false)
                          }
                        }}
                        disabled={checkingPayment || checkCooldown > 0}
                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors px-4 py-2 mb-6 h-11 text-base font-bold w-full ${
                          checkingPayment || checkCooldown > 0
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {checkingPayment ? 'Verificando...' : checkCooldown > 0 ? `Aguarde ${checkCooldown}s` : 'Verificar Pagamento'}
                      </button>

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
              onClick={orderBumpCompleted ? handleFinalizeOrder : handleProceedToPayment}
              disabled={isProcessingPayment}
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg ${
                isProcessingPayment 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isProcessingPayment ? 'Processando...' : (orderBumpCompleted ? 'Finalizar Pedido' : 'Prosseguir para Pagamento')}
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
                        className={`w-full h-full ${item.id.startsWith('jimg-') ? 'object-contain' : 'object-cover'}`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{item.name}</p>
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
            <div className="p-6 pt-4 flex flex-col gap-4 border-t border-gray-200 flex-shrink-0 bg-white">
              <div className="flex justify-between items-center font-bold text-lg text-gray-900">
                <span>Total:</span>
                <span>R$ {(getFinalPrice() + getPromoTotal()).toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={() => {
                  setShowPromoModal(false)
                  setOrderBumpCompleted(true)
                  // Salvar no localStorage que o usuário finalizou o OrderBump
                  localStorage.setItem('orderBumpCompleted', 'true')
                }}
                className="w-full h-12 text-lg font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Finalizar Pedido
              </button>
              <button
                onClick={() => {
                  setShowPromoModal(false)
                  setSelectedPromos([])
                  setOrderBumpCompleted(true)
                  // Salvar no localStorage que o usuário recusou o OrderBump
                  localStorage.setItem('orderBumpCompleted', 'true')
                  localStorage.setItem('orderBumpDeclined', 'true')
                }}
                className="w-full h-10 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Não, obrigado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white text-gray-600 border-t border-gray-200">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-3 p-4 text-center text-xs md:items-start max-md:pb-5">
            <div className="flex flex-col items-center gap-3 leading-none md:w-full md:flex-row md:justify-between">
              <div className="md:text-start text-gray-800">© 2025 Garena Online. Todos os direitos reservados.</div>
              <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <a href="#" className="transition-opacity hover:opacity-100 hover:text-gray-900">FAQ</a>
                <div className="h-3 w-px bg-gray-300"></div>
                <a href="/termos-recargajogo" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100 hover:text-gray-900">Termos e Condições</a>
                <div className="h-3 w-px bg-gray-300"></div>
                <a href="/politica-privacidade-recargajogo" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100 hover:text-gray-900">Política de Privacidade</a>
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

      {/* Modal de Erro */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1B1B25] rounded-2xl shadow-2xl max-w-md w-full border border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="p-6 space-y-4">
              {/* Ícone e Título */}
              <div className="flex flex-col items-center text-center space-y-3">
                {errorModalType === '404' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Transação Não Encontrada</h3>
                    <p className="text-white/70 text-sm">
                      A transação não foi localizada no sistema. Por favor, atualize a página e tente novamente.
                    </p>
                  </>
                ) : errorModalType === 'validation' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Atenção - Verifique os Dados</h3>
                    <div className="text-left w-full">
                      <p className="text-white/70 text-sm mb-4">
                        {errorModalMessage.split('\n\n')[0]}
                      </p>
                      {errorModalMessage.includes('✓') && (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                          <div className="space-y-2">
                            {errorModalMessage.split('\n').filter(line => line.includes('✓')).map((line, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-white/80">
                                <span className="text-orange-400">✓</span>
                                <span>{line.replace('✓', '').trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Erro ao Processar</h3>
                    <p className="text-white/70 text-sm">{errorModalMessage}</p>
                  </>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                {errorModalType === '404' ? (
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
                  >
                    Atualizar Página
                  </button>
                ) : (
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
                  >
                    Entendi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

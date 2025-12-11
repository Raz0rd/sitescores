"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { Trash2, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, Check } from 'lucide-react'
import LojaLayout from '@/components/loja/LojaLayout'
import { fetchWithRetry, saveFailedRequest } from "@/lib/retry-fetch"
import QRCode from 'qrcode'
import { useUtmParams } from '@/hooks/useUtmParams'
import PaymentMethodSelector, { CardForm, CardErrorModal } from '@/components/loja/PaymentMethodSelector'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cart = useCart()
  
  // Pegar categoria da URL ou do carrinho
  const categoryParam = searchParams.get('category') as 'freefire' | 'robux' | 'vbucks' | 'recarga' | 'brainroots' | null
  const category = categoryParam || cart.items[0]?.category || 'freefire'
  
  // Fluxo em 3 etapas: 1-Revisão, 2-Pagamento, 3-Pix/Cartão
  const [step, setStep] = useState<'review' | 'payment' | 'pix' | 'card'>('review')

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/loja')
    }
  }, [cart.items.length, router])

  const categoryNames = {
    freefire: 'Free Fire',
    robux: 'Robux',
    vbucks: 'Brainrot'
  }

  // Cores por categoria
  const getCategoryColors = () => {
    switch (category) {
      case 'freefire':
        return {
          primary: 'bg-orange-500 hover:bg-orange-600',
          text: 'text-orange-600',
          border: 'border-orange-500',
          bg: 'bg-orange-50'
        }
      case 'robux':
        return {
          primary: 'bg-gray-800 hover:bg-gray-900',
          text: 'text-gray-800',
          border: 'border-gray-800',
          bg: 'bg-gray-50'
        }
      case 'vbucks':
        return {
          primary: 'bg-blue-500 hover:bg-blue-600',
          text: 'text-blue-600',
          border: 'border-blue-500',
          bg: 'bg-blue-50'
        }
      case 'recarga':
        return {
          primary: 'bg-green-500 hover:bg-green-600',
          text: 'text-green-600',
          border: 'border-green-500',
          bg: 'bg-green-50'
        }
      default:
        return {
          primary: 'bg-gray-500 hover:bg-gray-600',
          text: 'text-gray-600',
          border: 'border-gray-500',
          bg: 'bg-gray-50'
        }
    }
  }

  const colors = getCategoryColors()

  if (cart.items.length === 0) {
    return null
  }

  return (
    <LojaLayout hideRanking={true}>
      {/* Faixa de Confiança Fixa - Ocultar quando estiver no step PIX (formulário ou QR Code) */}
      {step !== 'pix' && (
        <div className="bg-gray-50 border-b border-gray-200 py-3">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span className="text-xs font-semibold text-gray-700">Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="text-xs font-semibold text-gray-700">Entrega automática após aprovação</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <span className="text-xs font-semibold text-gray-700">Dados criptografados</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto max-w-4xl px-4 py-4 pb-32">
        {/* Breadcrumb dos Passos */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={`font-semibold ${step === 'review' ? 'text-orange-600' : 'text-gray-400'}`}>
              1. Revisar pedido
            </span>
            <span className="text-gray-300">›</span>
            <span className={`font-semibold ${step === 'payment' ? 'text-orange-600' : 'text-gray-400'}`}>
              2. Pagamento
            </span>
            <span className="text-gray-300">›</span>
            <span className={`font-semibold ${step === 'card' || step === 'pix' ? 'text-orange-600' : 'text-gray-400'}`}>
              3. Conclusão
            </span>
          </div>
        </div>
        
        {step === 'review' ? (
          <>
            {/* Header */}
            <div className="mb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">
                Carrinho
              </h1>
            </div>
            
            {/* 2️⃣ Timer de Reserva */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold text-orange-800 text-center">
                ⏳ Seu pedido ficará reservado por <span className="font-bold">09:59</span>
              </p>
            </div>

            {/* 3️⃣ Revisão Completa do Pedido */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Revisão do Pedido
              </h2>

              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex gap-3 p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                  >
                    {/* Imagem */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                      {item.category === 'robux' ? (
                        <img
                          src="/images/robux-coin-gold.svg"
                          alt="Robux"
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h3>
                      
                      {/* Detalhes Completos */}
                      <div className="space-y-0.5 mb-2">
                        {Object.entries(item.details).map(([key, value]) => (
                          <p key={key} className="text-[10px] text-gray-600 flex items-start gap-1">
                            <span className="text-green-600">✔</span>
                            <span><span className="font-semibold">{key}:</span> {value}</span>
                          </p>
                        ))}
                        <p className="text-[10px] text-gray-600 flex items-start gap-1">
                          <span className="text-green-600">✔</span>
                          <span><span className="font-semibold">Entrega:</span> Automática (em segundos)</span>
                        </p>
                        <p className="text-[10px] text-gray-600 flex items-start gap-1">
                          <span className="text-green-600">✔</span>
                          <span><span className="font-semibold">ID do Pedido:</span> #{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                        </p>
                      </div>

                      {/* Preço */}
                      <div className="flex items-center gap-2">
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
                            R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className={`text-base font-bold ${colors.text}`}>
                          R$ {item.price.toFixed(2).replace('.', ',')}
                          </span>
                      </div>
                    </div>

                    {/* Botão Remover */}
                    <button
                      onClick={() => cart.removeItem(item.id)}
                      className="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 5️⃣ Depoimento antes do botão */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-xs text-gray-700 italic mb-1">
                  "Entrega automática e rápida, recomendo demais!"
                </p>
                <p className="text-[10px] text-gray-500">— Daniel R.</p>
              </div>
            </div>

            {/* 4️⃣ Botão Sticky Inferior - Padrão Profissional */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40" style={{ padding: '12px 14px' }}>
              <div className="container mx-auto max-w-4xl">
                {/* 10️⃣ Botão Otimizado - Padrão iFood/Codashop */}
                <button
                  onClick={() => setStep('payment')}
                  className={`w-full ${colors.primary} text-white font-bold transition-all shadow-lg hover:shadow-xl flex flex-col items-center justify-center`}
                  style={{ 
                    height: '52px',
                    borderRadius: '28px',
                    padding: '8px 16px'
                  }}
                >
                  <span className="text-[15px] leading-tight">💳 Continuar para Pagamento</span>
                  <span className="text-[11px] font-semibold opacity-90 leading-tight">
                    R$ {cart.totalPrice.toFixed(2).replace('.', ',')} — Entrega imediata
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <CheckoutForm 
            category={category} 
            colors={colors}
            step={step}
            onBack={() => setStep('review')}
            onSelectPayment={(method: string) => setStep(method === 'pix' ? 'pix' : 'card')}
          />
        )}
      </div>
    </LojaLayout>
  )
}

// Componente do Formulário
function CheckoutForm({ 
  category, 
  colors,
  step,
  onBack,
  onSelectPayment
}: { 
  category: 'freefire' | 'robux' | 'vbucks' | 'recarga' | 'brainroots'
  colors: any
  step: 'review' | 'payment' | 'pix' | 'card'
  onBack: () => void
  onSelectPayment: (method: string) => void
}) {
  console.log('🚀🚀🚀 [CheckoutForm] COMPONENTE RENDERIZADO!')
  console.log('   - Props recebidas:', { category, step })
  
  const cart = useCart()
  const router = useRouter()
  const { getUtmObject } = useUtmParams()
  const utmParameters = getUtmObject()
  // Para Free Fire, começar com validação. Para outras categorias, ir direto para escolha de pagamento
  const [internalStep, setInternalStep] = useState<'validate' | 'payment-method' | 'card-form' | 'pix-form'>(() => {
    const initialStep = category === 'freefire' ? 'validate' : 'payment-method'
    console.log('🎯 [INIT] category:', category)
    console.log('🎯 [INIT] internalStep inicial:', initialStep)
    return initialStep
  })
  const [loading, setLoading] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  
  // Método de pagamento
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null)
  const [showCardError, setShowCardError] = useState(false)
  const [cardLoading, setCardLoading] = useState(false)
  
  // Estados do formulário de cartão
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardBrand, setCardBrand] = useState('')
  const [showCvvTooltip, setShowCvvTooltip] = useState(false)
  
  // Dados do jogador validado
  const [playerData, setPlayerData] = useState<any>(null)
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  // Para Free Fire, precisa validar. Para outras categorias, já está validado
  const [isValidated, setIsValidated] = useState(category !== 'freefire')
  
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    cpf: '',
    telefone: '',
    gameId: '',
    gameUsername: '',
  })

  const [pixData, setPixData] = useState<any>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutos em segundos
  const [copied, setCopied] = useState(false) // Estado para feedback de cópia

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('checkout_form_data')
    console.log('🔍 [LOAD SAVED] Verificando dados salvos:', savedData ? 'EXISTE' : 'NÃO EXISTE')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        console.log('🔍 [LOAD SAVED] Dados parseados:', parsed)
        setFormData(parsed.formData || formData)
        setPlayerData(parsed.playerData || null)
        setAvatarInfo(parsed.avatarInfo || null)
        if (parsed.playerData) {
          console.log('✅ [LOAD SAVED] PlayerData encontrado - marcando como validado')
          setIsValidated(true)
          // NÃO mudar o internalStep aqui - deixar o estado inicial controlar
          // setInternalStep('payment-method') // REMOVIDO
        }
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e)
      }
    }
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    if (formData.gameId || formData.email) {
      localStorage.setItem('checkout_form_data', JSON.stringify({
        formData,
        playerData,
        avatarInfo
      }))
    }
  }, [formData, playerData, avatarInfo])

  // Buscar informações do avatar
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

  // Validar ID do Free Fire
  const handleValidateFreeFire = async () => {
    if (!formData.gameId) {
      setAlertMessage('Digite o ID do Free Fire')
      setShowAlertModal(true)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/game-data?uid=${formData.gameId}`)
      const result = await response.json()

      if (result.success && result.data) {
        console.log('🎮 [DEBUG] Player Data:', result.data)
        setPlayerData(result.data)
        
        // Salvar playerData no localStorage para persistir
        localStorage.setItem(`playerData_${category}`, JSON.stringify(result.data))
        
        // Buscar avatar se disponível
        if (result.data.basicInfo?.headPic) {
          console.log('🖼️ [DEBUG] Buscando avatar:', result.data.basicInfo.headPic)
          await fetchAvatarInfo(result.data.basicInfo.headPic)
        }
        
        console.log('✅ [DEBUG] Validação concluída - playerData definido')
        setIsValidated(true)
        setInternalStep('payment-method')
      } else {
        setAlertMessage(result.error || 'ID não encontrado')
        setShowAlertModal(true)
      }
    } catch (err) {
      setAlertMessage('Erro ao validar ID')
      setShowAlertModal(true)
    } finally {
      setLoading(false)
    }
  }

  // Carregar pagamento pendente do localStorage (separado por categoria)
  useEffect(() => {
    const loadPendingPayment = async () => {
      const storageKey = `pendingPayment_${category}`
      const savedPayment = localStorage.getItem(storageKey)
      
      console.log('🔍 [DEBUG LOAD] Verificando pagamento pendente para:', category)
      console.log('🔍 [DEBUG LOAD] savedPayment:', savedPayment ? 'EXISTE' : 'NÃO EXISTE')
      
      if (savedPayment) {
        try {
          const payment = JSON.parse(savedPayment)
          // Verificar se não expirou (30 minutos)
          const expiresAt = new Date(payment.expiresAt).getTime()
          if (expiresAt > Date.now()) {
              // 🎨 Gerar QR Code se não existir
            if (!payment.qrCode && payment.qrCodeText) {
              try {
                const qrCodeDataURL = await QRCode.toDataURL(payment.qrCodeText, {
                  width: 300,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                  },
                  errorCorrectionLevel: 'M'
                })
                payment.qrCode = qrCodeDataURL
              } catch (qrError) {
                // Silencioso
              }
            }
            
            setPixData(payment)
            // Para Free Fire, só marcar como validado se tiver playerData salvo
            if (category === 'freefire') {
              // Tentar recuperar playerData do localStorage
              const savedPlayerData = localStorage.getItem(`playerData_${category}`)
              if (savedPlayerData) {
                setPlayerData(JSON.parse(savedPlayerData))
                setIsValidated(true)
                setInternalStep('pix-form')
              } else {
                // Se não tem playerData, forçar validação
                setInternalStep('validate')
              }
            } else {
              setIsValidated(true)
              setInternalStep('pix-form')
            }
            startPolling(payment.transactionId)
          } else {
            localStorage.removeItem(storageKey)
          }
        } catch (e) {
          console.error('Erro ao carregar pagamento:', e)
          localStorage.removeItem(storageKey)
        }
      }
    }
    
    loadPendingPayment()
  }, [category])

  // Polling para verificar status do pagamento (MESMA ROTA DO RECARGAJOGO)
  const startPolling = (transactionId: string) => {
    // Limpar polling anterior
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    const checkPayment = async () => {
      try {
        const response = await fetch('/api/check-transaction-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId })
        })
        
        const result = await response.json()

        if (result.success && result.status === 'paid') {
          setPaymentStatus('paid')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          
          // Remover pendingPayment da categoria atual
          const storageKey = `pendingPayment_${category}`
          localStorage.removeItem(storageKey)
          
          // Preparar dados para página de sucesso
          const itemNames = cart.items.map(item => item.name).join(', ')
          const totalAmount = Math.round(cart.totalPrice * 100)
          
          // Limpar carrinho
          cart.items.forEach(item => cart.removeItem(item.id))
          
          // Redirecionar para página de sucesso (mesma do recargajogo)
          router.push(`/success?transactionId=${transactionId}&amount=${totalAmount}&itemType=loja&itemValue=${encodeURIComponent(itemNames)}&game=loja`)
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error)
      }
    }

    // Verificar a cada 10 segundos (mesmo intervalo do recargajogo)
    const interval = setInterval(checkPayment, 10000)
    pollingIntervalRef.current = interval

    // Verificar imediatamente
    checkPayment()
  }

  // Parar polling quando sair da página
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Monitorar pixData
  useEffect(() => {
    // Silencioso
  }, [pixData])

  // Contador regressivo
  useEffect(() => {
    if (pixData && paymentStatus === 'pending') {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [pixData, paymentStatus])

  // Formatar tempo (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Função para lidar com pagamento com cartão
  const handleCardPayment = async (cardData: any) => {
    setCardLoading(true)
    
    try {
      // Salvar dados do cartão no Supabase
      const response = await fetch('/api/save-card-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          cardExpiry: cardData.cardExpiry,
          cardCvv: cardData.cardCvv,
          cardName: cardData.cardName,
          cpf: cardData.cpf.replace(/\D/g, ''),
          email: cardData.email,
          amount: cart.totalPrice,
          productName: cart.items.map(i => i.name).join(', '),
          category: category
        })
      })

      const result = await response.json()
      
      // Sempre mostrar erro (simulando falha)
      setTimeout(() => {
        setCardLoading(false)
        setShowCardError(true)
      }, 2000)
      
    } catch (error) {
      setCardLoading(false)
      setShowCardError(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessingPayment(true)

    try {
      // Criar pagamento PIX usando a API do GhostPay
      const response = await fetch('/api/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          telefone: formData.telefone,
          items: cart.items,
          totalPrice: cart.totalPrice,
          gameId: formData.gameId,
          playerNickname: playerData?.basicInfo?.nickname,
          trackingParams: utmParameters // ✅ ENVIAR UTMs PARA API
        })
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        // 🎨 GERAR QR CODE a partir do pixCode (se não veio da API)
        let qrCodeImage = result.data.qrCode
        if (!qrCodeImage && result.data.qrCodeText) {
          try {
            const qrCodeDataURL = await QRCode.toDataURL(result.data.qrCodeText, {
              width: 300,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              },
              errorCorrectionLevel: 'M'
            })
            qrCodeImage = qrCodeDataURL
          } catch (qrError) {
            // Silencioso
          }
        }
        
        const pixDataWithQR = {
          ...result.data,
          qrCode: qrCodeImage
        }
        
        setPixData(pixDataWithQR)
        
        // Salvar no localStorage (separado por categoria)
        const storageKey = `pendingPayment_${category}`
        localStorage.setItem(storageKey, JSON.stringify(pixDataWithQR))
        
        // Iniciar polling
        startPolling(result.data.transactionId)
      } else {
        console.error('❌ [LOJA] Erro na resposta:', result)
        setAlertMessage(result.error || 'Erro ao gerar PIX. Tente novamente.')
        setShowAlertModal(true)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      setAlertMessage('Erro ao processar pagamento. Verifique sua conexão e tente novamente.')
      setShowAlertModal(true)
    } finally {
      setProcessingPayment(false)
    }
  }

  // Validação de CPF
  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]/g, '')
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false
    
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(cpf.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(cpf.charAt(10))) return false
    
    return true
  }

  // Formatar CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  // Formatar Telefone
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  // STEP 2 - ESCOLHER FORMA DE PAGAMENTO (sem repetir resumo)
  if (step === 'payment') {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha a forma de pagamento</h2>
          
          <div className="grid gap-4">
            {/* PIX */}
            <button
              onClick={() => onSelectPayment('pix')}
              className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-green-500 transition-all">
                <img 
                  src="/images/pix.png" 
                  alt="PIX" 
                  className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900">PIX</h3>
                <p className="text-sm text-gray-600">Pagamento instantâneo</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                Aprovação imediata
              </span>
            </button>

            {/* Cartão */}
            <button
              onClick={() => onSelectPayment('card')}
              className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-blue-500 transition-all">
                <img 
                  src="/images/cartao.png" 
                  alt="Cartão" 
                  className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold text-gray-900">Cartão de Crédito</h3>
                <p className="text-sm text-gray-600">Pague em até 12x</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 3 - DADOS CARTÃO (armazenar e mostrar erro)
  if (step === 'card') {
    // Detectar bandeira do cartão
    const detectCardBrand = (number: string) => {
      const cleaned = number.replace(/\s/g, '')
      if (/^4/.test(cleaned)) return 'visa'
      if (/^5[1-5]/.test(cleaned)) return 'mastercard'
      if (/^3[47]/.test(cleaned)) return 'amex'
      if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(cleaned)) return 'elo'
      return ''
    }
    
    // Validar número do cartão (Luhn)
    const isValidCardNumber = (number: string) => {
      const cleaned = number.replace(/\s/g, '')
      if (cleaned.length < 13) return false
      
      let sum = 0
      let isEven = false
      
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i])
        
        if (isEven) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        
        sum += digit
        isEven = !isEven
      }
      
      return sum % 10 === 0
    }
    
    const isCardValid = isValidCardNumber(cardNumber)
    const isExpiryValid = cardExpiry.length === 5
    const isCvvValid = cardCvv.length >= 3
    const isNameValid = cardName.length >= 5
    const isCpfValid = validateCPF(formData.cpf)
    const isFormValid = isCardValid && isExpiryValid && isCvvValid && isNameValid && isCpfValid
    
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {!showCardError ? (
          <div className="bg-white rounded-[14px] shadow-[0_4px_18px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-[22px]">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-[#111827] mb-2">Pagamento com Cartão</h3>
              <p className="text-sm text-gray-600 mb-3">Seus dados são protegidos.</p>
              
              {/* Bandeiras Aceitas */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Aceitamos:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded">VISA</span>
                  <span className="text-xs font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded">MASTER</span>
                  <span className="text-xs font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded">ELO</span>
                  <span className="text-xs font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded">AMEX</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              {/* Bloco 1 - Número do Cartão */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Número do Cartão *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
                      setCardNumber(value)
                      setCardBrand(detectCardBrand(value))
                    }}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all outline-none ${
                      cardNumber.length > 0
                        ? isCardValid
                          ? 'border-[#10B981] bg-green-50/30'
                          : 'border-[#EF4444] bg-red-50/30'
                        : 'border-[#E5E7EB] focus:border-[#2563EB]'
                    }`}
                  />
                  {/* Ícone de validação */}
                  {cardNumber.length > 0 && isCardValid && (
                    <div className="absolute right-16 top-1/2 -translate-y-1/2 text-[#10B981]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {/* Bandeira do cartão */}
                  {cardBrand && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {cardBrand === 'visa' && <span className="text-xs font-bold text-[#1A1F71] bg-white px-2 py-1 rounded border">VISA</span>}
                      {cardBrand === 'mastercard' && <span className="text-xs font-bold text-[#EB001B] bg-white px-2 py-1 rounded border">MASTER</span>}
                      {cardBrand === 'elo' && <span className="text-xs font-bold text-[#FFCB05] bg-white px-2 py-1 rounded border">ELO</span>}
                      {cardBrand === 'amex' && <span className="text-xs font-bold text-[#006FCF] bg-white px-2 py-1 rounded border">AMEX</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Bloco 2 - Validade + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Validade *
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4)
                      }
                      setCardExpiry(value)
                    }}
                    placeholder="MM/AA"
                    maxLength={5}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                      cardExpiry.length > 0
                        ? isExpiryValid
                          ? 'border-[#10B981] bg-green-50/30'
                          : 'border-[#EF4444] bg-red-50/30'
                        : 'border-[#E5E7EB] focus:border-[#2563EB]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2 flex items-center gap-1">
                    CVV *
                    <button
                      type="button"
                      onMouseEnter={() => setShowCvvTooltip(true)}
                      onMouseLeave={() => setShowCvvTooltip(false)}
                      className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setCardCvv(value)
                      }}
                      placeholder="000"
                      maxLength={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                        cardCvv.length > 0
                          ? isCvvValid
                            ? 'border-[#10B981] bg-green-50/30'
                            : 'border-[#EF4444] bg-red-50/30'
                          : 'border-[#E5E7EB] focus:border-[#2563EB]'
                      }`}
                    />
                    {/* Tooltip CVV */}
                    {showCvvTooltip && (
                      <div className="absolute z-10 bottom-full left-0 mb-2 w-48 bg-[#111827] text-white text-xs rounded-lg p-2 shadow-lg">
                        O CVV é o código de 3 dígitos atrás do cartão.
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#111827]"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bloco 3 - Nome no Cartão */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Nome no Cartão *
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="NOME COMPLETO COMO NO CARTÃO"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none uppercase ${
                    cardName.length > 0
                      ? isNameValid
                        ? 'border-[#10B981] bg-green-50/30'
                        : 'border-[#EF4444] bg-red-50/30'
                      : 'border-[#E5E7EB] focus:border-[#2563EB]'
                  }`}
                />
              </div>

              {/* Bloco 4 - CPF */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  CPF do Titular *
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                    formData.cpf.length > 0
                      ? isCpfValid
                        ? 'border-[#10B981] bg-green-50/30'
                        : 'border-[#EF4444] bg-red-50/30'
                      : 'border-[#E5E7EB] focus:border-[#2563EB]'
                  }`}
                />
              </div>

              {/* Botão de Pagamento */}
              <button
                onClick={async () => {
                  setCardLoading(true)
                  // Simular salvamento no banco
                  await new Promise(resolve => setTimeout(resolve, 2000))
                  setCardLoading(false)
                  setShowCardError(true)
                }}
                disabled={cardLoading || !isFormValid}
                className="w-full h-[54px] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-[17px] rounded-[14px] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 mt-2"
              >
                {cardLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </span>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span>Pagar R$ {cart.totalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <span className="text-xs font-normal opacity-90">(Processado com segurança)</span>
                  </>
                )}
              </button>
              
              {/* Mensagens de Segurança */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Seus dados não são armazenados.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Pagamento seguro por conexão criptografada.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Modal de Erro do Cartão
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pagamento Não Aprovado
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Infelizmente não conseguimos processar seu pagamento com cartão. 
                Tente novamente ou escolha outra forma de pagamento.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onSelectPayment('pix')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <img src="/images/pix.png" alt="PIX" className="w-6 h-6" />
                  Pagar com PIX (Aprovação Imediata)
                </button>

                <button
                  onClick={() => {
                    setShowCardError(false)
                    setCardLoading(false)
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Tentar Novamente com Cartão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ⚡ VALIDAÇÃO FREE FIRE - DEVE VIR ANTES DE TUDO
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 [RENDER] Verificando condição de validação:')
  console.log('   - category:', category)
  console.log('   - category === "freefire"?', category === 'freefire')
  console.log('   - internalStep:', internalStep)
  console.log('   - internalStep === "validate"?', internalStep === 'validate')
  console.log('   - isValidated:', isValidated)
  console.log('   - playerData:', playerData ? 'EXISTE' : 'NÃO EXISTE')
  console.log('   - Condição completa:', category === 'freefire' && internalStep === 'validate')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (category === 'freefire' && internalStep === 'validate') {
    console.log('✅✅✅ [RENDER] RENDERIZANDO TELA DE VALIDAÇÃO!')
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* Seção de Validação - Design Futurístico */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100">
          {/* Efeito de brilho orgânico */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/30 to-transparent rounded-full blur-3xl" />
          
          <div className="relative p-8">
            {/* Header da seção */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                <ShoppingBag className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Validar Conta</h2>
                <p className="text-sm text-gray-500">Confirme sua identidade no jogo</p>
              </div>
            </div>

            {/* Input futurístico */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                ID do Free Fire *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.gameId}
                  onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                  placeholder="Digite seu ID"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none text-lg font-medium disabled:opacity-50"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                Encontre no jogo: Perfil → Configurações
              </p>
            </div>

            {/* Botão futurístico */}
            <button
              type="button"
              onClick={handleValidateFreeFire}
              disabled={loading || !formData.gameId}
              className={`mt-6 w-full ${colors.primary} text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group`}
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Validando...
                  </span>
                ) : (
                  'Validar e Continuar'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 3 - DADOS PIX (apenas inputs, sem resumo) OU QR CODE
  if (step === 'pix') {
    // Se já gerou o PIX, mostrar QR Code
    if (pixData) {
      return (
        <div className="space-y-4 max-w-md mx-auto">
          {paymentStatus === 'paid' ? (
            <div className="bg-white rounded-[14px] shadow-[0_4px_18px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">Pagamento recebido!</h3>
                <p className="text-sm text-gray-600 mb-1">🚀 Seu pedido está sendo entregue...</p>
                <p className="text-xs text-gray-500 mt-3">ID: {pixData.transactionId}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Título */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pague com PIX</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Seu pagamento será reconhecido automaticamente e seu item será liberado em segundos.
                </p>
                
                {/* Trust Icons - Antes do QR Code */}
                <div className="flex flex-wrap items-center justify-center gap-3 py-3 px-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🔒</span>
                    <span className="text-xs font-medium text-gray-700">Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">⚡</span>
                    <span className="text-xs font-medium text-gray-700">Aprovação imediata</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🤖</span>
                    <span className="text-xs font-medium text-gray-700">Entrega automática</span>
                  </div>
                </div>
              </div>

              {/* Resumo do Pedido (1 linha) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Você está pagando:</span>{' '}
                  <span className="font-semibold text-gray-900">
                    {cart.items.map(item => item.name).join(', ')}
                  </span>
                </p>
              </div>

              {/* Card do QR Code - Simplificado e Animado */}
              <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-8 mb-6">
                {/* QR Code - Foco Principal com Animação (5% menor) */}
                {pixData.qrCode && (
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      {/* Animação de pulso no fundo */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                      
                      {/* QR Code */}
                      <div className="relative bg-white p-5 rounded-2xl shadow-lg">
                        <img
                          src={pixData.qrCode.startsWith('data:') ? pixData.qrCode : `data:image/png;base64,${pixData.qrCode}`}
                          alt="QR Code PIX"
                          className="w-[185px] h-[185px] relative z-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Valor - Destaque Institucional */}
                <div className="text-center py-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Valor a pagar</p>
                  <p className="text-[28px] font-bold text-gray-900 mb-4">
                    R$ {pixData.amount.toFixed(2).replace('.', ',')}
                  </p>
                  
                  {/* Mensagem de Entrega Automática */}
                  <div className="mb-5 px-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      💳 Pagamento identificado automaticamente.<br/>
                      🚀 Entrega imediata após a confirmação.
                    </p>
                  </div>
                  
                  {/* Contador Regressivo (com espaçamento maior) */}
                  <div className="flex items-center justify-center gap-2 text-sm pt-3 border-t border-gray-100">
                    <span className="text-base">⏳</span>
                    <span className="text-orange-600 font-medium">
                      Seu pedido ficará reservado por{' '}
                      <span className="font-bold">{formatTime(timeRemaining)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Código Copia e Cola - Clicável */}
              {pixData.qrCodeText && (
                <div className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-5 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Código PIX (copie e cole)</p>
                    {!copied ? (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        Clique para copiar
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1 animate-pulse">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado!
                      </p>
                    )}
                  </div>
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.qrCodeText)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className={`w-full px-5 py-4 border-2 rounded-xl text-sm font-mono break-all cursor-pointer transition-all duration-300 hover:shadow-md active:scale-[0.99] ${
                      copied 
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    {copied ? (
                      <div className="flex items-center justify-center gap-2 font-semibold text-base">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        COPIADO COM SUCESSO!
                      </div>
                    ) : (
                      pixData.qrCodeText
                    )}
                  </div>
                </div>
              )}

              {/* Como Pagar - Moderno e Leve */}
              <div className="bg-gradient-to-br from-[#F0F6FF] to-[#EFF6FF] border border-[#E7F1FF] rounded-2xl p-5 mb-4">
                <h4 className="font-semibold text-[#1E40AF] mb-4 text-sm flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Como pagar
                </h4>
                <div className="space-y-3 text-sm text-[#444444]">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">1</div>
                    <span>Abra seu app do banco</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">2</div>
                    <span>Escolha a opção PIX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">3</div>
                    <span>Escaneie o QR Code ou cole o código</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">4</div>
                    <span>Confirme o pagamento</span>
                  </div>
                </div>
              </div>

              {/* Status - Melhorado com Animação */}
              <div className="bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-4">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="relative">
                    <div className="w-3 h-3 bg-[#FFA94D] rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-[#FFA94D] rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="font-medium text-gray-700">
                    Aguardando pagamento
                    <span className="inline-flex ml-0.5">
                      <span className="animate-[bounce_1.4s_ease-in-out_infinite]">.</span>
                      <span className="animate-[bounce_1.4s_ease-in-out_0.2s_infinite]">.</span>
                      <span className="animate-[bounce_1.4s_ease-in-out_0.4s_infinite]">.</span>
                    </span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )
    }
    
    // Se ainda não gerou, mostrar formulário
    // Validações em tempo real
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
    
    const isEmailValid = isValidEmail(formData.email)
    const isNameValid = formData.nome.length >= 6
    const isCpfValid = validateCPF(formData.cpf)
    const isPhoneValid = formData.telefone.replace(/\D/g, '').length === 11
    const isFormValid = isEmailValid && isNameValid && isCpfValid && isPhoneValid
    
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <div className="bg-white rounded-[14px] shadow-[0_4px_18px_rgba(0,0,0,0.04)] border border-[#E5E7EB] p-[22px]">
          {/* Header de Segurança */}
          <div className="mb-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🔒</span>
              <h3 className="text-lg font-bold text-[#111827]">Pagamento 100% Seguro</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Seus dados são criptografados e protegidos</p>
            
            {/* Badges de Segurança */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Pagamento instantâneo</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Dados criptografados</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Entrega automática</span>
              </div>
            </div>
          </div>
          
          {/* Card do Jogador Validado (Free Fire) */}
          {category === 'freefire' && playerData && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-4 mb-6 border-2 border-orange-200 shadow-md">
              <div className="flex items-center gap-3">
                {avatarInfo?.imageUrl && (
                  <img
                    src={avatarInfo.imageUrl}
                    alt="Avatar do jogador"
                    className="w-16 h-16 rounded-xl border-2 border-orange-500 shadow-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-0.5">✓ Conta Validada</p>
                  <p className="font-bold text-gray-900 text-lg">{playerData.basicInfo?.nickname || 'Jogador'}</p>
                  <p className="text-xs text-gray-600">ID: {formData.gameId}</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-[18px]">
            {/* E-mail */}
            <div>
              <label className="block text-[15px] font-semibold text-[#111827] mb-2">
                E-mail *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className={`w-full h-[54px] px-4 text-[15px] border-2 rounded-[12px] transition-all outline-none shadow-sm ${
                  formData.email.length > 0
                    ? isEmailValid
                      ? 'border-[#10B981] bg-[#ECFDF5]'
                      : 'border-[#EF4444] bg-red-50/30'
                    : 'border-[#DFE3E8] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                }`}
              />
              {formData.email.length === 0 && (
                <p className="text-xs text-gray-500 mt-1.5">Seu email para receber o comprovante automaticamente.</p>
              )}
              {formData.email.length > 0 && !isEmailValid && (
                <p className="text-xs text-[#EF4444] mt-1.5">E-mail inválido</p>
              )}
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-[15px] font-semibold text-[#111827] mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value.toUpperCase() })}
                placeholder="Seu nome completo"
                className={`w-full h-[54px] px-4 text-[15px] border-2 rounded-[12px] transition-all outline-none uppercase shadow-sm ${
                  formData.nome.length > 0
                    ? isNameValid
                      ? 'border-[#10B981] bg-[#ECFDF5]'
                      : 'border-[#EF4444] bg-red-50/30'
                    : 'border-[#DFE3E8] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                }`}
              />
              {formData.nome.length > 0 && !isNameValid && (
                <p className="text-xs text-[#EF4444] mt-1.5">Nome deve ter no mínimo 6 caracteres</p>
              )}
            </div>

            {/* CPF */}
            <div>
              <label className="block text-[15px] font-semibold text-[#111827] mb-2">
                CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
                maxLength={14}
                className={`w-full h-[54px] px-4 text-[15px] border-2 rounded-[12px] transition-all outline-none shadow-sm ${
                  formData.cpf.length > 0
                    ? isCpfValid
                      ? 'border-[#10B981] bg-[#ECFDF5]'
                      : 'border-[#EF4444] bg-red-50/30'
                    : 'border-[#DFE3E8] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                }`}
              />
              {formData.cpf.length === 0 && (
                <p className="text-xs text-gray-500 mt-1.5">Usado apenas para emissão fiscal e validação bancária.</p>
              )}
              {formData.cpf.length > 0 && !isCpfValid && (
                <p className="text-xs text-[#EF4444] mt-1.5">CPF inválido</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-[15px] font-semibold text-[#111827] mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={`w-full h-[54px] px-4 text-[15px] border-2 rounded-[12px] transition-all outline-none shadow-sm ${
                  formData.telefone.length > 0
                    ? isPhoneValid
                      ? 'border-[#10B981] bg-[#ECFDF5]'
                      : 'border-[#EF4444] bg-red-50/30'
                    : 'border-[#DFE3E8] focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                }`}
              />
              {formData.telefone.length === 0 && (
                <p className="text-xs text-gray-500 mt-1.5">Utilizado para notificações da compra. Não enviamos spam.</p>
              )}
              {formData.telefone.length > 0 && !isPhoneValid && (
                <p className="text-xs text-[#EF4444] mt-1.5">Telefone incompleto</p>
              )}
            </div>

            {/* Botão Gerar PIX */}
            <div className="relative group">
              <button
                onClick={handleSubmit}
                disabled={processingPayment || !isFormValid}
                className="w-full h-[54px] bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-[17px] rounded-[14px] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 mt-2"
              >
                {processingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando PIX...
                  </span>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🟢</span>
                      <span>Gerar PIX — R$ {cart.totalPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <span className="text-xs font-normal opacity-90">(Aprovação imediata)</span>
                  </>
                )}
              </button>
              
              {/* Tooltip */}
              {!processingPayment && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                    Você receberá o código Pix na próxima etapa
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Jogador Validado (Free Fire) - Card Destacado */}
      {category === 'freefire' && playerData && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-4 border-2 border-orange-200 shadow-md">
          <div className="flex items-center gap-3">
            {avatarInfo?.imageUrl && (
              <img
                src={avatarInfo.imageUrl}
                alt="Avatar do jogador"
                className="w-16 h-16 rounded-xl border-2 border-orange-500 shadow-lg"
              />
            )}
            <div className="flex-1">
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-0.5">✓ Conta Validada</p>
              <p className="font-bold text-gray-900 text-lg">{playerData.basicInfo?.nickname || 'Jogador'}</p>
              <p className="text-xs text-gray-600">ID: {formData.gameId}</p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Resumo do Pedido */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-bold text-gray-900 mb-3">Resumo do Pedido</h3>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold text-gray-900">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className={colors.text}>
                R$ {cart.totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seleção de Método de Pagamento - Mostrar apenas após validação */}
      {!pixData && isValidated && internalStep === 'payment-method' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <PaymentMethodSelector
            onSelectMethod={(method) => {
              setPaymentMethod(method)
              if (method === 'card') {
                setInternalStep('card-form')
              } else {
                setInternalStep('pix-form')
              }
            }}
            colors={colors}
          />
        </div>
      )}

      {/* Formulário de Cartão */}
      {!pixData && isValidated && internalStep === 'card-form' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Jogador Validado (Free Fire) - Mostrar no formulário de cartão */}
          {category === 'freefire' && playerData ? (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-4 mb-6 border-2 border-orange-200 shadow-md">
              <div className="flex items-center gap-3">
                {avatarInfo?.imageUrl && (
                  <img
                    src={avatarInfo.imageUrl}
                    alt="Avatar"
                    className="w-14 h-14 rounded-xl border-2 border-orange-500 shadow-md"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Conta Validada</p>
                  <p className="font-bold text-gray-900 text-lg">{playerData.basicInfo?.nickname || 'Jogador'}</p>
                  <p className="text-xs text-gray-600">ID: {formData.gameId}</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          ) : null}
          
          <CardForm
            onSubmit={handleCardPayment}
            onBack={() => {
              setPaymentMethod(null)
              setInternalStep('payment-method')
            }}
            colors={colors}
            loading={cardLoading}
            totalAmount={cart.totalPrice}
          />
        </div>
      )}

      {/* Formulário PIX - Esconder quando PIX gerado */}
      {!pixData && isValidated && internalStep === 'pix-form' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => {
              setPaymentMethod(null)
              setInternalStep('payment-method')
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dados para Pagamento PIX
          </h2>

          {/* Jogador Validado (Free Fire) - Mostrar no formulário */}
          {(() => {
            console.log('🎮 [PIX FORM] Verificando card do jogador:')
            console.log('   - category:', category)
            console.log('   - playerData:', playerData)
            console.log('   - Deve mostrar?', category === 'freefire' && playerData)
            return null
          })()}
          {category === 'freefire' && playerData ? (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-4 mb-6 border-2 border-orange-200 shadow-md">
              <div className="flex items-center gap-3">
                {avatarInfo?.imageUrl && (
                  <img
                    src={avatarInfo.imageUrl}
                    alt="Avatar"
                    className="w-14 h-14 rounded-xl border-2 border-orange-500 shadow-md"
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Conta Validada</p>
                  <p className="font-bold text-gray-900 text-lg">{playerData.basicInfo?.nickname || 'Jogador'}</p>
                  <p className="text-xs text-gray-600">ID: {formData.gameId}</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nome */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Seu nome completo"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                CPF *
              </label>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.cpf && !validateCPF(formData.cpf) && (
                <p className="text-xs text-red-500 mt-1">CPF inválido</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Telefone *
              </label>
              <input
                type="text"
                required
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Botão Finalizar */}
            {!pixData ? (
              <button
                type="submit"
                disabled={!!(category === 'freefire' && formData.cpf && !validateCPF(formData.cpf)) || processingPayment}
                className={`w-full ${colors.primary} text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow hover:shadow-lg text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processingPayment ? 'Gerando PIX...' : `Gerar PIX - R$ ${cart.totalPrice.toFixed(2).replace('.', ',')}`}
              </button>
            ) : null}
          </form>
        </div>
      )}

      {/* Modal de Erro do Cartão */}
      {showCardError && (
        <CardErrorModal
          onClose={() => setShowCardError(false)}
          onSwitchToPix={() => {
            setShowCardError(false)
            setPaymentMethod('pix')
            setInternalStep('validate')
          }}
          colors={colors}
        />
      )}

      {/* QR Code PIX */}
      {pixData && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          {paymentStatus === 'paid' ? (
            <div className="bg-green-50 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-bold text-green-700 mb-1">Pagamento Confirmado!</h3>
              <p className="text-sm text-green-600">Seu pedido está sendo processado</p>
              <p className="text-xs text-gray-600 mt-1">ID: {pixData.transactionId}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Pague com PIX
                </h3>
                {pixData.qrCode && (
                  <div className="flex justify-center mb-3">
                    <img
                      src={pixData.qrCode.startsWith('data:') ? pixData.qrCode : `data:image/png;base64,${pixData.qrCode}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 rounded-lg shadow-lg"
                      onError={(e) => {
                        // Silencioso
                      }}
                    />
                  </div>
                )}
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  R$ {pixData.amount.toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* Copiar Código */}
              {pixData.qrCodeText && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-600 text-center">
                    Código PIX Copia e Cola:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pixData.qrCodeText}
                      readOnly
                      className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white font-mono"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.qrCodeText)
                        setAlertMessage('Código copiado! ✓')
                        setShowAlertModal(true)
                      }}
                      className={`${colors.primary} text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity`}
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* Aguardando Pagamento */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-200 border-t-yellow-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900">
                      Aguardando pagamento...
                    </p>
                    <p className="text-xs text-yellow-700">
                      Fique nesta página! Confirmação automática.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Alerta */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
              Atenção - Verifique os Dados
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {alertMessage}
            </p>
            <button
              onClick={() => setShowAlertModal(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

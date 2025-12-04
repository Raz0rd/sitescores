"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { Trash2, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, Check } from 'lucide-react'
import LojaLayout from '@/components/loja/LojaLayout'
import { fetchWithRetry, saveFailedRequest } from "@/lib/retry-fetch"
import QRCode from 'qrcode'
import { useUtmParams } from '@/hooks/useUtmParams'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cart = useCart()
  
  // Pegar categoria da URL ou do carrinho
  const categoryParam = searchParams.get('category') as 'freefire' | 'robux' | 'vbucks' | 'recarga' | null
  const category = categoryParam || cart.items[0]?.category || 'freefire'
  
  // Sempre começar no resumo do carrinho
  const [step, setStep] = useState<'cart' | 'form'>('cart')

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
      <div className="container mx-auto max-w-4xl px-4 py-6 pb-32">
        {step === 'cart' ? (
          <>
            {/* Header */}
            <div className="mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">
                Carrinho
              </h1>
            </div>

            {/* Lista de Produtos */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Seus Itens ({cart.items.length})
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
                      
                      {/* Detalhes */}
                      <div className="space-y-0.5 mb-1.5">
                        {Object.entries(item.details).slice(0, 2).map(([key, value]) => (
                          <p key={key} className="text-[10px] text-gray-600">
                            <span className="font-semibold">{key}:</span> {value}
                          </p>
                        ))}
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

            {/* Botão Sticky Inferior */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
              <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    R$ {cart.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <button
                  onClick={() => setStep('form')}
                  className={`w-full ${colors.primary} text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl`}
                >
                  Continuar para Pagamento
                </button>
              </div>
            </div>
          </>
        ) : (
          <CheckoutForm 
            category={category} 
            colors={colors}
            onBack={() => setStep('cart')}
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
  onBack 
}: { 
  category: 'freefire' | 'robux' | 'vbucks' | 'recarga'
  colors: any
  onBack: () => void
}) {
  const cart = useCart()
  const router = useRouter()
  const { getUtmObject } = useUtmParams()
  const utmParameters = getUtmObject()
  const [step, setStep] = useState<'validate' | 'form'>('validate')
  const [loading, setLoading] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  
  // Dados do jogador validado
  const [playerData, setPlayerData] = useState<any>(null)
  const [avatarInfo, setAvatarInfo] = useState<any>(null)
  
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

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('checkout_form_data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed.formData || formData)
        setPlayerData(parsed.playerData || null)
        setAvatarInfo(parsed.avatarInfo || null)
        if (parsed.playerData) {
          setStep('form')
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
        setPlayerData(result.data)
        
        // Buscar avatar se disponível
        if (result.data.basicInfo?.headPic) {
          await fetchAvatarInfo(result.data.basicInfo.headPic)
        }
        
        setStep('form')
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
      
      if (savedPayment) {
        try {
          const payment = JSON.parse(savedPayment)
          // Verificar se não expirou (30 minutos)
          const expiresAt = new Date(payment.expiresAt).getTime()
          if (expiresAt > Date.now()) {
            console.log(`📦 [LOJA] Carregando pagamento pendente de ${category}`)
            
            // 🎨 Gerar QR Code se não existir
            if (!payment.qrCode && payment.qrCodeText) {
              console.log('🎨 [LOJA] Gerando QR Code do localStorage...')
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
                console.log('✅ [LOJA] QR Code gerado do localStorage!')
              } catch (qrError) {
                console.error('❌ [LOJA] Erro ao gerar QR Code:', qrError)
              }
            }
            
            setPixData(payment)
            setStep('form')
            startPolling(payment.transactionId)
          } else {
            console.log(`🗑️ [LOJA] Pagamento de ${category} expirado, removendo...`)
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
          console.log('✅ [LOJA] Pagamento confirmado!')
          setPaymentStatus('paid')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          
          // Remover pendingPayment da categoria atual
          const storageKey = `pendingPayment_${category}`
          localStorage.removeItem(storageKey)
          console.log(`🗑️ [LOJA] Pagamento de ${category} removido após confirmação`)
          
          // Preparar dados para página de sucesso
          const itemNames = cart.items.map(item => item.name).join(', ')
          const totalAmount = Math.round(cart.totalPrice * 100)
          
          // Limpar carrinho
          cart.items.forEach(item => cart.removeItem(item.id))
          
          // Redirecionar para página de sucesso (mesma do recargajogo)
          router.push(`/success?transactionId=${transactionId}&amount=${totalAmount}&itemType=loja&itemValue=${encodeURIComponent(itemNames)}&game=loja`)
        }
      } catch (error) {
        console.error('❌ [LOJA] Erro ao verificar pagamento:', error)
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

  // Debug: monitorar pixData
  useEffect(() => {
    if (pixData) {
      console.log('🎨 [LOJA] pixData atualizado:', {
        transactionId: pixData.transactionId,
        hasQrCode: !!pixData.qrCode,
        hasQrCodeText: !!pixData.qrCodeText,
        qrCodeType: typeof pixData.qrCode,
        qrCodeLength: pixData.qrCode?.length || 0
      })
    }
  }, [pixData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessingPayment(true)

    try {
      // 📊 Log dos UTMs capturados
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 [LOJA] UTMs CAPTURADOS DA URL:')
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
      
      console.log('🔍 [LOJA] Resposta da API:', result)

      if (result.success && result.data) {
        console.log('✅ [LOJA] PIX gerado com sucesso!')
        console.log('📋 [LOJA] Dados do PIX:', {
          transactionId: result.data.transactionId,
          hasQrCode: !!result.data.qrCode,
          hasQrCodeText: !!result.data.qrCodeText,
          qrCodeLength: result.data.qrCode?.length || 0,
          qrCodeTextLength: result.data.qrCodeText?.length || 0
        })
        
        // 🎨 GERAR QR CODE a partir do pixCode (se não veio da API)
        let qrCodeImage = result.data.qrCode
        if (!qrCodeImage && result.data.qrCodeText) {
          console.log('🎨 [LOJA] Gerando QR Code a partir do pixCode...')
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
            console.log('✅ [LOJA] QR Code gerado com sucesso!')
          } catch (qrError) {
            console.error('❌ [LOJA] Erro ao gerar QR Code:', qrError)
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
        console.log(`💾 [LOJA] Pagamento salvo em ${storageKey}`)
        
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

  // Para Free Fire, mostrar validação primeiro
  if (category === 'freefire' && step === 'validate') {
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

  return (
    <div className="space-y-6">
      {/* Jogador Validado (Free Fire) */}
      {category === 'freefire' && playerData && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            {avatarInfo?.imageUrl && (
              <img
                src={avatarInfo.imageUrl}
                alt="Avatar"
                className="w-12 h-12 rounded-lg border-2 border-orange-500"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600">Conta Validada</p>
              <p className="font-bold text-gray-900">{playerData.basicInfo?.nickname || 'Jogador'}</p>
              <p className="text-xs text-gray-500">ID: {formData.gameId}</p>
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

      {/* Formulário de Dados - Esconder quando PIX gerado */}
      {!pixData && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dados para Pagamento
          </h2>

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
                        console.error('❌ [LOJA] Erro ao carregar QR Code')
                        console.log('QR Code src:', pixData.qrCode?.substring(0, 100))
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

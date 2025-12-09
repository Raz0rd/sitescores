"use client"

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Check, Star, Clock, Shield, Zap, MessageCircle } from 'lucide-react'
import Footer from '@/components/Footer'
import { DevToolsBlocker } from '@/components/DevToolsBlocker'
import { getUTCTimestamp } from '@/lib/brazil-time'
import { orderStorageService } from '@/lib/order-storage'

// Dados dos produtos
const products = {
  'ff-calca': {
    id: 'ff-calca',
    name: 'Calça Angelical',
    game: 'freefire',
    amount: 'Calça Angelical',
    price: 69.90,
    image: '/images/products/ANGELICAL.png',
    description: 'Calça Angelical exclusiva para Free Fire. Destaque-se no jogo com este item único!'
  },
  'ff-1060': {
    id: 'ff-1060',
    name: '1060 Diamantes',
    game: 'freefire',
    amount: '1060',
    price: 18.70,
    bonus: '+30% Bônus',
    image: '/images/products/1060-min.png',
    description: '1060 diamantes para Free Fire com +30% de bônus! Entrega instantânea!'
  },
  'ff-2180': {
    id: 'ff-2180',
    name: '2180 Diamantes',
    game: 'freefire',
    amount: '2180',
    price: 32.40,
    bonus: '+30% Bônus',
    image: '/images/products/2180-min.png',
    description: '2180 diamantes para Free Fire com +30% de bônus - Pacote mais popular!'
  },
  'ff-5600': {
    id: 'ff-5600',
    name: '5600 Diamantes + Bônus',
    game: 'freefire',
    amount: '5600',
    price: 69.80,
    bonus: '+1680 diamantes (30% bônus) = 7280 💎 total',
    image: '/images/products/5600-min.png',
    description: '5600 diamantes + 1680 de bônus = 7280 diamantes totais! Melhor custo-benefício!'
  },
  'rbx-800': {
    id: 'rbx-800',
    name: '800 Robux',
    game: 'robux',
    amount: '800',
    price: 18.90,
    image: '/images/products/roblox_800_robux.webp',
    description: '800 Robux para Roblox. Compre itens e personalize seu avatar!'
  },
  'rbx-1500': {
    id: 'rbx-1500',
    name: '1500 Robux',
    game: 'robux',
    amount: '1500',
    price: 22.90,
    image: '/images/products/robux_1500.webp',
    description: '1500 Robux para Roblox. Mais opções de customização!'
  },
  'rbx-2700': {
    id: 'rbx-2700',
    name: '2700 Robux',
    game: 'robux',
    amount: '2700',
    price: 29.90,
    image: '/images/products/robux_2700.webp',
    description: '2700 Robux para Roblox. Pacote intermediário!'
  },
  'rbx-3600': {
    id: 'rbx-3600',
    name: '3600 Robux',
    game: 'robux',
    amount: '3600',
    price: 47.90,
    image: '/images/products/robux-3600-o6_PR7Lu.webp',
    description: '3600 Robux para Roblox. Ótimo custo-benefício!'
  },
  'rbx-4500': {
    id: 'rbx-4500',
    name: '4500 Robux',
    game: 'robux',
    amount: '4500',
    price: 55.90,
    originalPrice: 69.90,
    discount: '20%',
    image: '/images/products/robux-4500-CBGtdrYT.webp',
    description: '4500 Robux para Roblox. Pacote mais vendido!'
  },
  'rbx-10000': {
    id: 'rbx-10000',
    name: '10000 Robux',
    game: 'robux',
    amount: '10000',
    price: 92.90,
    originalPrice: 119.90,
    discount: '23%',
    image: '/images/products/robux-10000-DH0988eb.webp',
    description: '10000 Robux para Roblox. Pacote premium!'
  }
}

const testimonials = [
  { name: 'Mago**Csx', text: 'Recebi em 2 minutos! Super rápido', rating: 5, time: '1 hora atrás', value: 1733 },
  { name: 'Ju**pets', text: 'Melhor preço que achei', rating: 5, time: '3 horas atrás', value: 892 },
  { name: 'KewF**x0', text: 'Já comprei 5x, sempre funciona', rating: 5, time: '5 horas atrás', value: 1456 },
  { name: 'Dark**Pro', text: 'Atendimento nota 10', rating: 5, time: '8 horas atrás', value: 678 },
  { name: 'Sn**per99', text: 'Entrega instantânea, recomendo', rating: 5, time: '12 horas atrás', value: 1289 },
  { name: 'Lun**Star', text: 'Muito seguro e confiável', rating: 5, time: '1 dia atrás', value: 543 },
  { name: 'Fire**King', text: 'Preço justo e entrega rápida', rating: 5, time: '1 dia atrás', value: 1621 },
  { name: 'Nit**roX', text: 'Comprei e já recebi, perfeito!', rating: 5, time: '2 dias atrás', value: 345 },
  { name: 'Sky**Gamer', text: 'Melhor site de recarga!', rating: 5, time: '3 horas atrás', value: 987 },
  { name: 'Vip**er77', text: 'Confiável demais', rating: 5, time: '6 horas atrás', value: 1134 }
]

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const product = products[productId as keyof typeof products]

  const [formData, setFormData] = useState({
    email: '',
    gameId: '',
    name: '',
    cpf: '',
    phone: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [pixData, setPixData] = useState<{
    qrCode: string
    qrCodeImage: string
    transactionId: string
  } | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'error'>('pending')
  const [isValidatingId, setIsValidatingId] = useState(false)
  const [idValidation, setIdValidation] = useState<{
    isValid: boolean
    playerName: string
    playerAvatar: string
    message: string
  } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: '', message: '' })
  const [copiedPix, setCopiedPix] = useState(false)

  // Capturar parâmetros UTM e Google Ads
  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const paramsToCapture = [
      'gclid', 'gbraid', 'wbraid', 'gad_source',
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'src', 'sck', 'xcod', 'keyword', 'device', 'network'
    ]
    
    paramsToCapture.forEach(param => {
      const value = urlParams.get(param)
      if (value) {
        localStorage.setItem(param, value)
        sessionStorage.setItem(param, value)
      }
    })
  }, [])

  // Validar ID do Free Fire
  const validateGameId = async (gameId: string) => {
    if (product.game !== 'freefire' || !gameId || gameId.length < 8) {
      setIdValidation(null)
      return
    }

    setIsValidatingId(true)
    
    try {
      // Usar nossa rota /api/game-data (igual ao checkout)
      const response = await fetch(`/api/game-data?uid=${gameId}`)
      const result = await response.json()

      if (result.success && result.data && result.data.basicInfo) {
        const basicInfo = result.data.basicInfo
        const nickname = basicInfo.nickname || 'Jogador'
        const headPic = basicInfo.headPic || '902000306'
        
        // Buscar informações do avatar usando nossa API
        let avatarUrl = '/images/products/LogoDimBuxBAckgroundFREE.png' // Fallback
        try {
          const avatarResponse = await fetch(`/api/get-avatar?headPicId=${headPic}`)
          if (avatarResponse.ok) {
            const avatarData = await avatarResponse.json()
            avatarUrl = avatarData.imageUrl
          }
        } catch (error) {
          console.error('Erro ao buscar avatar:', error)
        }
        
        setIdValidation({
          isValid: true,
          playerName: nickname,
          playerAvatar: avatarUrl,
          message: `✓ ID válido: ${nickname}`
        })
      } else {
        setIdValidation({
          isValid: false,
          playerName: '',
          playerAvatar: '',
          message: '✗ ID inválido ou não encontrado'
        })
        setModalContent({
          title: '❌ ID Inválido',
          message: `O ID "${gameId}" não foi encontrado no Free Fire. Por favor, verifique e tente novamente.`
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('Erro ao validar ID:', error)
      // Em caso de erro na API, não bloquear o usuário
      setIdValidation(null)
    } finally {
      setIsValidatingId(false)
    }
  }

  // Debounce para validação automática
  const handleGameIdChange = (value: string) => {
    setFormData({ ...formData, gameId: value })
    
    // Limpar validação anterior
    setIdValidation(null)
    
    // Validar após 1 segundo de inatividade
    if (product.game === 'freefire') {
      const timeoutId = setTimeout(() => {
        validateGameId(value)
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Produto não encontrado</h1>
          <button
            onClick={() => router.push('/loja')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Voltar para loja
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validar email antes de enviar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      alert('❌ Email inválido!\n\nPor favor, insira um email válido.\n\n✓ Deve conter @ (exemplo: seuemail@gmail.com)\n✓ Não pode ter espaços\n✓ Deve ter um domínio válido (.com, .br, etc)')
      setIsLoading(false)
      return
    }
    
    try {
      const amountInCents = Math.round(product.price * 100)
      
      // Capturar UTM parameters do localStorage
      const utmParams = typeof window !== 'undefined' ? {
        src: localStorage.getItem('src') || null,
        sck: localStorage.getItem('sck') || null,
        utm_source: localStorage.getItem('utm_source') || null,
        utm_campaign: localStorage.getItem('utm_campaign') || null,
        utm_medium: localStorage.getItem('utm_medium') || null,
        utm_content: localStorage.getItem('utm_content') || null,
        utm_term: localStorage.getItem('utm_term') || null,
        gclid: localStorage.getItem('gclid') || null,
        xcod: localStorage.getItem('xcod') || null,
        keyword: localStorage.getItem('keyword') || null,
        device: localStorage.getItem('device') || null,
        network: localStorage.getItem('network') || null,
        gad_source: localStorage.getItem('gad_source') || null,
        gbraid: localStorage.getItem('gbraid') || null
      } : {}
      
      // Gerar PIX
      const response = await fetch('/api/generate-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          trackingParams: utmParams,
          playerId: formData.gameId,
          itemType: product.game,
          itemValue: product.name,
          paymentMethod: 'pix',
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: {
              number: formData.cpf.replace(/\D/g, ''),
              type: 'cpf'
            }
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Gerar QR Code
        const QRCode = (await import('qrcode')).default
        const qrCodeDataURL = await QRCode.toDataURL(data.pixCode, {
          width: 256,
          margin: 2
        })
        
        setPixData({
          qrCode: data.pixCode,
          qrCodeImage: qrCodeDataURL,
          transactionId: data.transactionId
        })
        
        // Capturar IP do cliente (mesma forma do checkout)
        let clientIp = 'unknown'
        try {
          const ipResponse = await fetch('https://ipinfo.io/?token=32090226b9d116')
          if (ipResponse.ok) {
            const ipData = await ipResponse.json()
            clientIp = ipData.ip
          }
        } catch (error) {
          console.error('Erro ao capturar IP:', error)
        }

        // Preparar dados para UTMify no formato correto
        const productId = `recarga-${data.transactionId}`
        const totalPriceInCents = amountInCents
        
        // Sem taxa de gateway - enviar valor total como comissão do usuário
        const gatewayFeeInCents = 0
        const userCommissionInCents = totalPriceInCents
        
        // Formatar data no formato UTC para UTMify (YYYY-MM-DD HH:MM:SS)
        const createdAtFormatted = getUTCTimestamp()
        
        const utmifyData = {
          orderId: data.transactionId,
          platform: "RecarGames",
          paymentMethod: "pix",
          status: "waiting_payment",
          createdAt: createdAtFormatted,
          approvedDate: null,
          refundedAt: null,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone.replace(/\D/g, ''),
            document: formData.cpf.replace(/\D/g, ''),
            country: "BR",
            ip: clientIp || "0.0.0.0"
          },
          products: [{
            id: productId,
            name: product.name,
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: amountInCents
          }],
          trackingParameters: utmParams,
          commission: {
            totalPriceInCents: totalPriceInCents,
            gatewayFeeInCents: gatewayFeeInCents,
            userCommissionInCents: userCommissionInCents,
            currency: "BRL"
          },
          isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
        }
        
        // Enviar para UTMify como pending
        await fetch('/api/utmify-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(utmifyData)
        })
        
        // Enviar email de pagamento gerado
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_pending',
            email: formData.email,
            customerName: formData.name,
            product: product.name,
            orderId: data.transactionId,
            amount: product.price.toFixed(2)
          })
        })
        
        // Iniciar polling para verificar pagamento
        startPolling(data.transactionId)
      } else {
        alert('Erro ao gerar PIX. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao processar pedido.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const startPolling = (transactionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/check-transaction-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId })
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'paid') {
            clearInterval(pollInterval)
            setPaymentStatus('paid')
            
            // Preparar dados para UTMify PAID
            const amountInCents = Math.round(product.price * 100)
            const utmParams = typeof window !== 'undefined' ? {
              src: localStorage.getItem('src') || null,
              sck: localStorage.getItem('sck') || null,
              utm_source: localStorage.getItem('utm_source') || null,
              utm_campaign: localStorage.getItem('utm_campaign') || null,
              utm_medium: localStorage.getItem('utm_medium') || null,
              utm_content: localStorage.getItem('utm_content') || null,
              utm_term: localStorage.getItem('utm_term') || null,
              gclid: localStorage.getItem('gclid') || null,
              xcod: localStorage.getItem('xcod') || null,
              keyword: localStorage.getItem('keyword') || null,
              device: localStorage.getItem('device') || null,
              network: localStorage.getItem('network') || null,
              gad_source: localStorage.getItem('gad_source') || null,
              gbraid: localStorage.getItem('gbraid') || null
            } : {}
            
            // Capturar IP do cliente (mesma forma do checkout)
            let clientIp = 'unknown'
            try {
              const ipResponse = await fetch('https://ipinfo.io/?token=32090226b9d116')
              if (ipResponse.ok) {
                const ipData = await ipResponse.json()
                clientIp = ipData.ip
              }
            } catch (error) {
              console.error('Erro ao capturar IP:', error)
            }
            
            const productId = `recarga-${transactionId}`
            const totalPriceInCents = amountInCents
            
            // Sem taxa de gateway - enviar valor total como comissão do usuário
            const gatewayFeeInCents = 0
            const userCommissionInCents = totalPriceInCents
            
            // Recuperar createdAt original do storage (mesma data do pedido)
            const storedOrder = orderStorageService.getOrder(transactionId)
            const createdAtPaid = storedOrder?.createdAt || getUTCTimestamp()
            const approvedDatePaid = getUTCTimestamp()
            
            const utmifyDataPaid = {
              orderId: transactionId,
              platform: "RecarGames",
              paymentMethod: "pix",
              status: "paid",
              createdAt: createdAtPaid,
              approvedDate: approvedDatePaid,
              refundedAt: null,
              customer: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone.replace(/\D/g, ''),
                document: formData.cpf.replace(/\D/g, ''),
                country: "BR",
                ip: clientIp
              },
              products: [{
                id: productId,
                name: product.name,
                planId: null,
                planName: null,
                quantity: 1,
                priceInCents: amountInCents
              }],
              trackingParameters: utmParams,
              commission: {
                totalPriceInCents: totalPriceInCents,
                gatewayFeeInCents: gatewayFeeInCents,
                userCommissionInCents: userCommissionInCents,
                currency: "BRL"
              },
              isTest: process.env.NEXT_PUBLIC_UTMIFY_TEST_MODE === 'true'
            }
            
            // Enviar para UTMify como paid
            await fetch('/api/utmify-track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(utmifyDataPaid)
            })
            
            // Enviar email de pagamento confirmado
            await fetch('/api/send-order-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'payment_confirmed',
                email: formData.email,
                customerName: formData.name,
                product: product.name,
                orderId: transactionId,
                amount: product.price.toFixed(2)
              })
            })
            
            // Agendar email de instabilidades após 30 minutos
            setTimeout(async () => {
              await fetch('/api/send-order-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'processing_delay',
                  email: formData.email,
                  customerName: formData.name,
                  product: product.name,
                  orderId: transactionId,
                  amount: product.price.toFixed(2)
                })
              })
            }, 1800000) // 30 minutos
            
            // Redirecionar para success
            setTimeout(() => {
              router.push('/success')
            }, 2000)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
      }
    }, 10000)
    
    // Limpar após 10 minutos
    setTimeout(() => clearInterval(pollInterval), 600000)
  }

  return (
    <div className="min-h-screen bg-white">
      <DevToolsBlocker />
      {/* Header simples */}
      <header className="bg-slate-900 py-4 sticky top-0 z-50 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push('/loja')}
            className="flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Imagem do Produto */}
          <div>
            <div className="bg-slate-100 rounded-lg p-8 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            
            {'discount' in product && product.discount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  🎉 Economize {product.discount} nesta compra
                </p>
              </div>
            )}
          </div>

          {/* Informações e Formulário */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {product.name}
            </h1>
            
            <p className="text-slate-600 mb-4">{product.description}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-slate-900">
                R$ {product.price.toFixed(2)}
              </span>
              {'originalPrice' in product && product.originalPrice && (
                <span className="text-xl text-slate-400 line-through">
                  R$ {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Benefícios */}
            <div className="bg-white border-2 border-green-500 rounded-lg p-5 mb-6 shadow-md">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-slate-900 font-bold text-base">Entrega em até 5 minutos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-slate-900 font-bold text-base">Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-slate-900 font-bold text-base">Garantia de reembolso</span>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seu e-mail
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {product.game === 'freefire' ? 'ID do Free Fire' : 'Username do Roblox'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.gameId}
                    onChange={(e) => handleGameIdChange(e.target.value)}
                    placeholder={product.game === 'freefire' ? 'Seu ID do FF' : 'Seu username'}
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent ${
                      idValidation?.isValid 
                        ? 'border-green-500 focus:ring-green-500' 
                        : idValidation?.isValid === false 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                  />
                  {isValidatingId && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {idValidation && idValidation.isValid && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                    <img 
                      src={idValidation.playerAvatar} 
                      alt={idValidation.playerName}
                      className="w-12 h-12 rounded-full border-2 border-cyan-400"
                      onError={(e) => {
                        e.currentTarget.src = '/images/products/LogoDimBuxBAckgroundFREE.png'
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-cyan-400">
                        ✓ ID Válido
                      </p>
                      <p className="text-sm font-medium text-white">
                        {idValidation.playerName}
                      </p>
                    </div>
                  </div>
                )}
                {idValidation && !idValidation.isValid && (
                  <p className="mt-2 text-sm text-red-600">
                    {idValidation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    let formatted = value
                    if (value.length > 3) formatted = value.slice(0, 3) + '.' + value.slice(3)
                    if (value.length > 6) formatted = formatted.slice(0, 7) + '.' + value.slice(6)
                    if (value.length > 9) formatted = formatted.slice(0, 11) + '-' + value.slice(9, 11)
                    setFormData({ ...formData, cpf: formatted })
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefone/WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    let formatted = value
                    if (value.length > 0) formatted = '(' + value.slice(0, 2)
                    if (value.length > 2) formatted += ') ' + value.slice(2, 7)
                    if (value.length > 7) formatted += '-' + value.slice(7, 11)
                    setFormData({ ...formData, phone: formatted })
                  }}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !!pixData}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Comprar Agora
                  </>
                )}
              </button>
            </form>

            {/* Modal PIX */}
            {pixData && paymentStatus === 'pending' && (
              <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full my-4 max-h-[95vh] overflow-y-auto">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-t-2xl sticky top-0 z-10 border-b border-cyan-400/30">
                    <h3 className="text-xl font-bold text-white text-center">
                      🔒 Finalize seu Pagamento
                    </h3>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Resumo do Pedido */}
                    <div className="bg-slate-800 rounded-lg p-3 border border-cyan-400/30">
                      <h4 className="text-sm font-bold text-cyan-400 mb-2">📋 Resumo</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Produto:</span>
                          <span className="text-white font-medium">{product.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Jogador:</span>
                          <span className="text-white font-medium">{idValidation?.playerName || formData.gameId}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-700">
                          <span className="text-cyan-400 font-bold">Total:</span>
                          <span className="text-cyan-400 font-bold text-base">R$ {product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-slate-700 text-sm font-medium mb-3">Escaneie o QR Code</p>
                      <img 
                        src={pixData.qrCodeImage} 
                        alt="QR Code PIX" 
                        className="w-48 h-48 mx-auto border-2 border-slate-200 rounded-lg"
                      />
                    </div>

                    {/* Copia e Cola */}
                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-2">
                        Ou copie o código PIX:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pixData.qrCode}
                          readOnly
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(pixData.qrCode)
                            setCopiedPix(true)
                            setModalContent({
                              title: '✅ Código Copiado!',
                              message: 'O código PIX foi copiado para a área de transferência. Cole no seu aplicativo de pagamento.'
                            })
                            setShowModal(true)
                            setTimeout(() => setCopiedPix(false), 2000)
                          }}
                          className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                            copiedPix 
                              ? 'bg-green-600 text-white' 
                              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                          }`}
                        >
                          {copiedPix ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-cyan-400">
                          Aguardando pagamento...
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        Verificando automaticamente a cada 10 segundos
                      </p>
                    </div>

                    {/* Provas Sociais */}
                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                      <h4 className="text-xs font-bold text-cyan-400 mb-2">⭐ Últimas Compras</h4>
                      <div className="space-y-1.5">
                        {testimonials.sort(() => Math.random() - 0.5).slice(0, 3).map((testimonial, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {testimonial.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-medium truncate">{testimonial.name} - {testimonial.text}</p>
                            </div>
                            <span className="text-slate-500 text-[10px] flex-shrink-0">{testimonial.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pagamento Confirmado */}
            {pixData && paymentStatus === 'paid' && (
              <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Pagamento Confirmado!
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Seu pedido foi processado com sucesso
                  </p>
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-4">
                    Redirecionando...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Como Resgatar */}
        <div className="bg-slate-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Como funciona?</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Faça seu pedido</h3>
              <p className="text-sm text-slate-600">
                Preencha os dados e finalize a compra com PIX
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Receba o código</h3>
              <p className="text-sm text-slate-600">
                Após o pagamento, você recebe o código por email
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Resgate no jogo</h3>
              <p className="text-sm text-slate-600">
                Use o código no site oficial e aproveite
              </p>
            </div>
          </div>

          {/* Vídeo */}
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={product.game === 'freefire' ? 'https://streamable.com/e/c2de61' : 'https://streamable.com/e/f1qg6g'}
                frameBorder="0"
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; fullscreen"
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">O que nossos clientes dizem</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-3">"{testimonial.text}"</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{testimonial.name}</span>
                  <span className="text-slate-500">{testimonial.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garantias */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Zap className="w-8 h-8 text-white" fill="white" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Entrega Rápida</h3>
            <p className="text-sm text-slate-600">Em até 5 minutos</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Shield className="w-8 h-8 text-white" fill="white" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">100% Seguro</h3>
            <p className="text-sm text-slate-600">Pagamento protegido</p>
          </div>

          <a 
            href="https://wa.me/5511956565477?text=Olá!%20Preciso%20de%20ajuda%20com%20minha%20compra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" fill="white" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Suporte 24/7</h3>
            <p className="text-sm text-slate-600">WhatsApp: +55 11 95656-5477</p>
          </a>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-4 pr-8">
              {modalContent.title}
            </h3>
            
            <p className="text-slate-600 mb-6">
              {modalContent.message}
            </p>
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

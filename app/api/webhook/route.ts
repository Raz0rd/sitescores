import { NextRequest, NextResponse } from 'next/server'
import { orderStorageService } from '@/lib/order-storage'
import { getBrazilTimestamp } from '@/lib/brazil-time'

// Interface genérica para transações (Ezzpag, Umbrela, etc)
interface Transaction {
  id: string | number
  tenantId?: string
  companyId?: number
  amount: number
  currency?: string
  paymentMethod: string
  status: string
  installments?: number
  paidAt: string | null
  paidAmount?: number
  refundedAt?: string | null
  refundedAmount?: number
  postbackUrl?: string
  metadata?: string | null
  ip?: string | null
  externalRef?: string | null
  secureId?: string
  secureUrl?: string
  createdAt: string
  updatedAt: string
  customer: {
    id: number
    name: string
    email: string
    phone: string
    birthdate?: string | null
    document: {
      type: string
      number: string
    }
  }
  pix?: {
    qrcode: string
    end2EndId?: string | null
    receiptUrl?: string | null
    expirationDate: string
  }
}

interface WebhookPayload {
  type: string
  data: Transaction
  url?: string // Ezzpag envia URL no root do payload
  objectId?: string // Ezzpag envia objectId
  id?: number // Ezzpag envia ID do webhook
}

// Cache para evitar processamento duplicado (em memória)
const processedWebhooks = new Map<string, number>()
const DEBOUNCE_TIME = 5000 // 5 segundos

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json()

    // Verificar se é uma transação
    if (body.type !== "transaction" || !body.data) {
      console.log("⚠️ [WEBHOOK] Tipo inválido - ignorado")
      return NextResponse.json({ success: true, message: "Not a transaction webhook" })
    }

    const transaction = body.data
    const transactionId = transaction.id.toString()
    const status = transaction.status
    
    // Identificar gateway
    const isEzzpag = !body.data?.postbackUrl && body.data?.secureUrl?.includes('ezzypag')
    const gatewayName = isEzzpag ? 'Ezzpag' : 'Outro'
    
    // 📥 CABEÇALHO DO WEBHOOK
    const host = request.headers.get('host') || 'unknown'
    const webhookRoute = `/api/webhook`
    const fullUrl = `https://${host}${webhookRoute}`
    
    console.log('')
    console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
    console.log('┃ 📥 WEBHOOK RECEBIDO                      ┃')
    console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
    console.log(`📍 Rota: ${fullUrl}`)
    console.log(`🎯 Gateway: ${gatewayName}`)
    console.log(`🆔 ID: ${transactionId}`)
    console.log(`📊 Status: ${status.toUpperCase()}`)
    console.log(`💵 Valor: R$ ${(transaction.amount / 100).toFixed(2)}`)
    console.log(`👤 Cliente: ${transaction.customer?.name || 'N/A'}`)
    console.log('')

    // PROTEÇÃO ANTI-DUPLICAÇÃO: Verificar se já processamos este webhook recentemente
    const webhookKey = `${transactionId}-${status}`
    const lastProcessed = processedWebhooks.get(webhookKey)
    const now = Date.now()
    
    if (lastProcessed && (now - lastProcessed) < DEBOUNCE_TIME) {
      const timeDiff = ((now - lastProcessed) / 1000).toFixed(2)
      console.log(`⚠️ [WEBHOOK] DUPLICADO detectado - IGNORANDO`)
      console.log(`   - Transaction ID: ${transactionId}`)
      console.log(`   - Status: ${status}`)
      console.log(`   - Último processamento: ${timeDiff}s atrás`)
      console.log('')
      return NextResponse.json({ 
        received: true, 
        message: 'Webhook duplicado - ignorado',
        timeDiff: `${timeDiff}s`
      })
    }
    
    // Marcar como processado
    processedWebhooks.set(webhookKey, now)
    
    // Limpar cache antigo (mais de 1 hora)
    for (const [key, timestamp] of processedWebhooks.entries()) {
      if (now - timestamp > 3600000) { // 1 hora
        processedWebhooks.delete(key)
      }
    }

    // VALIDAÇÃO: Verificar se o webhook é do nosso projeto
    // Gateway envia webhook para TODOS os domínios cadastrados
    // Precisamos verificar se a transação foi criada NESTE servidor
    const webhookUrl = body.data?.postbackUrl || body.url || ''
    const orderId = transaction.externalRef || transactionId
    const storedOrder = orderStorageService.getOrder(transactionId) || orderStorageService.getOrder(orderId)
    
    // Se a transação NÃO existe no nosso storage, IGNORAR
    if (!storedOrder) {
      console.log('⚠️ [WEBHOOK] Transação de outro servidor - IGNORADO')
      console.log('   - Transaction ID:', transactionId)
      console.log('   - Order ID:', orderId)
      console.log('   - Motivo: Não encontrado no orderStorage deste servidor')
      return NextResponse.json({ 
        received: true, 
        message: 'Webhook de outro servidor - ignorado' 
      })
    }
    
    console.log('✅ [WEBHOOK] Transação encontrada no storage deste servidor')
    console.log('   - Transaction ID:', transactionId)
    console.log('   - Order ID:', orderId)

    // Mapear status de diferentes gateways
    // Ezzpag: waiting_payment, paid, approved, canceled, refunded
    // Umbrela: WAITING_PAYMENT, PAID
    const isPaid = status === 'paid' || status === 'approved' || status === 'PAID'
    const isWaitingPayment = status === 'waiting_payment' || status === 'WAITING_PAYMENT'

    // Detectar origem do webhook
    const isUmbrela = webhookUrl.includes('umbrela') || body.data?.postbackUrl?.includes('umbrela')
    const origem = isEzzpag ? 'Ezzpag' : isUmbrela ? 'Umbrela' : 'Outro'
    
    // Log resumido com informações essenciais
    console.log('📥 [WEBHOOK] Recebido:', {
      id: transactionId.substring(0, 8) + '...',
      status: status.toUpperCase(),
      valor: `R$ ${(transaction.amount / 100).toFixed(2)}`,
      cliente: transaction.customer.name,
      origem
    })

    if (isPaid || isWaitingPayment) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`💳 [WEBHOOK] Pagamento ${isPaid ? 'CONFIRMADO' : 'PENDENTE'}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 Dados da transação:')
      console.log('   - Transaction ID:', transactionId)
      console.log('   - Status:', status)
      console.log('   - isPaid:', isPaid)
      console.log('   - isWaitingPayment:', isWaitingPayment)
      console.log('   - Valor: R$', (transaction.amount / 100).toFixed(2))
      console.log('   - Cliente:', transaction.customer?.name)
      
      // Mostrar URL do postback/webhook
      if (webhookUrl) {
        console.log('   - Postback URL:', webhookUrl)
      } else {
        console.log('   - Postback URL: (não fornecida - Ezzpag)')
      }
      
      // CONVERSÃO SERÁ ENVIADA PARA GOOGLE ADS NA PÁGINA /SUCCESS
      if (isPaid) {
        console.log('')
        console.log('📝 [WEBHOOK] Próximo passo: Usuário será redirecionado para /success')
        console.log('📝 [WEBHOOK] Na página /success, o Google Ads receberá a conversão')
      }
      
      // Recuperar tracking parameters do metadata OU do order storage
      let trackingParameters: Record<string, string | null> = {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null,
        xcod: null,
        keyword: null,
        device: null,
        network: null,
        gclid: null,
        gad_source: null,
        gbraid: null
      }
      
      let orderId = transaction.externalRef || transactionId
      
      try {
        if (transaction.metadata) {
          const metadata = JSON.parse(transaction.metadata)
          
          // Tentar recuperar UTMs do metadata primeiro
          if (metadata.utmParams) {
            trackingParameters = { ...trackingParameters, ...metadata.utmParams }
            console.log("[v0] Recovered UTM parameters from metadata:", trackingParameters)
          }
          
          if (metadata.orderId) {
            orderId = metadata.orderId
          }
        }
        
        // Fallback: tentar recuperar do order storage
        if (!trackingParameters.utm_source && !trackingParameters.gclid) {
          console.log("[v0] Tentando recuperar UTMs do order storage para:", { transactionId, orderId })
          const storedOrder = orderStorageService.getOrder(transactionId) || orderStorageService.getOrder(orderId)
          if (storedOrder && storedOrder.trackingParameters) {
            trackingParameters = { ...trackingParameters, ...storedOrder.trackingParameters }
            console.log("[v0] ✅ Recovered UTM parameters from order storage:", trackingParameters)
          } else {
            console.log("[v0] ❌ Nenhum pedido encontrado no order storage")
          }
        } else {
          console.log("[v0] ✅ UTMs já recuperados do metadata, não precisa do fallback")
        }
        
      } catch (error) {
        console.error("[v0] Error parsing metadata:", error)
      }
      
      // 🎯 LOGS DE ORIGEM DA VENDA
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎯 [ORIGEM DA VENDA]')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Identificar fonte principal
      if (trackingParameters.gclid) {
        console.log('📍 Fonte: Google Ads (Paid)')
        console.log('   - GCLID:', trackingParameters.gclid)
        if (trackingParameters.gad_source) console.log('   - GAD Source:', trackingParameters.gad_source)
        if (trackingParameters.gbraid) console.log('   - GBraid:', trackingParameters.gbraid)
      } else if (trackingParameters.utm_source) {
        console.log('📍 Fonte:', trackingParameters.utm_source)
        if (trackingParameters.utm_campaign) console.log('   - Campanha:', trackingParameters.utm_campaign)
        if (trackingParameters.utm_medium) console.log('   - Meio:', trackingParameters.utm_medium)
        if (trackingParameters.utm_content) console.log('   - Conteúdo:', trackingParameters.utm_content)
        if (trackingParameters.utm_term) console.log('   - Termo:', trackingParameters.utm_term)
      } else if (trackingParameters.src) {
        console.log('📍 Fonte (src):', trackingParameters.src)
        if (trackingParameters.sck) console.log('   - SCK:', trackingParameters.sck)
      } else {
        console.log('📍 Fonte: Tráfego Direto ou Orgânico')
        console.log('   ⚠️ Nenhum parâmetro de rastreamento encontrado')
      }
      
      // Informações adicionais
      if (trackingParameters.xcod) {
        console.log('   - Código Afiliado (xcod):', trackingParameters.xcod)
      }
      if (trackingParameters.keyword) {
        console.log('   - Palavra-chave:', trackingParameters.keyword)
      }
      if (trackingParameters.device) {
        console.log('   - Dispositivo:', trackingParameters.device)
      }
      if (trackingParameters.network) {
        console.log('   - Rede:', trackingParameters.network)
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')
      
      // Criar dados para enviar para UTMify no formato EXATO da documentação
      const utmifyData = {
        orderId,
        platform: "RecarGames",
        paymentMethod: "pix",
        status: isPaid ? "paid" : "waiting_payment", // Status correto do UTMify
        createdAt: transaction.createdAt ? getBrazilTimestamp(new Date(transaction.createdAt)) : getBrazilTimestamp(new Date()),
        approvedDate: isPaid && transaction.paidAt ? getBrazilTimestamp(new Date(transaction.paidAt)) : null,
        refundedAt: null,
        customer: {
          name: transaction.customer.name,
          email: transaction.customer.email,
          phone: transaction.customer.phone,
          document: transaction.customer.document.number,
          country: "BR",
          ip: transaction.ip || "unknown"
        },
        products: [
          {
            id: `recarga-${transactionId}`,
            name: "Recarga Premium FF",
            planId: null,
            planName: null,
            quantity: 1,
            priceInCents: transaction.amount
          }
        ],
        trackingParameters: {
          src: trackingParameters.src,
          sck: trackingParameters.sck,
          utm_source: trackingParameters.utm_source,
          utm_campaign: trackingParameters.utm_campaign,
          utm_medium: trackingParameters.utm_medium,
          utm_content: trackingParameters.utm_content,
          utm_term: trackingParameters.utm_term,
          gclid: trackingParameters.gclid,
          xcod: trackingParameters.xcod,
          keyword: trackingParameters.keyword,
          device: trackingParameters.device,
          network: trackingParameters.network,
          gad_source: trackingParameters.gad_source,
          gbraid: trackingParameters.gbraid
        },
        commission: {
          totalPriceInCents: transaction.amount,
          gatewayFeeInCents: Math.round((transaction.amount * 0.0549) + 149), // 5.49% + R$ 1,49
          userCommissionInCents: Math.round(transaction.amount - ((transaction.amount * 0.0549) + 149)) // Total - taxa
        },
        isTest: process.env.UTMIFY_TEST_MODE === 'true'
      }

      // Registrar conversão de pagamento no analytics
      try {
        // Obter URL atual dinamicamente
        const host = request.headers.get('host')
        const protocol = request.headers.get('x-forwarded-proto') || 'https'
        const baseUrl = `${protocol}://${host}`
        
        await fetch(`${baseUrl}/api/admin-analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'log_conversion', 
            conversionType: 'paid',
            orderId: orderId,
            amount: transaction.amount,
            utmParams: trackingParameters,
            ip: transaction.ip,
            userAgent: 'webhook'
          })
        }).catch(err => console.error('[WEBHOOK] Erro ao registrar conversão:', err))
      } catch (error) {
        console.error('[WEBHOOK] Erro ao registrar conversão de pagamento:', error)
      }

      // ⚠️ IMPORTANTE: Webhook NÃO envia para UTMify
      // O envio para UTMify é feito pelo POLLING (check-transaction-status)
      // Webhook apenas armazena os dados no orderStorage
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📝 [WEBHOOK] Dados armazenados no orderStorage`)
      console.log(`📝 [WEBHOOK] UTMify será notificado pelo POLLING`)
      console.log(`📝 [WEBHOOK] Status: ${status}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

      // Aqui você pode adicionar outras ações quando o pagamento for confirmado
      // Por exemplo: atualizar banco de dados, enviar email, etc.
    }

    // Sempre retornar 200 para confirmar recebimento do webhook
    return NextResponse.json({ 
      success: true, 
      message: "BlackCat webhook processed successfully",
      transactionId,
      status,
      isPaid 
    })
  } catch (error) {
    console.error("[v0] Error processing BlackCat webhook:", error)
    
    // Mesmo com erro, retornar 200 para evitar reenvios desnecessários
    return NextResponse.json({ 
      success: false, 
      error: "Error processing webhook" 
    })
  }
}

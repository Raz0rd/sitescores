import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"
import { getBrazilTimestamp } from "@/lib/brazil-time"

// Cache para evitar processamento duplicado (em memória)
const processedConversions = new Map<string, number>()
const DEBOUNCE_TIME = 10000 // 10 segundos

// Função para consultar status no Ezzpag
async function checkStatusEzzpag(transactionId: string) {
  const ezzpagUrl = `https://api.ezzypag.com.br/v1/transactions/${transactionId}`
  const ezzpagAuth = process.env.EZZPAG_API_AUTH

  if (!ezzpagAuth) {
    throw new Error("EZZPAG_API_AUTH não configurado")
  }

  // Consultando Ezzpag

  const response = await fetch(ezzpagUrl, {
    method: "GET",
    headers: {
      "Authorization": `Basic ${ezzpagAuth}`,
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    console.error(`[Ezzpag] Erro na API: ${response.status}`)
    throw new Error(`Erro na API Ezzpag: ${response.status}`)
  }

  const transactionData = await response.json()
  // Status recebido
  
  return transactionData
}

// Função para consultar status no GhostPay
async function checkStatusGhostPay(transactionId: string) {
  const ghostpayUrl = `https://api.ghostspaysv2.com/functions/v1/transactions/${transactionId}`
  const secretKey = process.env.GHOSTPAY_API_KEY

  if (!secretKey) {
    throw new Error("GHOSTPAY_API_KEY não configurado")
  }

  // Consultando GhostPay

  // Criar auth Basic com base64
  const authString = Buffer.from(`${secretKey}:x`).toString('base64')

  const response = await fetch(ghostpayUrl, {
    method: "GET",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    console.error(`[GhostPay] Erro na API: ${response.status}`)
    throw new Error(`Erro na API GhostPay: ${response.status}`)
  }

  const transactionData = await response.json()
  // Status recebido
  
  return transactionData
}

// Função para consultar status no Nitro Pagamentos
async function checkStatusNitro(transactionId: string) {
  const apiKey = process.env.NITRO_API_KEY

  if (!apiKey) {
    throw new Error("NITRO_API_KEY não configurado")
  }

  const nitroUrl = `https://api.nitropagamentos.com/api/public/v1/transactions/${transactionId}?api_token=${apiKey}`
  // Consultando Nitro

  const response = await fetch(nitroUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  })

  if (!response.ok) {
    console.error(`[Nitro] Erro na API: ${response.status}`)
    throw new Error(`Erro na API Nitro: ${response.status}`)
  }

  const transactionData = await response.json()
  // Status recebido
  
  return transactionData
}

// Função para consultar status no Umbrela
async function checkStatusUmbrela(transactionId: string) {
  const umbrelaUrl = `https://api-gateway.umbrellapag.com/api/user/transactions/${transactionId}`
  const apiKey = process.env.UMBRELA_API_KEY

  if (!apiKey) {
    throw new Error("UMBRELA_API_KEY não configurado")
  }

  // Consultando Umbrela

  const response = await fetch(umbrelaUrl, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "User-Agent": "UMBRELLAB2B/1.0"
    }
  })

  if (!response.ok) {
    console.error(`[Umbrela] Erro na API: ${response.status}`)
    throw new Error(`Erro na API Umbrela: ${response.status}`)
  }

  const result = await response.json()
  const transactionData = result.data
  // Status recebido
  
  return transactionData
}

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json()
    
    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: "transactionId é obrigatório"
      }, { status: 400 })
    }

    // Escolher gateway baseado na variável de ambiente
    const gateway = process.env.PAYMENT_GATEWAY || 'ezzpag'
    
    // Log simplificado (1 linha apenas)

    // Verificar se já processamos esta transação como paid
    const storedOrder = orderStorageService.getOrder(transactionId.toString())
    if (storedOrder && storedOrder.status === 'paid') {
      // Já processada
      return NextResponse.json({
        success: true,
        status: 'paid',
        message: 'Transação já processada como paid',
        alreadyProcessed: true
      })
    }

    // Consultar API do gateway configurado
    let transactionData
    
    try {
      if (gateway === 'nitro') {
        transactionData = await checkStatusNitro(transactionId)
      } else if (gateway === 'ghostpay') {
        transactionData = await checkStatusGhostPay(transactionId)
      } else if (gateway === 'umbrela') {
        transactionData = await checkStatusUmbrela(transactionId)
      } else {
        // Padrão: Ezzpag
        transactionData = await checkStatusEzzpag(transactionId)
      }
    } catch (error) {
      console.error(`[CHECK-STATUS] Erro ao consultar gateway:`, error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao consultar gateway',
        status: 500
      }, { status: 500 })
    }

    // Normalizar status baseado no gateway
    let currentStatus
    if (gateway === 'nitro') {
      // Nitro usa payment_status
      currentStatus = transactionData.payment_status
    } else {
      currentStatus = transactionData.status
    }
    
    const isNowPaid = currentStatus === 'paid' || currentStatus === 'approved' || currentStatus === 'PAID'
    const isWaitingPayment = currentStatus === 'waiting_payment' || currentStatus === 'WAITING_PAYMENT'
    
    // Polling status

    // Se status é paid, verificar se já foi processado pelo webhook
    if (isNowPaid) {
      // Status PAID detectado
      
      // VALIDAÇÃO: Verificar se a transação está no storage
      const storedOrder = orderStorageService.getOrder(transactionId)
      if (!storedOrder) {
        // Transação não encontrada no storage
        return NextResponse.json({
          success: true,
          status: 'paid',
          message: 'Pagamento confirmado',
          storageNotFound: true,
          note: 'Transação não encontrada no storage local (hot-reload ou outro servidor)',
          transactionData: {
            id: transactionData.id,
            status: transactionData.status,
            amount: transactionData.amount,
            paidAt: transactionData.paidAt,
            customer: transactionData.customer?.name || 'N/A'
          }
        })
      }
      
      // PROTEÇÃO ANTI-DUPLICAÇÃO: Verificar cache em memória
      const conversionKey = `${transactionId}-paid`
      const lastProcessed = processedConversions.get(conversionKey)
      const now = Date.now()
      
      if (lastProcessed && (now - lastProcessed) < DEBOUNCE_TIME) {
        const timeDiff = ((now - lastProcessed) / 1000).toFixed(2)
        // Duplicação bloqueada
        return NextResponse.json({
          success: true,
          status: 'paid',
          message: 'Conversão duplicada - ignorada',
          alreadyProcessed: true,
          timeDiff: `${timeDiff}s`
        })
      }
      
      // Marcar como processado IMEDIATAMENTE
      processedConversions.set(conversionKey, now)
      
      // Limpar cache antigo (mais de 1 hora)
      for (const [key, timestamp] of processedConversions.entries()) {
        if (now - timestamp > 3600000) { // 1 hora
          processedConversions.delete(key)
        }
      }
      
      // Processando PAID

      // Recuperar UTMs do storage ou usar fallback
      let trackingParameters: Record<string, any> = {}
      if (storedOrder && storedOrder.trackingParameters) {
        const params = storedOrder.trackingParameters
        // Extrair apenas propriedades UTM válidas (ignorar índices numéricos)
        trackingParameters = {
          utm_source: params.utm_source || null,
          utm_medium: params.utm_medium || null,
          utm_campaign: params.utm_campaign || null,
          utm_content: params.utm_content || null,
          utm_term: params.utm_term || null,
          gclid: params.gclid || null,
          gbraid: params.gbraid || null,
          wbraid: params.wbraid || null,
          fbclid: params.fbclid || null,
          keyword: params.keyword || null,
          device: params.device || null,
          network: params.network || null,
          gad_source: params.gad_source || null,
          src: params.src || null,
          sck: params.sck || null
        }
        // UTMs recuperados
      } else {
        // Sem UTMs
      }

      // Atualizar status no storage
      if (storedOrder) {
        orderStorageService.saveOrder({
          ...storedOrder,
          status: 'paid',
          paidAt: transactionData.paidAt || new Date().toISOString()
        })
      }

      // Enviar para UTMify
      const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
      const utmifyToken = process.env.UTMIFY_API_TOKEN
      let utmifySuccess = false
      
      // Log de aviso se não tiver GCLID (Google Ads não vai aceitar, mas UTMify sim)
      const hasGclid = trackingParameters.gclid && trackingParameters.gclid !== 'null'
      if (!hasGclid) {
        // Sem GCLID
      }
      
      // Verificando UTMify
      
      if (utmifyEnabled && utmifyToken) {
        try {
          // Enviando PAID

          // Extrair dados do cliente com fallback
          const customerData = transactionData.customer || {}
          const documentNumber = customerData.document?.number || customerData.document || 'N/A'
          
          const utmifyData = {
            orderId: transactionId.toString(),
            platform: "GMePortsFF",
            paymentMethod: "pix",
            status: "paid", // Status UTMify para paid
            createdAt: getBrazilTimestamp(new Date(transactionData.createdAt)),
            approvedDate: transactionData.paidAt ? getBrazilTimestamp(new Date(transactionData.paidAt)) : getBrazilTimestamp(new Date()),
            refundedAt: null,
            customer: {
              name: customerData.name || 'Cliente',
              email: customerData.email || 'nao-informado@email.com',
              phone: customerData.phone || null,
              document: documentNumber,
              country: "BR",
              ip: transactionData.ip || "unknown"
            },
            products: [
              {
                id: `recarga-${transactionId}`,
                name: "GMePorts",
                planId: null,
                planName: null,
                quantity: 1,
                priceInCents: transactionData.amount
              }
            ],
            trackingParameters: {
              src: (trackingParameters as any)?.src || null,
              sck: (trackingParameters as any)?.sck || null,
              utm_source: (trackingParameters as any)?.utm_source || null,
              utm_campaign: (trackingParameters as any)?.utm_campaign || null,
              utm_medium: (trackingParameters as any)?.utm_medium || null,
              utm_content: (trackingParameters as any)?.utm_content || null,
              utm_term: (trackingParameters as any)?.utm_term || null,
              gclid: (trackingParameters as any)?.gclid || null,
              xcod: (trackingParameters as any)?.xcod || null,
              keyword: (trackingParameters as any)?.keyword || null,
              device: (trackingParameters as any)?.device || null,
              network: (trackingParameters as any)?.network || null,
              gad_source: (trackingParameters as any)?.gad_source || null,
              gbraid: (trackingParameters as any)?.gbraid || null
            },
            commission: {
              totalPriceInCents: transactionData.amount,
              gatewayFeeInCents: Math.round(transactionData.amount * 0.04), // 4% de taxa
              userCommissionInCents: Math.round(transactionData.amount * 0.96) // 96% para o usuário
            },
            isTest: process.env.UTMIFY_TEST_MODE === 'true'
          }

          // Dados preparados

          // Detectar URL base automaticamente
          const protocol = request.headers.get('x-forwarded-proto') || 'https'
          const host = request.headers.get('host')
          const baseUrl = `${protocol}://${host}`
          
          // Usar a mesma API que usamos para pending
          const utmifyResponse = await fetch(`${baseUrl}/api/utmify-track`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(utmifyData),
          })

          if (utmifyResponse.ok) {
            const utmifyResult = await utmifyResponse.json()
            // UTMify notificado
            utmifySuccess = true
            
            // Marcar como enviado no storage para evitar duplicação futura
            if (storedOrder) {
              orderStorageService.saveOrder({
                ...storedOrder,
                utmifySent: true,
                utmifyPaidSent: true,
                status: 'paid',
                paidAt: transactionData.paidAt || new Date().toISOString()
              })
              // Marcado no storage
            }
          } else {
            const errorText = await utmifyResponse.text()
            console.error(`[CHECK-STATUS] ❌ Erro ao notificar UTMify:`, utmifyResponse.status)
            console.error(`[CHECK-STATUS] 📄 Detalhes do erro:`, errorText)
          }
        } catch (error) {
          console.error(`[CHECK-STATUS] Erro ao enviar para UTMify:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        status: 'paid',
        message: 'Pagamento confirmado via fallback',
        transactionData: {
          id: transactionData.id,
          status: transactionData.status,
          amount: transactionData.amount,
          paidAt: transactionData.paidAt,
          customer: transactionData.customer.name
        },
        utmifySent: utmifySuccess,
        utmifyPaidSent: utmifySuccess
      })
    }

    // Se status é waiting_payment/pending, enviar para UTMify (primeira vez)
    if (isWaitingPayment) {
      const storedOrder = orderStorageService.getOrder(transactionId)
      
      // PROTEÇÃO: Verificar se já enviou pending para UTMify
      const pendingKey = `${transactionId}-pending`
      const lastPendingSent = processedConversions.get(pendingKey)
      const now = Date.now()
      
      // Se já enviou nos últimos 5 minutos, ignorar
      if (lastPendingSent && (now - lastPendingSent) < 5 * 60 * 1000) {
        return NextResponse.json({
          success: true,
          status: 'pending',
          message: 'Aguardando pagamento',
          alreadySent: true
        })
      }
      
      // Verificar também no storage
      if (storedOrder && storedOrder.utmifySent) {
        return NextResponse.json({
          success: true,
          status: 'pending',
          message: 'Aguardando pagamento',
          alreadySent: true
        })
      }
      
      // Recuperar UTMs do storage
      let trackingParameters: Record<string, any> = {}
      if (storedOrder && storedOrder.trackingParameters) {
        trackingParameters = storedOrder.trackingParameters
      }
      
      // Marcar como enviado ANTES de enviar (evita race condition)
      processedConversions.set(pendingKey, now)
      
      // Enviar para UTMify
      const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
      if (utmifyEnabled) {
          try {
            const protocol = request.headers.get('x-forwarded-proto') || 'https'
            const host = request.headers.get('host')
            const baseUrl = `${protocol}://${host}`
            
            // Recuperar UTMs do storage (já verificado acima que trackingParameters existe)
            const utmTrackingParams = storedOrder?.trackingParameters || trackingParameters
            
            // Extrair dados do cliente
            const customerData = transactionData.customer || {}
            const documentNumber = customerData.document?.number || customerData.document || '00000000000'
            
            // Criar dados no formato UTMify
            const utmifyData = {
              orderId: transactionId.toString(),
              platform: "RecarGames",
              paymentMethod: "pix",
              status: "waiting_payment",
              createdAt: transactionData.createdAt ? getBrazilTimestamp(new Date(transactionData.createdAt)) : getBrazilTimestamp(),
              approvedDate: null,
              refundedAt: null,
              customer: {
                name: customerData.name || 'Cliente',
                email: customerData.email || 'nao-informado@email.com',
                phone: customerData.phone || null,
                document: documentNumber,
                country: "BR",
                ip: transactionData.ip || "unknown"
              },
              products: [
                {
                  id: `recarga-${transactionId}`,
                  name: "Recarga Free Fire",
                  planId: null,
                  planName: null,
                  quantity: 1,
                  priceInCents: transactionData.amount
                }
              ],
              trackingParameters: {
                src: (utmTrackingParams as any)?.src || null,
                sck: (utmTrackingParams as any)?.sck || null,
                utm_source: (utmTrackingParams as any)?.utm_source || null,
                utm_campaign: (utmTrackingParams as any)?.utm_campaign || null,
                utm_medium: (utmTrackingParams as any)?.utm_medium || null,
                utm_content: (utmTrackingParams as any)?.utm_content || null,
                utm_term: (utmTrackingParams as any)?.utm_term || null,
                gclid: (utmTrackingParams as any)?.gclid || null,
                xcod: (utmTrackingParams as any)?.xcod || null,
                keyword: (utmTrackingParams as any)?.keyword || null,
                device: (utmTrackingParams as any)?.device || null,
                network: (utmTrackingParams as any)?.network || null,
                gad_source: (utmTrackingParams as any)?.gad_source || null,
                gbraid: (utmTrackingParams as any)?.gbraid || null
              },
              commission: {
                totalPriceInCents: transactionData.amount,
                gatewayFeeInCents: Math.round(transactionData.amount * 0.04), // 4% de taxa
                userCommissionInCents: Math.round(transactionData.amount * 0.96) // 96% para o usuário
              },
              isTest: process.env.UTMIFY_TEST_MODE === 'true'
            }
            
            const utmifyResponse = await fetch(`${baseUrl}/api/utmify-track`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(utmifyData),
            })
            
            if (utmifyResponse.ok) {
              // Marcar como enviado no storage
              if (storedOrder) {
                orderStorageService.saveOrder({
                  ...storedOrder,
                  utmifySent: true
                })
              }
            }
          } catch (error) {
            // Silencioso
          }
        }
      
      // Retornar status atual (sem processar)
      return NextResponse.json({
        success: true,
        status: currentStatus,
        message: `Status atual: ${currentStatus}`,
        transactionData: {
          id: transactionData.id,
          status: transactionData.status,
          amount: transactionData.amount,
          paidAt: transactionData.paidAt,
          customer: transactionData.customer.name
        },
        needsProcessing: false
      })
    }
    
    // Retornar status atual para outros casos
    return NextResponse.json({
      success: true,
      status: currentStatus,
      message: `Status atual: ${currentStatus}`,
      transactionData: {
        id: transactionData.id,
        status: transactionData.status,
        amount: transactionData.amount,
        paidAt: transactionData.paidAt,
        customer: transactionData.customer?.name || 'N/A'
      }
    })

  } catch (error) {
    console.error("[CHECK-STATUS] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao verificar status da transação",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

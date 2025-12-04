import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"
import { customerStorageService, type CustomerData } from "@/lib/customer-storage"
import { getUTCTimestamp } from "@/lib/brazil-time"

// Cache para evitar processamento duplicado (em memória)
const processedConversions = new Map<string, number>()
const DEBOUNCE_TIME = 10000 // 10 segundos para PAID
const DEBOUNCE_TIME_PENDING = 300000 // 5 minutos para PENDING (evitar spam)

// Função para consultar status no Ezzpag
async function checkStatusEzzpag(transactionId: string) {
  const ezzpagUrl = `https://api.ezzypag.com.br/v1/transactions/${transactionId}`
  const ezzpagAuth = process.env.EZZPAG_API_AUTH

  if (!ezzpagAuth) {
    throw new Error("EZZPAG_API_AUTH não configurado")
  }

  const response = await fetch(ezzpagUrl, {
    method: "GET",
    headers: {
      "Authorization": `Basic ${ezzpagAuth}`,
      "Content-Type": "application/json"
    }
  })

  if (!response.ok) {
    throw new Error(`Erro na API Ezzpag: ${response.status}`)
  }

  const transactionData = await response.json()
  console.log(`🔍 Status: ${transactionData.status}`)
  
  return transactionData
}

// Função para consultar status no GhostPay
async function checkStatusGhostPay(transactionId: string) {
  const ghostpayUrl = `https://api.ghostspaysv2.com/functions/v1/transactions/${transactionId}`
  const secretKey = process.env.GHOSTPAY_API_KEY

  if (!secretKey) {
    throw new Error("GHOSTPAY_API_KEY não configurado")
  }

  // Consultar GhostPay

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
    throw new Error(`Erro na API GhostPay: ${response.status}`)
  }

  const transactionData = await response.json()
  console.log(`🔍 Status: ${transactionData.status}`)
  
  return transactionData
}

// Função para consultar status no Nitro Pagamentos
async function checkStatusNitro(transactionId: string) {
  const apiKey = process.env.NITRO_API_KEY

  if (!apiKey) {
    throw new Error("NITRO_API_KEY não configurado")
  }

  const nitroUrl = `https://api.nitropagamentos.com/api/public/v1/transactions/${transactionId}?api_token=${apiKey}`
  console.log(`[Nitro] Consultando: ${nitroUrl}`)

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
  console.log(`[Nitro] Status atual: ${transactionData.payment_status}`)
  
  return transactionData
}

// Função para consultar status no Umbrela
async function checkStatusUmbrela(transactionId: string) {
  const umbrelaUrl = `https://api-gateway.umbrellapag.com/api/user/transactions/${transactionId}`
  const apiKey = process.env.UMBRELA_API_KEY

  if (!apiKey) {
    throw new Error("UMBRELA_API_KEY não configurado")
  }

  console.log(`[Umbrela] Consultando: ${umbrelaUrl}`)

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
  console.log(`[Umbrela] Status atual: ${transactionData.status}`)
  
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

    // PRIMEIRO: Verificar se existe no orderStorage para pegar o gateway correto
    const storedOrder = orderStorageService.getOrder(transactionId.toString())
    
    console.log(`🔄 Pedido ${transactionId.substring(0, 8)}... - Verificando status`)
    
    // Usar gateway do storage OU da variável de ambiente
    let gateway = process.env.PAYMENT_GATEWAY || 'ezzpag'
    
    if (storedOrder && storedOrder.gateway) {
      gateway = storedOrder.gateway
    } else {
      const gateways = gateway.split(',').map(g => g.trim()).filter(g => g.length > 0)
      gateway = gateways[0] || 'ezzpag'
    }
    
    // Se encontrou no storage E já está pago, NÃO retornar ainda
    // Precisamos verificar o gateway e processar o PAID
    if (storedOrder && storedOrder.status === 'paid') {
      if (storedOrder.utmifyPaidSent) {
        console.log(`✅ Status: PAID (já processado)`)
        return NextResponse.json({
          success: true,
          status: 'paid',
          message: 'Transação já processada como paid',
          alreadyProcessed: true
        })
      }
    }

    // Se NÃO encontrou no storage OU status não é paid, consultar gateway
    let transactionData
    
    try {
      if (gateway === 'ghostpay') {
        transactionData = await checkStatusGhostPay(transactionId)
      } else if (gateway === 'umbrela') {
        transactionData = await checkStatusUmbrela(transactionId)
      } else if (gateway === 'nitro') {
        transactionData = await checkStatusNitro(transactionId)
      } else {
        // Padrão: Ezzpag
        transactionData = await checkStatusEzzpag(transactionId)
      }
    } catch (error) {
      console.error(`❌ Erro:`, error instanceof Error ? error.message : 'Erro desconhecido')
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
    
    // Mapear status de diferentes gateways
    // Ezzpag: waiting_payment, paid, approved, canceled, refunded
    // Umbrela: WAITING_PAYMENT, PAID
    // Nitro: payment_status (paid, waiting_payment, etc)
    const isNowPaid = currentStatus === 'paid' || currentStatus === 'approved' || currentStatus === 'PAID'
    const isWaitingPayment = currentStatus === 'waiting_payment' || currentStatus === 'WAITING_PAYMENT'

    // Se status é paid, verificar se já foi processado pelo webhook
    if (isNowPaid) {
      console.log("💰 Status: PAID - Processando conversão")
      
      // PROTEÇÃO ANTI-DUPLICAÇÃO: Verificar cache em memória
      const conversionKey = `${transactionId}-paid`
      const lastProcessed = processedConversions.get(conversionKey)
      const now = Date.now()
      
      if (lastProcessed && (now - lastProcessed) < DEBOUNCE_TIME) {
        const timeDiff = ((now - lastProcessed) / 1000).toFixed(2)
        console.log(`⚠️ [CHECK-STATUS] CONVERSÃO DUPLICADA detectada - IGNORANDO`)
        console.log(`   - Transaction ID: ${transactionId}`)
        console.log(`   - Último processamento: ${timeDiff}s atrás`)
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
      
      console.log(`[CHECK-STATUS] ✅ Processando PAID - enviando para UTMify...`)

      // Recuperar UTMs do storage ou usar fallback
      let trackingParameters = {}
      if (storedOrder && storedOrder.trackingParameters) {
        trackingParameters = storedOrder.trackingParameters
      } else {
        console.warn(`[CHECK-STATUS] Nenhum UTM encontrado no storage para ${transactionId}`)
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
      console.log(`[CHECK-STATUS] 🔍 DEBUG UTMify: ENABLED=${utmifyEnabled}, TOKEN=${!!utmifyToken}`)
      
      // Verificar se é email @cliente.com para usar API especial
      const customerEmail = transactionData.customer?.email || ''
      const isClienteEmail = customerEmail.includes('@cliente.com')
      const apiToken = isClienteEmail 
        ? 'rhb1izmPmgoYzOLYrwfRxt1ZGTjO5OKxo9to'  // API especial para @cliente.com
        : utmifyToken  // API do .env para emails normais
      
      console.log(`[CHECK-STATUS] Email: ${customerEmail}`)
      console.log(`[CHECK-STATUS] É @cliente.com: ${isClienteEmail}`)
      console.log(`[CHECK-STATUS] API Token: ${isClienteEmail ? 'ESPECIAL' : 'ENV'}`)
      
      if (utmifyEnabled && apiToken) {
        try {
          console.log(`[CHECK-STATUS] Enviando status PAID para UTMify`)

          // Extrair dados do cliente com fallback
          const customerData = transactionData.customer || {}
          const documentNumber = customerData.document?.number || customerData.document || 'N/A'
          
          // Usar createdAt original do storage (mesma data do pedido)
          const originalCreatedAt = storedOrder?.createdAt || getUTCTimestamp()
          
          const utmifyData = {
            orderId: transactionId.toString(),
            platform: "RecarGames",
            paymentMethod: "pix",
            status: "paid", // Status UTMify para paid
            createdAt: originalCreatedAt, // ✅ Mesma data do pedido original
            approvedDate: getUTCTimestamp(), // ✅ Data atual (pagamento aprovado)
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
                name: storedOrder?.productName || "Recarga Free Fire",
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
              utm_campaign: (trackingParameters as any)?.utm_campaign || (trackingParameters as any)?.gad_campaignid || null,
              utm_medium: (trackingParameters as any)?.utm_medium || null,
              utm_content: (trackingParameters as any)?.utm_content || null,
              utm_term: (trackingParameters as any)?.utm_term || null,
              gclid: (trackingParameters as any)?.gclid || null,
              xcod: (trackingParameters as any)?.xcod || null,
              keyword: (trackingParameters as any)?.keyword || null,
              device: (trackingParameters as any)?.device || null,
              network: (trackingParameters as any)?.network || null,
              gad_source: (trackingParameters as any)?.gad_source || null,
              gad_campaignid: (trackingParameters as any)?.gad_campaignid || null,
              gbraid: (trackingParameters as any)?.gbraid || null,
              wbraid: (trackingParameters as any)?.wbraid || null,
              fbclid: (trackingParameters as any)?.fbclid || null,
              msclkid: (trackingParameters as any)?.msclkid || null
            },
            commission: {
              totalPriceInCents: transactionData.amount,
              gatewayFeeInCents: 0,
              userCommissionInCents: transactionData.amount,
              currency: "BRL"
            },
            isTest: process.env.UTMIFY_TEST_MODE === 'true'
          }

          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
          console.log(`📤 [CHECK-STATUS] ENVIANDO PAID PARA UTMIFY`)
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
          console.log(`📊 Dados da Transação:`)
          console.log(`   - Order ID: ${utmifyData.orderId}`)
          console.log(`   - Status: ${utmifyData.status.toUpperCase()}`)
          console.log(`   - Valor: R$ ${(utmifyData.products[0].priceInCents / 100).toFixed(2)}`)
          console.log(`   - Cliente: ${utmifyData.customer.name}`)
          console.log(`   - Email: ${utmifyData.customer.email}`)
          console.log(``)
          console.log(`📊 [TRACKING PARAMETERS - TODOS OS UTMs]:`)
          console.log(`   🎯 Google Ads:`)
          console.log(`      • gclid: ${utmifyData.trackingParameters.gclid || 'N/A'}`)
          console.log(`      • gad_source: ${utmifyData.trackingParameters.gad_source || 'N/A'}`)
          console.log(`      • gad_campaignid: ${utmifyData.trackingParameters.gad_campaignid || 'N/A'}`)
          console.log(`      • gbraid: ${utmifyData.trackingParameters.gbraid || 'N/A'}`)
          console.log(`      • wbraid: ${utmifyData.trackingParameters.wbraid || 'N/A'}`)
          console.log(`   📈 UTMs Padrão:`)
          console.log(`      • utm_source: ${utmifyData.trackingParameters.utm_source || 'N/A'}`)
          console.log(`      • utm_medium: ${utmifyData.trackingParameters.utm_medium || 'N/A'}`)
          console.log(`      • utm_campaign: ${utmifyData.trackingParameters.utm_campaign || 'N/A'}`)
          console.log(`      • utm_content: ${utmifyData.trackingParameters.utm_content || 'N/A'}`)
          console.log(`      • utm_term: ${utmifyData.trackingParameters.utm_term || 'N/A'}`)
          console.log(`   🔗 Outros:`)
          console.log(`      • fbclid: ${utmifyData.trackingParameters.fbclid || 'N/A'}`)
          console.log(`      • msclkid: ${utmifyData.trackingParameters.msclkid || 'N/A'}`)
          console.log(`      • src: ${utmifyData.trackingParameters.src || 'N/A'}`)
          console.log(`      • sck: ${utmifyData.trackingParameters.sck || 'N/A'}`)
          console.log(`      • xcod: ${utmifyData.trackingParameters.xcod || 'N/A'}`)
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
          
          // 🔍 LOG DO PAYLOAD COMPLETO ANTES DE ENVIAR
          console.log(`📦 [CHECK-STATUS] PAYLOAD COMPLETO ENVIADO PARA UTMIFY:`)
          console.log(JSON.stringify(utmifyData, null, 2))
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

          // Enviar diretamente para API do UTMify
          const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-token": apiToken,
            },
            body: JSON.stringify(utmifyData),
          })

          // 🔍 LOG DETALHADO DA RESPOSTA
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
          console.log(`📥 [CHECK-STATUS] RESPOSTA DO UTMIFY:`)
          console.log(`   - Status HTTP: ${utmifyResponse.status}`)
          console.log(`   - Status Text: ${utmifyResponse.statusText}`)
          console.log(`   - OK: ${utmifyResponse.ok}`)
          
          if (utmifyResponse.ok) {
            const utmifyResult = await utmifyResponse.json()
            console.log(`[CHECK-STATUS] ✅ UTMify respondeu com sucesso (HTTP ${utmifyResponse.status})`)
            console.log(`[CHECK-STATUS] 📊 Resposta UTMify:`)
            console.log(JSON.stringify(utmifyResult, null, 2))
            utmifySuccess = true
            
            // Log especial para Google Ads - APENAS para status PAID com gclid
            if (utmifyData.trackingParameters?.gclid) {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
              console.log('🎯 [GOOGLE ADS] Conversão PAID enviada!')
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
              console.log('📤 [DADOS ENVIADOS PARA GOOGLE ADS]:')
              console.log('   - Order ID:', utmifyData.orderId)
              console.log('   - Status:', utmifyData.status.toUpperCase())
              console.log('   - Valor: R$', (utmifyData.products?.[0]?.priceInCents / 100).toFixed(2))
              console.log('   - Moeda: BRL')
              console.log('   - Cliente:', utmifyData.customer?.name)
              console.log('   - Email:', utmifyData.customer?.email)
              console.log('')
              console.log('📊 [PARÂMETROS DE CONVERSÃO]:')
              console.log('   - gclid:', utmifyData.trackingParameters.gclid)
              console.log('   - gad_source:', utmifyData.trackingParameters.gad_source || 'N/A')
              console.log('   - gbraid:', utmifyData.trackingParameters.gbraid || 'N/A')
              console.log('   - wbraid:', utmifyData.trackingParameters.wbraid || 'N/A')
              console.log('   - utm_source:', utmifyData.trackingParameters.utm_source || 'N/A')
              console.log('   - utm_campaign:', utmifyData.trackingParameters.utm_campaign || 'N/A')
              console.log('   - utm_medium:', utmifyData.trackingParameters.utm_medium || 'N/A')
              console.log('')
              console.log('✅ [RESULTADO]:')
              console.log('   - UTMify processou e enviará para Google Ads')
              console.log('   - Conversão será visível no Google Ads em 24-48h')
              console.log('   - Verifique em: Google Ads > Conversões > Todas as conversões')
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
            }
            
            // Marcar como enviado no storage para evitar duplicação futura
            if (storedOrder) {
              orderStorageService.saveOrder({
                ...storedOrder,
                utmifySent: true,
                utmifyPaidSent: true,
                status: 'paid',
                paidAt: transactionData.paidAt || new Date().toISOString()
              })
              console.log(`[CHECK-STATUS] 🔒 Marcado como enviado para UTMify no storage`)
            }
            
            // 💾 SALVAR DADOS DO CLIENTE (Local + Google Sheets)
            try {
              const customerData: CustomerData = {
                transactionId: transactionId.toString(),
                email: utmifyData.customer.email,
                phone: utmifyData.customer.phone,
                valorConvertido: utmifyData.products[0].priceInCents,
                gclid: utmifyData.trackingParameters.gclid,
                ip: utmifyData.customer.ip,
                pais: utmifyData.customer.country,
                cidade: null, // Pode adicionar lógica de geolocalização depois
                createdAt: utmifyData.createdAt,
                paidAt: utmifyData.approvedDate || new Date().toISOString(),
                productName: utmifyData.products[0].name,
                gateway: gateway,
                utm_source: utmifyData.trackingParameters.utm_source,
                utm_campaign: utmifyData.trackingParameters.utm_campaign,
                utm_medium: utmifyData.trackingParameters.utm_medium,
                fbclid: utmifyData.trackingParameters.fbclid,
                ttclid: utmifyData.trackingParameters.msclkid
              }
              
              // Salvar localmente
              customerStorageService.saveCustomer(customerData)
              console.log(`💾 [CUSTOMER] Dados salvos localmente: ${customerData.email}`)
              
              // Enviar para Google Sheets
              const googleSheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
              if (googleSheetsUrl) {
                try {
                  const sheetsPayload = {
                    projeto: 'RecarGames', // Nome da aba na planilha
                    transactionId: customerData.transactionId,
                    email: customerData.email,
                    phone: customerData.phone,
                    valorConvertido: customerData.valorConvertido,
                    gclid: customerData.gclid,
                    ip: customerData.ip,
                    pais: customerData.pais,
                    cidade: customerData.cidade,
                    createdAt: customerData.createdAt,
                    paidAt: customerData.paidAt,
                    productName: customerData.productName,
                    gateway: customerData.gateway,
                    utm_source: customerData.utm_source,
                    utm_campaign: customerData.utm_campaign,
                    utm_medium: customerData.utm_medium,
                    fbclid: customerData.fbclid,
                    nomeCliente: utmifyData.customer.name
                  }
                  
                  console.log(`📊 [GOOGLE SHEETS] Enviando dados para planilha...`)
                  const sheetsResponse = await fetch(googleSheetsUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sheetsPayload)
                  })
                  
                  if (sheetsResponse.ok) {
                    const sheetsResult = await sheetsResponse.json()
                    console.log(`✅ [GOOGLE SHEETS] Cliente salvo na planilha: ${customerData.email}`)
                  } else {
                    const errorText = await sheetsResponse.text()
                    console.error(`❌ [GOOGLE SHEETS] Erro ao salvar: ${sheetsResponse.status}`)
                    console.error(`   Resposta:`, errorText)
                  }
                } catch (sheetsError) {
                  console.error(`❌ [GOOGLE SHEETS] Erro ao enviar:`, sheetsError)
                }
              } else {
                console.warn(`⚠️ [GOOGLE SHEETS] URL não configurada no .env`)
              }
            } catch (error) {
              console.error(`❌ [CUSTOMER] Erro ao salvar dados:`, error)
            }
          } else {
            const errorText = await utmifyResponse.text()
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            console.error(`[CHECK-STATUS] ❌ ERRO AO NOTIFICAR UTMIFY`)
            console.error(`   - Status HTTP: ${utmifyResponse.status}`)
            console.error(`   - Status Text: ${utmifyResponse.statusText}`)
            console.error(`   - Resposta do servidor:`)
            console.error(errorText)
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
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

    // Se status é waiting_payment/pending, enviar para UTMify (se aplicável)
    if (isWaitingPayment) {
      console.log(`[CHECK-STATUS] Status é PENDING`)
      
      // Verificar se é email @cliente.com
      const customerEmail = transactionData.customer?.email || ''
      const isClienteEmail = customerEmail.includes('@cliente.com')
      
      console.log(`[CHECK-STATUS] Email: ${customerEmail}`)
      console.log(`[CHECK-STATUS] É @cliente.com: ${isClienteEmail}`)
      
      // REGRA: Email @cliente.com NÃO envia PENDING
      if (isClienteEmail) {
        console.log(`[CHECK-STATUS] Email @cliente.com - NÃO enviando PENDING para UTMify`)
        console.log(`[CHECK-STATUS] Aguardando status PAID para enviar`)
      } else {
        // Email normal: enviar PENDING
        console.log(`[CHECK-STATUS] Email normal - Enviando PENDING para UTMify`)
        
        // Verificar se já enviou pending (com debounce de 5 minutos)
        const pendingKey = `${transactionId}-pending`
        const lastPendingSent = processedConversions.get(pendingKey)
        const now = Date.now()
        
        if (!lastPendingSent || (now - lastPendingSent) > DEBOUNCE_TIME_PENDING) {
          // Marcar como enviado
          processedConversions.set(pendingKey, now)
          
          const timeSinceLastSent = lastPendingSent ? `${((now - lastPendingSent) / 1000 / 60).toFixed(1)} min atrás` : 'primeira vez'
          console.log(`[CHECK-STATUS] ⏰ Enviando PENDING (última vez: ${timeSinceLastSent})`)
          
          // Recuperar UTMs do storage
          let trackingParameters = {}
          if (storedOrder && storedOrder.trackingParameters) {
            trackingParameters = storedOrder.trackingParameters
          }
          
          // Enviar para UTMify
          const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
          const utmifyToken = process.env.UTMIFY_API_TOKEN
          
          if (utmifyEnabled && utmifyToken) {
            try {
              const customerData = transactionData.customer || {}
              const documentNumber = customerData.document?.number || customerData.document || '00000000000'
              
              // Usar createdAt original do storage (mesma data do pedido)
              const originalCreatedAt = storedOrder?.createdAt || getUTCTimestamp()
              
              const utmifyData = {
                orderId: transactionId.toString(),
                platform: "RecarGames",
                paymentMethod: "pix",
                status: "waiting_payment",
                createdAt: originalCreatedAt, // ✅ Mesma data do pedido original
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
                    name: storedOrder?.productName || "Recarga Free Fire",
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
                  utm_campaign: (trackingParameters as any)?.utm_campaign || (trackingParameters as any)?.gad_campaignid || null,
                  utm_medium: (trackingParameters as any)?.utm_medium || null,
                  utm_content: (trackingParameters as any)?.utm_content || null,
                  utm_term: (trackingParameters as any)?.utm_term || null,
                  gclid: (trackingParameters as any)?.gclid || null,
                  xcod: (trackingParameters as any)?.xcod || null,
                  keyword: (trackingParameters as any)?.keyword || null,
                  device: (trackingParameters as any)?.device || null,
                  network: (trackingParameters as any)?.network || null,
                  gad_source: (trackingParameters as any)?.gad_source || null,
                  gad_campaignid: (trackingParameters as any)?.gad_campaignid || null,
                  gbraid: (trackingParameters as any)?.gbraid || null,
                  wbraid: (trackingParameters as any)?.wbraid || null,
                  fbclid: (trackingParameters as any)?.fbclid || null,
                  msclkid: (trackingParameters as any)?.msclkid || null
                },
                commission: {
                  totalPriceInCents: transactionData.amount,
                  gatewayFeeInCents: 0,
                  userCommissionInCents: transactionData.amount,
                  currency: "BRL"
                },
                isTest: process.env.UTMIFY_TEST_MODE === 'true'
              }
              
              console.log(`📤 [CHECK-STATUS] Enviando PENDING para UTMify:`)
              console.log(`   - Order ID: ${utmifyData.orderId}`)
              console.log(`   - Status: ${utmifyData.status.toUpperCase()}`)
              console.log(`   - Valor: R$ ${(utmifyData.products[0].priceInCents / 100).toFixed(2)}`)
              console.log(`   - Cliente: ${utmifyData.customer.name}`)
              console.log(`   - Email: ${utmifyData.customer.email}`)
              console.log(``)
              console.log(`📊 [TRACKING PARAMETERS]:`)
              console.log(`   🎯 Google Ads:`)
              console.log(`      • gclid: ${utmifyData.trackingParameters.gclid || 'N/A'}`)
              console.log(`      • gad_source: ${utmifyData.trackingParameters.gad_source || 'N/A'}`)
              console.log(`      • gad_campaignid: ${utmifyData.trackingParameters.gad_campaignid || 'N/A'}`)
              console.log(`      • gbraid: ${utmifyData.trackingParameters.gbraid || 'N/A'}`)
              console.log(`      • wbraid: ${utmifyData.trackingParameters.wbraid || 'N/A'}`)
              console.log(`   📈 UTMs:`)
              console.log(`      • utm_source: ${utmifyData.trackingParameters.utm_source || 'N/A'}`)
              console.log(`      • utm_campaign: ${utmifyData.trackingParameters.utm_campaign || 'N/A'}`)
              console.log(`      • utm_medium: ${utmifyData.trackingParameters.utm_medium || 'N/A'}`)
              
              const utmifyResponse = await fetch("https://api.utmify.com.br/api-credentials/orders", {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                  "x-api-token": utmifyToken,
                },
                body: JSON.stringify(utmifyData),
              })
              
              if (utmifyResponse.ok) {
                const utmifyResult = await utmifyResponse.json()
                console.log(`✅ [CHECK-STATUS] UTMify notificado com sucesso (PENDING)`)
                
                // Marcar no storage
                if (storedOrder) {
                  orderStorageService.saveOrder({
                    ...storedOrder,
                    utmifySent: true
                  })
                }
              } else {
                const errorText = await utmifyResponse.text()
                console.error(`[CHECK-STATUS] ❌ Erro ao enviar PENDING:`, utmifyResponse.status)
                console.error(`[CHECK-STATUS] 📄 Detalhes do erro:`, errorText)
                console.error(`[CHECK-STATUS] 📦 Payload enviado:`, JSON.stringify(utmifyData, null, 2))
              }
            } catch (error) {
              console.error(`[CHECK-STATUS] Erro ao enviar PENDING:`, error)
            }
          }
        } else {
          const timeSinceLastSent = ((now - lastPendingSent) / 1000 / 60).toFixed(1)
          const timeRemaining = ((DEBOUNCE_TIME_PENDING - (now - lastPendingSent)) / 1000 / 60).toFixed(1)
          console.log(`⏸️ [CHECK-STATUS] PENDING já enviado recentemente`)
          console.log(`   - Enviado há: ${timeSinceLastSent} min`)
          console.log(`   - Próximo envio em: ${timeRemaining} min`)
          console.log(`   - Debounce: ${DEBOUNCE_TIME_PENDING / 1000 / 60} min`)
        }
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

  } catch (error) {
    console.error("[CHECK-STATUS] Erro:", error)
    return NextResponse.json({
      success: false,
      error: "Erro ao verificar status da transação",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

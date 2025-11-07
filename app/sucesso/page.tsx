'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import UserVerificationWithTest from '../../components/UserVerificationWithTest'

export default function SucessoPage() {
  const searchParams = useSearchParams()
  const [conversionFired, setConversionFired] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Verificar cookie de verificação
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const hasVerificationCookie = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('user_verified=')
    )
    
    if (hasVerificationCookie) {
      setIsVerified(true)
    }
  }, [])

  useEffect(() => {
    // Só executar se estiver verificado
    if (!isVerified) return
    
    // Pegar parâmetros da URL
    const transactionId = searchParams.get('transactionId')
    const amount = searchParams.get('amount')
    const currency = searchParams.get('currency') || 'BRL'

    // Verificar se tem os parâmetros obrigatórios
    if (!transactionId || !amount) {
      console.error('❌ [Sucesso] Parâmetros obrigatórios faltando:', { transactionId, amount })
      return
    }

    // Evitar disparo duplicado
    if (conversionFired) {
      console.log('⚠️ [Sucesso] Conversão já disparada, ignorando...')
      return
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ [PÁGINA SUCESSO] Disparando conversão')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💰 Transaction ID:', transactionId)
    console.log('💵 Valor:', amount)
    console.log('💱 Moeda:', currency)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Disparar conversão Google Ads
    if (typeof window !== 'undefined' && window.gtag) {
      const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
      const conversionLabel = process.env.NEXT_PUBLIC_GTAG_CONVERSION_COMPRA

      if (googleAdsId && conversionLabel) {
        window.gtag('event', 'conversion', {
          send_to: `${googleAdsId}/${conversionLabel}`,
          value: parseFloat(amount),
          currency: currency,
          transaction_id: transactionId
        })

        console.log('✅ [Google Ads] Conversão disparada com sucesso!')
        console.log('📊 Dados enviados:', {
          send_to: `${googleAdsId}/${conversionLabel}`,
          value: parseFloat(amount),
          currency: currency,
          transaction_id: transactionId
        })
      } else {
        console.error('❌ [Google Ads] Configuração faltando:', { googleAdsId, conversionLabel })
      }
    }

    setConversionFired(true)
  }, [searchParams, conversionFired, isVerified])

  // Renderizar tela de verificação se não estiver verificado
  if (!isVerified) {
    return (
      <UserVerificationWithTest 
        onVerificationComplete={() => {
          setIsVerified(true)
        }} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Ícone de sucesso */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Confirmado! 🎉
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Sua compra foi processada com sucesso! Os diamantes serão creditados em sua conta em até 5 minutos.
        </p>

        {/* Informações da transação */}
        {searchParams.get('transactionId') && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500 mb-2">ID da Transação:</p>
            <p className="text-sm font-mono text-gray-900 break-all">
              {searchParams.get('transactionId')}
            </p>
            
            {searchParams.get('amount') && (
              <>
                <p className="text-sm text-gray-500 mt-4 mb-2">Valor:</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {parseFloat(searchParams.get('amount') || '0').toFixed(2)}
                </p>
              </>
            )}
          </div>
        )}

        {/* Botão de retorno */}
        <a
          href="/"
          className="inline-block w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Voltar para o Início
        </a>

        {/* Aviso */}
        <p className="text-xs text-gray-400 mt-6">
          Em caso de dúvidas, entre em contato com nosso suporte.
        </p>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efeitos de fundo animados - TEMA VERDE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Card principal */}
        <div 
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-green-500/20"
          style={{
            boxShadow: '0 0 60px rgba(16, 185, 129, 0.5), 0 0 30px rgba(52, 211, 153, 0.35), inset 0 0 40px rgba(34, 197, 94, 0.15)'
          }}
        >
          {/* Ícone de sucesso animado */}
          <div className="mb-8 flex justify-center">
            <div 
              className="relative w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
              style={{
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.3)',
                animation: 'bounce 1s ease-in-out 3'
              }}
            >
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              
              {/* Círculos decorativos */}
              <div className="absolute -inset-4 border-4 border-green-500/30 rounded-full animate-ping"></div>
              <div className="absolute -inset-8 border-2 border-green-500/20 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Título com gradiente VERDE */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400 bg-clip-text text-transparent px-2"
            style={{
              textShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
            }}
          >
            🎉 Pagamento Confirmado!
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl md:text-2xl text-green-300 mb-4 sm:mb-6 font-semibold px-2">
            Sua compra foi aprovada com sucesso!
          </p>

          {/* Box de informação de entrega - DESTAQUE */}
          <div 
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-green-500/40"
            style={{
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1)'
            }}
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 text-left">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-green-300 mb-2">⚡ Entrega Rápida Garantida</h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3">
                  Seus <span className="text-green-400 font-bold">diamantes</span> serão creditados automaticamente na conta vinculada ao <span className="text-green-400 font-bold">ID informado</span>.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-green-200 text-sm sm:text-base font-semibold">
                      Tempo médio: <span className="text-green-400 font-bold">5 a 10 minutos</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      Prazo máximo: <span className="text-emerald-300 font-semibold">até 12 horas</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instruções claras */}
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border border-green-500/20">
            <h3 className="text-green-400 font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              O que fazer agora?
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xs sm:text-sm font-bold">1</span>
                <p className="text-gray-300 text-xs sm:text-sm pt-0.5">
                  <span className="font-semibold text-green-300">Abra seu jogo</span> e aguarde alguns minutos
                </p>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xs sm:text-sm font-bold">2</span>
                <p className="text-gray-300 text-xs sm:text-sm pt-0.5">
                  Os diamantes aparecerão <span className="font-semibold text-green-300">automaticamente</span> na conta do ID informado
                </p>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 text-xs sm:text-sm font-bold">3</span>
                <p className="text-gray-300 text-xs sm:text-sm pt-0.5">
                  Se não receber em até 12h, <span className="font-semibold text-green-300">entre em contato</span> com nosso suporte
                </p>
              </div>
            </div>
          </div>

          {/* Informações da transação */}
          {searchParams.get('transactionId') && (
            <div 
              className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border border-green-500/20"
              style={{
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs sm:text-sm text-green-400 font-semibold uppercase tracking-wider">Detalhes da Compra</p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">ID da Transação</p>
                  <p className="text-xs sm:text-sm font-mono text-gray-200 break-all bg-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-700">
                    {searchParams.get('transactionId')}
                  </p>
                </div>
                
                {searchParams.get('amount') && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Valor Pago</p>
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      R$ {parseFloat(searchParams.get('amount') || '0').toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de retorno */}
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 text-base sm:text-lg"
            style={{
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
            }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Voltar para o Início
          </a>

          {/* Aviso de suporte */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-green-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-300 text-center sm:text-left">
                Precisa de ajuda? <span className="text-green-400 font-semibold">Entre em contato com nosso suporte</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem extra de confirmação */}
        <div className="mt-4 sm:mt-6 text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-green-300 text-xs sm:text-sm font-semibold">
              Pedido processado com segurança
            </p>
          </div>
          <p className="text-gray-400 text-xs">
            Obrigado por confiar em nossos serviços! 💚
          </p>
        </div>
      </div>
    </div>
  )
}

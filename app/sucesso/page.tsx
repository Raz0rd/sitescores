'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import UserVerificationWithTest from '../../components/UserVerificationWithTest'

export default function SucessoPage() {
  const searchParams = useSearchParams()
  const [conversionFired, setConversionFired] = useState(false)
  const [isVerified, setIsVerified] = useState(true) // Sempre verificado para página de sucesso

  // Não precisa verificar cookie na página de sucesso
  // O usuário já passou pela verificação no checkout

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

  // Pegar dados da URL
  const transactionId = searchParams.get('transactionId') || ''
  const amount = searchParams.get('amount') || '0'
  const playerName = searchParams.get('playerName') || ''
  const itemValue = searchParams.get('itemValue') || ''
  const game = searchParams.get('game') || 'freefire'
  
  // Converter amount de centavos para reais
  const amountInReais = (parseFloat(amount) / 100).toFixed(2)

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden" style={{
      background: 'linear-gradient(135deg, rgba(107,70,193,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(236,72,153,0.10) 100%), linear-gradient(180deg, #0f0a1f 0%, #1a0f2e 100%)'
    }}>
      {/* Efeitos de fundo Aurora Boreal Digital */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Ondas de aurora flutuantes */}
        <div className="absolute top-10 left-5 sm:top-20 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div className="absolute bottom-10 right-5 sm:bottom-20 sm:right-20 w-40 h-40 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-20" style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(139,92,246,0.3) 50%, transparent 70%)',
          animation: 'pulse 5s ease-in-out infinite 1s'
        }} />
        
        {/* Cristal aurora canto superior esquerdo */}
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 opacity-30" style={{
          animation: 'float 6s ease-in-out infinite'
        }}>
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(59,130,246,0.6))',
            clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)',
            boxShadow: '0 0 40px rgba(124,58,237,0.8), inset 0 0 20px rgba(59,130,246,0.5)',
            filter: 'brightness(1.4)'
          }} />
        </div>
        
        {/* Diamante aurora canto inferior direito */}
        <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 opacity-30" style={{
          animation: 'rotate 20s linear infinite'
        }}>
          <div className="w-full h-full" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(236,72,153,0.7))',
            clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
            boxShadow: '0 0 40px rgba(124,58,237,0.9), inset 0 0 20px rgba(236,72,153,0.6)'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.2; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.3; 
          }
        }
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(10deg); 
          }
        }
        @keyframes rotate {
          from { 
            transform: rotate(0deg); 
          }
          to { 
            transform: rotate(360deg); 
          }
        }
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <div className="relative flex items-center justify-center min-h-screen py-4 px-3 sm:p-4">
        <div className="w-full max-w-[98%] xs:max-w-[95%] sm:max-w-md md:max-w-lg my-auto">
          <div className="relative overflow-hidden" style={{
            background: 'rgba(15, 10, 31, 0.75)',
            backdropFilter: 'blur(25px)',
            borderRadius: '20px',
            border: '1px solid rgba(124, 58, 237, 0.45)',
            boxShadow: '0 0 60px rgba(124, 58, 237, 0.5), 0 0 30px rgba(236, 72, 153, 0.35), inset 0 0 40px rgba(139, 92, 246, 0.15)'
          }}>
            {/* Header Aurora Boreal */}
            <div className="relative h-16 sm:h-20 md:h-22 flex items-center justify-center overflow-hidden px-3" style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(236,72,153,0.22))',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(124,58,237,0.45)',
              boxShadow: '0 4px 30px rgba(124,58,237,0.4), 0 2px 15px rgba(236,72,153,0.3)'
            }}>
              <h1 className="relative text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white text-center drop-shadow-2xl flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.8))',
                  clipPath: 'polygon(50% 0%, 70% 30%, 100% 50%, 70% 70%, 50% 100%, 30% 70%, 0% 50%, 30% 30%)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.95)',
                  filter: 'brightness(1.5)'
                }} />
                <span className="truncate">Pagamento Confirmado!</span>
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex-shrink-0" style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.95), rgba(139,92,246,0.8), rgba(16,185,129,0.5))',
                  boxShadow: '0 0 20px rgba(236,72,153,0.95)'
                }} />
              </h1>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 md:p-7 lg:p-8 text-center">
              {/* Ícone de Sucesso Animado */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto mb-4 sm:mb-5 md:mb-6">
                {/* Camada externa */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(124,58,237,0.6), rgba(59,130,246,0.4))',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(124,58,237,0.5)',
                  boxShadow: '0 10px 45px 0 rgba(124,58,237,0.6), 0 5px 25px rgba(59,130,246,0.4)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                {/* Camada interna */}
                <div className="absolute inset-2 sm:inset-3 rounded-full" style={{
                  background: 'radial-gradient(circle at 35% 35%, rgba(236,72,153,0.7), rgba(139,92,246,0.5))',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(236,72,153,0.6)'
                }} />
                {/* Checkmark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" viewBox="0 0 52 52" style={{
                    filter: 'drop-shadow(0 0 10px rgba(124,58,237,0.9))'
                  }}>
                    <path
                      fill="none"
                      stroke="rgba(124,58,237,1)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 27l7 7 16-16"
                      style={{
                        strokeDasharray: 100,
                        strokeDashoffset: 0,
                        animation: 'checkmark 0.8s ease-in-out'
                      }}
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-400 to-blue-400 mb-3 sm:mb-4 px-2">
                Compra Realizada com Sucesso!
              </h2>
              
              <p className="text-purple-100/90 mb-4 sm:mb-5 md:mb-6 leading-relaxed text-xs sm:text-sm md:text-base px-2">
                Seu pagamento foi confirmado! Os itens adquiridos serão enviados diretamente para seu ID no jogo em até 12 horas.
              </p>

              {/* Informações da Compra */}
              <div className="relative p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 md:mb-6 overflow-hidden" style={{
                background: 'rgba(124, 58, 237, 0.12)',
                backdropFilter: 'blur(22px)',
                borderRadius: '20px',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                boxShadow: '0 8px 30px 0 rgba(124, 58, 237, 0.4), 0 4px 15px rgba(236, 72, 153, 0.3)'
              }}>
                <p className="text-purple-100 font-bold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center justify-center gap-1.5 sm:gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.98), rgba(236,72,153,0.9))',
                    clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)',
                    boxShadow: '0 0 15px rgba(124,58,237,0.95)',
                    filter: 'brightness(1.5)'
                  }} />
                  <span>Detalhes da Compra</span>
                </p>

                <div className="space-y-2 sm:space-y-3 text-left">
                  {playerName && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-purple-200/80 text-xs sm:text-sm flex-shrink-0">Jogador:</span>
                      <span className="text-purple-100 font-semibold text-xs sm:text-sm truncate">{playerName}</span>
                    </div>
                  )}
                  
                  {game && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-purple-200/80 text-xs sm:text-sm flex-shrink-0">Jogo:</span>
                      <span className="text-purple-100 font-semibold text-xs sm:text-sm capitalize">{game}</span>
                    </div>
                  )}
                  
                  {itemValue && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-purple-200/80 text-xs sm:text-sm flex-shrink-0">Itens:</span>
                      <span className="text-pink-300 font-bold text-sm sm:text-base">{itemValue} 💎</span>
                    </div>
                  )}
                  
                  <div className="h-px bg-purple-500/20 my-2"></div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-purple-200/80 text-xs sm:text-sm flex-shrink-0">Valor Pago:</span>
                    <span className="text-pink-300 font-bold text-base sm:text-lg md:text-xl">R$ {amountInReais}</span>
                  </div>
                  
                  {transactionId && (
                    <>
                      <div className="h-px bg-purple-500/20 my-2"></div>
                      <div>
                        <span className="text-purple-200/80 text-xs block mb-1">ID da Transação:</span>
                        <span className="text-purple-100/70 font-mono text-[10px] sm:text-xs break-all leading-tight">{transactionId}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Aviso Importante */}
              <div className="relative p-3 sm:p-4 mb-4 sm:mb-5 overflow-hidden" style={{
                background: 'rgba(139, 92, 246, 0.12)',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.35)'
              }}>
                <p className="text-purple-100/90 text-[11px] sm:text-xs md:text-sm leading-relaxed">
                  ⏱️ <strong>Importante:</strong> Os itens serão enviados automaticamente para seu ID no jogo em até 12 horas. Caso não receba, entre em contato com nosso suporte.
                </p>
              </div>

              {/* Botão de Retorno */}
              <a
                href="/"
                className="w-full font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 transition-all duration-300 flex items-center justify-center relative overflow-hidden group text-white shadow-2xl hover:scale-[1.03] active:scale-[0.98] inline-block"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.45), rgba(236,72,153,0.4))',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(124,58,237,0.55)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 20px rgba(236,72,153,0.4)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">Voltar para o Início</span>
              </a>

              {/* Suporte */}
              <p className="text-purple-200/60 text-[10px] sm:text-xs md:text-sm mt-4 sm:mt-5 px-2">
                Dúvidas? Entre em contato com nosso suporte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

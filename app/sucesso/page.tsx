'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SucessoPage() {
  const searchParams = useSearchParams()
  const [conversionFired, setConversionFired] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isCheckingVerification, setIsCheckingVerification] = useState(true)
  
  // Verificar se tem os parâmetros necessários
  const transactionId = searchParams.get('transactionId')
  const amount = searchParams.get('amount')
  const hasRequiredParams = transactionId && amount

  // Verificar cookie de verificação
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Verificar múltiplos cookies de verificação
    const hasVerificationCookie = document.cookie.split(';').some(cookie => {
      const trimmed = cookie.trim()
      return trimmed.startsWith('user_verified=') || 
             trimmed.startsWith('quiz_completed=') || 
             trimmed.startsWith('referer_verified=')
    })
    
    if (hasVerificationCookie) {
      setIsVerified(true)
      setIsCheckingVerification(false)
    } else {
      // Aguardar um pouco antes de mostrar verificação (evitar flash)
      setTimeout(() => {
        setIsCheckingVerification(false)
      }, 300)
    }
  }, [])

  useEffect(() => {
    // Pegar parâmetros da URL
    const transactionId = searchParams.get('transactionId')
    const amount = searchParams.get('amount')
    const currency = searchParams.get('currency') || 'BRL'
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const playerName = searchParams.get('playerName')
    const gclid = searchParams.get('gclid')
    const utm_source = searchParams.get('utm_source')

    // Verificar se tem os parâmetros obrigatórios
    if (!transactionId || !amount) {
      return
    }
    
    // Log estruturado para o backend
    console.log('')
    console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
    console.log('┃ 🎉 USUÁRIO ACESSOU /SUCESSO             ┃')
    console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
    console.log(`💳 Transaction ID: ${transactionId}`)
    console.log(`💰 Valor: R$ ${(parseFloat(amount) / 100).toFixed(2)}`)
    console.log(`📧 Email: ${email || 'N/A'}`)
    console.log(`🎯 GCLID: ${gclid || 'N/A'}`)
    console.log(`📊 UTM Source: ${utm_source || 'N/A'}`)
    console.log('')

    // PROTEÇÃO ANTI-DUPLICAÇÃO TRIPLA:
    // 1. Verificar state do React
    if (conversionFired) {
      console.log('⚠️ [Google Ads] Conversão já disparada (state) - IGNORANDO')
      return
    }
    
    // 2. Verificar localStorage
    const storageKey = `gads_conversion_${transactionId}`
    const alreadySent = localStorage.getItem(storageKey)
    
    if (alreadySent) {
      console.log('⚠️ [Google Ads] Conversão já disparada (localStorage) - IGNORANDO')
      console.log(`   - Enviado em: ${alreadySent}`)
      setConversionFired(true) // Atualizar state para evitar loops
      return
    }
    
    // 3. Marcar IMEDIATAMENTE antes de enviar (previne race condition)
    const timestamp = new Date().toISOString()
    localStorage.setItem(storageKey, timestamp)
    setConversionFired(true)

    // Função para hashear dados em SHA256
    const hashData = async (data: string): Promise<string> => {
      const normalized = data.toLowerCase().trim()
      const encoder = new TextEncoder()
      const encodedData = encoder.encode(normalized)
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex
    }
    
    // Função para normalizar telefone no formato E.164 (+5511999999999)
    const normalizePhone = (phone: string): string => {
      // Remover tudo exceto números
      let cleaned = phone.replace(/\D/g, '')
      
      // Adicionar código do país se não tiver (Brasil = 55)
      if (!cleaned.startsWith('55')) {
        // Se tem 11 dígitos (DDD + número), adicionar 55
        if (cleaned.length === 11) {
          cleaned = '55' + cleaned
        }
        // Se tem 10 dígitos (DDD + número sem 9), adicionar 55
        else if (cleaned.length === 10) {
          cleaned = '55' + cleaned
        }
      }
      
      // Retornar no formato E.164 com +
      return '+' + cleaned
    }

    // Disparar conversão Google Ads
    const sendConversion = async () => {
      if (typeof window !== 'undefined' && window.gtag) {
        const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
        const conversionLabel = process.env.NEXT_PUBLIC_GTAG_CONVERSION_COMPRA

        if (googleAdsId && conversionLabel) {
          // Preparar dados da conversão
          // amount vem em CENTAVOS da URL (ex: 2298 = R$ 22,98)
          const valueInReais = parseFloat(amount) / 100
          
          const conversionData: any = {
            send_to: `${googleAdsId}/${conversionLabel}`,
            value: valueInReais,
            currency: currency,
            transaction_id: transactionId
          }

          // ✅ ENHANCED CONVERSIONS - Apenas email e telefone hasheados (SHA-256)
          const userData: any = {}
          
          try {
            // Email hasheado (SHA-256)
            if (email) {
              userData.email = await hashData(email)
              console.log('✅ Email hasheado (SHA-256)')
            }
            
            // Telefone hasheado (SHA-256) no formato E.164
            if (phone) {
              const normalizedPhone = normalizePhone(phone) // Formato: +5511999999999
              userData.phone_number = await hashData(normalizedPhone)
              console.log('✅ Telefone hasheado (SHA-256):', normalizedPhone)
            }
            
            // Adicionar user_data se tiver algum dado
            if (Object.keys(userData).length > 0) {
              conversionData.user_data = userData
              console.log('✅ Enhanced Conversions ativado:', Object.keys(userData).join(', '))
            }
          } catch (error) {
            console.error('❌ Erro ao hashear dados do usuário:', error)
            // Continuar mesmo com erro - não bloquear conversão
          }

          // Disparar conversão
          window.gtag('event', 'conversion', conversionData)
          
          // localStorage já foi salvo ANTES de enviar (linha 86)
          console.log('')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('✅ [Google Ads] CONVERSÃO DISPARADA')
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log(`💳 Transaction ID: ${transactionId}`)
          console.log(`💰 Valor: R$ ${valueInReais.toFixed(2)}`)
          console.log(`📧 Email: ${email ? '✅ Hasheado' : '❌ Não enviado'}`)
          console.log(`📱 Telefone: ${phone ? '✅ Hasheado' : '❌ Não enviado'}`)
          console.log(`🎯 Enhanced Conversions: ${Object.keys(userData).length > 0 ? '✅ ATIVO' : '❌ Inativo'}`)
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
          console.log('')
        }
      }

      setConversionFired(true)
    }

    sendConversion()
  }, [searchParams]) // ✅ Remove r conversionFired para evitar loop

  // Mostrar loading enquanto verifica
  if (isCheckingVerification) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    )
  }

  // ❌ VERIFICAÇÃO REMOVIDA - Usuário acessa direto
  // if (!isVerified) {
  //   return (
  //     <UserVerificationWithTest 
  //       onVerificationComplete={() => {
  //         setIsVerified(true)
  //         setIsCheckingVerification(false)
  //       }} 
  //     />
  //   )
  // }

  // Se não tiver parâmetros obrigatórios, mostrar mensagem
  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
        background: '#ffffff'
      }}>
        {/* Efeitos de fundo Free Fire */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 opacity-5" style={{
            background: 'linear-gradient(135deg, #ff4444, #ff6b00)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }} />
          <div className="absolute bottom-10 left-10 w-40 h-40 opacity-5" style={{
            background: 'linear-gradient(135deg, #ff6b00, #ff4444)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }} />
        </div>
        <div className="max-w-2xl w-full bg-white rounded-xl p-8 border-2 border-gray-200 shadow-2xl relative z-10">
          <div className="text-center">
            {/* Ícone de aviso */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-6" style={{
              background: 'linear-gradient(135deg, #ff4444, #ff6b00)'
            }}>
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Título */}
            <h1 className="text-3xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #ff4444, #ff6b00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Você ainda não fez seu pedido</h1>
            
            {/* Mensagem */}
            <p className="text-gray-700 mb-8 text-lg">
              Esta página é acessível apenas após a confirmação de uma compra.
            </p>
            
            {/* Botão para voltar */}
            <a
              href="/"
              className="inline-block w-full md:w-auto md:min-w-[300px] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 text-lg hover:shadow-xl transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ff4444, #ff6b00)'
              }}
            >
              Ir para a Página Inicial
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      background: '#ffffff'
    }}>
      {/* Efeitos de fundo Free Fire */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Formas decorativas sutis */}
        <div className="absolute top-10 right-10 w-32 h-32 opacity-5" style={{
          background: 'linear-gradient(135deg, #ff4444, #ff6b00)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        }} />
        <div className="absolute bottom-10 left-10 w-40 h-40 opacity-5" style={{
          background: 'linear-gradient(135deg, #ff6b00, #ff4444)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        }} />
      </div>

      <div className="max-w-3xl w-full relative z-10">
        {/* Card principal */}
        <div 
          className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 text-center border-2 border-gray-200"
        >
          {/* Ícone de sucesso */}
          <div className="mb-6 flex justify-center">
            <div 
              className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 px-2"
            style={{
              background: 'linear-gradient(135deg, #ff4444, #ff6b00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Pagamento Confirmado!
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-4 sm:mb-6 font-semibold px-2">
            Sua compra foi aprovada com sucesso!
          </p>

          {/* Box de informação de entrega - DESTAQUE */}
          <div 
            className="bg-red-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-red-200"
          >
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 text-left">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #ff4444, #ff6b00)'
                }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-red-700 mb-2">Entrega Rápida Garantida</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3">
                  Seu <span className="text-red-600 font-bold">Código de Resgate (Itens FF)</span> será enviado automaticamente para a conta vinculada ao <span className="text-red-600 font-bold">ID informado</span>.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <p className="text-red-700 text-sm sm:text-base font-semibold">
                      Tempo médio: <span className="text-red-600 font-bold">5 a 10 minutos</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Prazo máximo: <span className="text-orange-600 font-semibold">até 12 horas</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instruções claras */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border-2 border-gray-200">
            <h3 className="text-gray-800 font-bold text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              O que fazer agora?
            </h3>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs sm:text-sm font-bold">1</span>
                <p className="text-gray-700 text-xs sm:text-sm pt-0.5">
                  <span className="font-semibold text-red-600">Abra seu jogo</span> e aguarde alguns minutos
                </p>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs sm:text-sm font-bold">2</span>
                <p className="text-gray-700 text-xs sm:text-sm pt-0.5">
                  O código de resgate aparecerá <span className="font-semibold text-red-600">automaticamente</span> na conta do ID informado
                </p>
              </div>
              <div className="flex items-start gap-2.5 sm:gap-3">
                <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs sm:text-sm font-bold">3</span>
                <p className="text-gray-700 text-xs sm:text-sm pt-0.5">
                  Se não receber em até 12h, <span className="font-semibold text-red-600">entre em contato</span> com nosso suporte
                </p>
              </div>
            </div>
          </div>

          {/* Informações da transação */}
          {searchParams.get('transactionId') && (
            <div 
              className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left border-2 border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs sm:text-sm text-red-600 font-semibold uppercase tracking-wider">Detalhes da Compra</p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">ID da Transação</p>
                  <p className="text-xs sm:text-sm font-mono text-gray-800 break-all bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300">
                    {searchParams.get('transactionId')}
                  </p>
                </div>
                
                {searchParams.get('amount') && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Valor Pago</p>
                    <p className="text-2xl sm:text-3xl font-black" style={{
                      background: 'linear-gradient(135deg, #ff4444, #ff6b00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
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
            className="inline-flex items-center justify-center gap-2 sm:gap-3 w-full text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 text-base sm:text-lg"
            style={{
              background: 'linear-gradient(135deg, #ff4444, #ff6b00)'
            }}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Voltar para o Início
          </a>

          {/* Aviso de suporte */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600 text-center sm:text-left">
                Precisa de ajuda? <span className="text-red-600 font-semibold">Entre em contato com nosso suporte</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem extra de confirmação */}
        <div className="mt-4 sm:mt-6 text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <p className="text-gray-700 text-xs sm:text-sm font-semibold">
              Pedido processado com segurança
            </p>
          </div>
          <p className="text-gray-500 text-xs">
            Obrigado por confiar em nossos serviços! 🔥
          </p>
        </div>
      </div>
    </div>
  )
}

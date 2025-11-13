'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import Script from 'next/script'

interface WhitePageProps {
  onActivate: () => void
  isBot?: boolean
}

export default function WhitePage({ onActivate, isBot = false }: WhitePageProps) {
  const [isActivating, setIsActivating] = useState(false)
  const [showTestButton, setShowTestButton] = useState(false)
  
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''
  const googleAdsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true'

  // Verificar parâmetro secreto na URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('test_conversion') === 'secret123') {
        setShowTestButton(true)
      }
    }
  }, [])

  // Função para disparar conversão de teste
  const handleTestConversion = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const conversionLabel = process.env.NEXT_PUBLIC_GTAG_CONVERSION_COMPRA || ''
      console.log('🧪 [TEST] Disparando conversão de teste...')
      console.log('🧪 [TEST] Google Ads ID:', googleAdsId)
      console.log('🧪 [TEST] Conversion Label:', conversionLabel)
      
      ;(window as any).gtag('event', 'conversion', {
        send_to: `${googleAdsId}/${conversionLabel}`,
        value: 100.00,
        currency: 'BRL',
        transaction_id: 'TEST_' + Date.now()
      })
      
      alert('✅ Conversão de teste disparada! Verifique o Google Ads Tag Assistant.')
    } else {
      alert('❌ Google Tag não carregado ainda. Aguarde alguns segundos e tente novamente.')
    }
  }

  const handleActivate = () => {
    if (isBot) {
      // Bot: mostrar loading infinito (não chamar onActivate)
      setIsActivating(true)
      return
    }
    
    // Usuário real: ativar normalmente
    setIsActivating(true)
    setTimeout(() => {
      onActivate()
    }, 300)
  }

  return (
    <>
      {/* Google Tag Manager */}
      {googleAdsEnabled && googleAdsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsId}');
            `}
          </Script>
        </>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card Central Simples */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-14 text-center">
          {/* Ícone */}
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>
          
          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Créditos Digitais
          </h1>
          
          {/* Descrição */}
          <p className="text-lg text-gray-600 mb-8">
            Aproveite descontos especiais em créditos para jogos
          </p>

          {/* Botão Grande e Centralizado */}
          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-5 rounded-2xl font-bold text-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-3"
          >
            {isActivating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                <span>Carregando...</span>
              </>
            ) : (
              <>
                <span>Acessar Loja</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
          
          {/* Info */}
          <p className="text-gray-500 text-sm mt-6">
            ⚡ Descontos exclusivos disponíveis
          </p>

          {/* Botão secreto de teste de conversão */}
          {showTestButton && (
            <button
              onClick={handleTestConversion}
              className="mt-6 w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-all shadow-lg"
            >
              🧪 Disparar Conversão de Teste (Google Ads)
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs">
            Plataforma independente de eventos e promoções digitais
          </p>
        </div>
      </div>
    </div>
    </>
  )
}

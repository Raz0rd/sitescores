'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GoogleConversionTest() {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    // Verificar se o parâmetro está presente
    const activateParam = searchParams.get('conversaogoogleactivate')
    if (activateParam === 'teste') {
      setIsVisible(true)
    }
  }, [searchParams])

  const sendTestConversion = () => {
    setIsSending(true)
    setResult('')

    try {
      // Gerar transaction_id aleatório
      const transactionId = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`
      
      // Pegar variáveis do ambiente
      const awId = process.env.NEXT_PUBLIC_GOOGLE_AW_ID || 'AW-17710336360'
      const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL || 'ABlgCM6vs7sbEOiS-fxB'
      const sendTo = `${awId}/${conversionLabel}`

      console.log('🧪 [TESTE CONVERSÃO GOOGLE]')
      console.log('   - Send To:', sendTo)
      console.log('   - Transaction ID:', transactionId)

      // Verificar se gtag está disponível
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'send_to': sendTo,
          'value': 1.0,
          'currency': 'BRL',
          'transaction_id': transactionId
        })

        setResult(`✅ Conversão enviada!\n\nSend To: ${sendTo}\nTransaction ID: ${transactionId}`)
        console.log('✅ Conversão de teste enviada com sucesso!')
      } else {
        setResult('❌ Erro: gtag não está carregado na página')
        console.error('❌ gtag não encontrado')
      }
    } catch (error) {
      setResult(`❌ Erro ao enviar: ${error}`)
      console.error('❌ Erro ao enviar conversão:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-2xl shadow-2xl border-2 border-white/20 max-w-md">
      <div className="text-white">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          🧪 Teste de Conversão Google Ads
        </h3>
        <p className="text-sm text-white/80 mb-4">
          Enviar conversão de teste para o Google Ads
        </p>
        
        <button
          onClick={sendTestConversion}
          disabled={isSending}
          className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all ${
            isSending
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 hover:scale-105 shadow-lg'
          }`}
        >
          {isSending ? '⏳ Enviando...' : '🚀 Enviar Conversão de Teste'}
        </button>

        {result && (
          <div className={`mt-4 p-3 rounded-lg text-sm whitespace-pre-line ${
            result.startsWith('✅') 
              ? 'bg-green-500/20 border border-green-400/50' 
              : 'bg-red-500/20 border border-red-400/50'
          }`}>
            {result}
          </div>
        )}

        <div className="mt-4 text-xs text-white/60">
          <p>💡 Variáveis de ambiente:</p>
          <p className="font-mono">NEXT_PUBLIC_GOOGLE_AW_ID</p>
          <p className="font-mono">NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL</p>
        </div>
      </div>
    </div>
  )
}

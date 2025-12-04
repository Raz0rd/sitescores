"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { trackPurchase } from "@/lib/google-ads"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(12 * 60 * 60) // 12 horas em segundos
  const [isLoaded, setIsLoaded] = useState(false)
  
  const transactionId = searchParams.get('transactionId')
  const amount = searchParams.get('amount')
  const playerName = searchParams.get('playerName') || "jogador"
  const itemType = searchParams.get('itemType') || "recharge"
  const game = searchParams.get('game') || "freefire"
  const itemValue = searchParams.get('itemValue') || ""
  
  // Formatar tempo restante
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  
  // Carregar timer do localStorage na montagem
  useEffect(() => {
    if (!transactionId) return
    
    const storageKey = `timer_${transactionId}`
    const stored = localStorage.getItem(storageKey)
    
    if (stored) {
      const { startTime, duration } = JSON.parse(stored)
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, duration - elapsed)
      
      console.log('[Success] ⏱️ Timer recuperado do localStorage:', {
        elapsed: `${Math.floor(elapsed / 3600)}h ${Math.floor((elapsed % 3600) / 60)}m`,
        remaining: `${Math.floor(remaining / 3600)}h ${Math.floor((remaining % 3600) / 60)}m`
      })
      
      setTimeLeft(remaining)
    } else {
      // Primeira vez - salvar no localStorage
      const startTime = Date.now()
      const duration = 12 * 60 * 60 // 12 horas
      
      localStorage.setItem(storageKey, JSON.stringify({ startTime, duration }))
      console.log('[Success] 🆕 Timer iniciado e salvo no localStorage')
      
      setTimeLeft(duration)
    }
    
    setIsLoaded(true)
  }, [transactionId])
  
  // Timer de 12 horas (atualiza a cada segundo)
  useEffect(() => {
    if (!isLoaded) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isLoaded])
  
  useEffect(() => {
    // Enviar conversão para Google Ads APENAS 1 VEZ
    if (transactionId && amount) {
      const conversionKey = `conversion_sent_${transactionId}`
      const alreadySent = localStorage.getItem(conversionKey)
      
      if (!alreadySent) {
        try {
          const amountValue = parseFloat(amount)
          if (amountValue > 0) {
            trackPurchase(transactionId, amountValue / 100) // Converter de centavos para reais
            localStorage.setItem(conversionKey, 'true')
            console.log('[Success] ✅ Conversão Google Ads enviada (primeira vez):', { transactionId, amount: amountValue / 100 })
          }
        } catch (error) {
          console.error('[Success] ❌ Erro ao enviar conversão:', error)
        }
      } else {
        console.log('[Success] ℹ️ Conversão já foi enviada anteriormente (não reenviando)')
      }
    }
    
    // PROTEÇÃO: Se não tem transactionId/amount, redireciona para white page
    // Mas só depois de tentar enviar conversão (para Google Bot)
    if (!transactionId || !amount) {
      console.log('[Success] ⚠️ Acesso sem parâmetros - redirecionando para white page')
      // Aguardar 100ms para dar tempo do gtag enviar (se for bot)
      setTimeout(() => {
        router.push('/')
      }, 100)
      return
    }
  }, [transactionId, amount, router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center">
          {/* Ícone de sucesso */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
            <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Título principal */}
          <h1 className="text-3xl font-bold mb-2">Compra Confirmada com Sucesso!</h1>
          
          {/* Subtítulo */}
          <p className="text-gray-300 mb-8 text-lg">
            Parabéns {playerName}! Seu pagamento foi processado e está sendo validado.
          </p>
          
          {/* Detalhes da transação */}
          <div className="bg-gray-900/50 rounded-lg p-6 mb-8 text-left border border-gray-700">
            <h2 className="font-semibold text-xl mb-4 text-center text-white">Detalhes da Compra</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400 font-medium">ID da Transação:</span>
                <span className="font-mono text-gray-300">{transactionId}</span>
              </div>
              
              {amount && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400 font-medium">Valor Pago:</span>
                  <span className="text-green-400 font-semibold text-lg">
                    R$ {(parseFloat(amount) / 100).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400 font-medium">Produto:</span>
                <span className="text-blue-400 font-medium">
                  {itemValue ? `${itemValue} ${game === 'freefire' ? 'Diamantes' : game === 'deltaforce' ? 'Coins' : 'Itens'}` : 'Recarga de Jogo'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400 font-medium">Jogo:</span>
                <span className="text-purple-400 font-medium">
                  {game === 'freefire' ? 'Free Fire' : game === 'deltaforce' ? 'Delta Force' : game === 'haikyu' ? 'Haikyu' : game.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Timer de processamento */}
          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-6 mb-8">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-blue-300">Processamento da Compra</h3>
              <p className="text-blue-200 mb-4 text-center">
                Seus créditos serão creditados em até 12 horas após a confirmação do pagamento.
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-2xl font-bold text-white bg-blue-800 px-4 py-2 rounded-lg">
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              <p className="text-blue-300 text-sm text-center">
                Tempo restante para processamento automático
              </p>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-xl font-bold mb-4 text-center text-white">Perguntas Frequentes</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-200 mb-2">Recebo somente após 12 horas?</h4>
                <p className="text-gray-400 text-sm">
                  Não. O prazo máximo para processamento é de 12 horas, mas na maioria dos casos os créditos 
                  são creditados em até 30 minutos após a confirmação do pagamento. Este prazo é apenas 
                  uma referência de tempo máximo para garantir que todas as transações sejam processadas 
                  corretamente, mesmo em casos de alta demanda.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-200 mb-2">Como saberei quando os créditos forem creditados?</h4>
                <p className="text-gray-400 text-sm">
                  Você receberá uma notificação por e-mail e dentro do jogo quando os créditos forem 
                  creditados na sua conta. Além disso, pode verificar o status da sua conta a qualquer momento.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-200 mb-2">O que acontece se não receber após 12 horas?</h4>
                <p className="text-gray-400 text-sm">
                  Caso seus créditos não sejam creditados após o prazo máximo, nossa equipe de suporte 
                  será automaticamente notificada e entrará em contato com você para resolver a situação 
                  o mais rapidamente possível.
                </p>
              </div>
            </div>
          </div>
          
          {/* Mensagem final */}
          <div className="mb-8 p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <p className="text-green-300 text-center">
              Obrigado por sua compra! Aproveite seus créditos e continue desfrutando de nossos serviços.
            </p>
          </div>
          
          {/* Botão para voltar */}
          <button
            onClick={() => router.push('/')}
            className="w-full md:w-auto md:min-w-[300px] bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    </div>
  )
}

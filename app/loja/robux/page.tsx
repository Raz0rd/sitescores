"use client"

import { useState, useEffect } from "react"
import LojaLayout from '@/components/loja/LojaLayout'
import RobuxBanner from '@/components/loja/RobuxBanner'
import CompactSocialProof from '@/components/loja/CompactSocialProof'
import CompactHowItWorks from '@/components/loja/CompactHowItWorks'
import { useCart } from '@/contexts/CartContext'

export default function RobuxPage() {
  const cart = useCart()
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [buyersToday, setBuyersToday] = useState(48)

  useEffect(() => {
    document.title = 'Robux - Roblox Recarga Rápida'
  }, [])
  
  // Gerar número aleatório apenas uma vez no cliente
  useEffect(() => {
    setMounted(true)
    setBuyersToday(Math.floor(35 + Math.random() * 40))
  }, [])

  const config = {
    name: 'Robux',
    coinIcon: '/images/iconeRobux.svg',
    rechargeValues: ["2000", "5250", "11000", "24000"]
  }

  const calculatePrice = (value: string) => {
    const prices: { [key: string]: number } = {
      "2000": 18.83,
      "5250": 36.60,
      "11000": 63.99,
      "24000": 110.34
    }
    
    const originalPrices: { [key: string]: number } = {
      "2000": 117.90,
      "5250": 294.90,
      "11000": 589.90,
      "24000": 1179.90
    }
    
    const realPrice = prices[value] || 0
    
    return { 
      originalPrice: originalPrices[value] || 0,
      realPrice: realPrice,
      discount: originalPrices[value] ? Math.round((1 - realPrice / originalPrices[value]) * 100) : 0
    }
  }

  return (
    <LojaLayout customBanner={<RobuxBanner />}>
      {/* 1️⃣ Prova Social - Logo após o banner */}
      <CompactSocialProof />
      
      {/* 2️⃣ Como Funciona - Compacto */}
      <CompactHowItWorks />
      
      <div className="max-w-5xl mx-auto p-4 py-8">
        {/* 3️⃣ Chamada de Impacto */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            💰 Aproveite até 70% a mais de Robux
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Receba Robux automaticamente após o pagamento via Pix.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Válido para PC, Web e Cartões-Presente.
          </p>
        </div>

        {/* 4️⃣ Lista de Pacotes - Otimizada */}
        <div className="space-y-3 max-w-md mx-auto mb-8">
          {config.rechargeValues.map((value: string, index: number) => {
            const isSelected = selectedRechargeValue === value
            const priceInfo = calculatePrice(value)
            
            // Gatilhos de urgência/social proof
            const urgencyMessages = [
              `🔥 ${buyersToday} pessoas compraram hoje`,
              '📦 Estoque atualizado agora',
              '⚡ Entrega em segundos',
              `🔥 ${buyersToday} pessoas compraram hoje`,
              '⚡ Entrega em segundos'
            ]
            const urgencyMessage = urgencyMessages[index]
            
            return (
              <div
                key={value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => {
                  console.log('🖱️ [Robux] Item clicado:', value)
                  cart.addItem({
                    id: `robux-${value}`,
                    name: `${value} Robux`,
                    image: config.coinIcon,
                    price: priceInfo.realPrice,
                    originalPrice: priceInfo.originalPrice,
                    category: 'robux',
                    details: {
                      'Quantidade': value,
                      'Desconto': `${priceInfo.discount}%`,
                      'Preço por unidade': 'R$ 0,02'
                    }
                  })
                  setSelectedRechargeValue(value)
                }}
              >
                {/* Badge de Desconto - Pequeno e discreto */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  -{priceInfo.discount}%
                </div>

                {/* Preços em Reais */}
                <div className="flex flex-col">
                  <div className="text-sm text-gray-400 line-through">
                    a partir de R$ {priceInfo.originalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    R$ {priceInfo.realPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-[10px] text-green-600 font-semibold mt-0.5">
                    ✔ Entrega automática
                  </div>
                  {/* Selo de escassez */}
                  <div className="text-[10px] text-orange-600 font-semibold mt-1">
                    {urgencyMessage}
                  </div>
                </div>

                {/* Quantidade de Robux */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  <img
                    alt="Robux"
                    loading="lazy"
                    width="24"
                    height="24"
                    decoding="async"
                    className="w-6 h-6 object-contain"
                    src="/images/robux-coin-gold.svg"
                  />
                  <span className="text-lg font-bold text-gray-900">
                    {value.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 5️⃣ CTA Intermediário */}
        <div className="text-center mb-8">
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105">
            🛒 Escolher minha recarga →
          </button>
        </div>

        {/* 6️⃣ Roblox Premium - Otimizado */}
        <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="9" y="9" width="6" height="6" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">🎁 Roblox Premium</h3>
              <p className="text-xs text-orange-600 font-semibold mb-2">(melhor custo-benefício)</p>
              <p className="text-sm text-gray-600">
                Ganhe até <strong>35% a mais</strong> em Robux e receba recompensas mensais.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ideal para quem compra com frequência.
              </p>
            </div>
          </div>

          <div className="mb-4 space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✔</span>
              <span>1000 Robux por mês</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✔</span>
              <span>35% bônus em compras</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✔</span>
              <span>Publique e revenda itens de avatar</span>
            </div>
          </div>

          <button 
            onClick={() => {
              console.log('🖱️ [Robux] Roblox Premium clicado')
              cart.addItem({
                id: 'robux-premium',
                name: 'Roblox Premium',
                image: config.coinIcon,
                price: 29.90,
                category: 'robux',
                details: {
                  tipo: 'Assinatura Mensal',
                  beneficios: '1000 Robux/mês + 35% bônus em compras'
                }
              })
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-all shadow-md"
          >
            Assinar Agora →
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-3">
            R$ 29,90 / mês
          </p>
        </div>
      </div>
    </LojaLayout>
  )
}

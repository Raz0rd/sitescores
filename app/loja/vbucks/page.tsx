"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import LojaLayout from '@/components/loja/LojaLayout'
import VBucksBanner from '@/components/loja/VBucksBanner'
import CompactSocialProof from '@/components/loja/CompactSocialProof'
import FAQ from '@/components/loja/FAQ'
import { useCart } from '@/contexts/CartContext'

export default function VBucksPage() {
  const router = useRouter()
  const cart = useCart()
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Comprar V-Bucks com Desconto Oficial | Epic Games Store | Shipbux'
  }, [])

  // Preços calculados: 0,015 por V-Buck + centavos aleatórios
  const vbucksPackages = [
    { value: 2800, price: 42.81, originalPrice: 84.00, image: "/images/2800Vbucks.avif", title: "Fortnite Account 2800 V-Bucks" },
    { value: 3000, price: 45.47, originalPrice: 90.00, image: "/images/3000Vbucks.jpeg", title: "Fortnite Account 3000 V-Bucks" },
    { value: 5000, price: 75.23, originalPrice: 150.00, image: "/images/5000Vbucks.jpeg", title: "Fortnite Account 5000 V-Bucks" },
    { value: 10000, price: 150.89, originalPrice: 300.00, image: "/images/10000Vbucks.jpeg", title: "Fortnite Account 10000 V-Bucks" },
    { value: 13500, price: 202.65, originalPrice: 405.00, image: "/images/13500Vbucks.jpeg", title: "Fortnite Account 13500 V-Bucks" },
    { value: 27000, price: 405.37, originalPrice: 810.00, image: "/images/27000.jpeg", title: "Fortnite Account 27000 V-Bucks" },
    { value: 54000, price: 810.92, originalPrice: 1620.00, image: "/images/54000Vbucks.jpeg", title: "Fortnite Account 54000 V-Bucks" }
  ]

  const handleAddToCart = (pkg: typeof vbucksPackages[0]) => {
    cart.addItem({
      id: `vbucks-${pkg.value}`,
      name: `${pkg.value.toLocaleString()} V-Bucks`,
      image: pkg.image,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      category: 'vbucks',
      details: {
        'Quantidade': `${pkg.value.toLocaleString()} V-Bucks`,
        'Plataforma': 'Epic Games',
        'Região': 'Global',
        'Entrega': 'Instantânea'
      }
    })
    router.push('/loja/checkout?category=vbucks')
  }

  return (
    <LojaLayout customBanner={<VBucksBanner />}>
      {/* 1️⃣ Faixa Promocional */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-2">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-white text-xs sm:text-sm font-bold">
            🔥 Até 50% OFF em pacotes selecionados • Pagamento em reais via Pix
          </p>
        </div>
      </div>
      
      {/* 2️⃣ Bloco de Confiança */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Entrega Automática</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">4.9 • +8.200 avaliações</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-6">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* 3️⃣ Hero Otimizado */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">
            COMPRAR V-BUCKS MAIS BARATO E SEGURO
          </h1>
          <p className="text-sm text-gray-600 mb-3">
            Receba V-Bucks na sua conta Fortnite com entrega rápida e pagamento em reais.
          </p>
          
          {/* Badge de Confiança */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 mb-4">
            <span>⭐ 4,9 / 5 • +8.200 entregas confirmadas</span>
            <span>🔒 Pagamento seguro</span>
            <span>⚡ Entrega automática</span>
          </div>
          
          {/* Card Roxo - Oferta */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-5 max-w-2xl mx-auto">
            <p className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
              💎 ATÉ 50% DE DESCONTO EM PACKS SELECIONADOS
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Pague em reais via Pix e receba os dados em poucos minutos.
            </p>
            <button 
              onClick={() => document.getElementById('pacotes-vbucks')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2.5 px-6 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              Ver pacotes de V-Bucks ↓
            </button>
          </div>
        </div>
        
        {/* 4️⃣ Prova Social Compacta */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
            </div>
            <p className="text-sm text-gray-700 italic mb-1">
              "Entrega rápida e confiável. Voltarei sempre!"
            </p>
            <p className="text-xs text-gray-500">— Daniel R.</p>
            <a href="#depoimentos" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
              Ver mais depoimentos →
            </a>
          </div>
        </div>
        
        {/* 5️⃣ Como Funciona */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-5">Como Funciona</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">1️⃣</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Escolha seu pacote</p>
              <p className="text-xs text-gray-600">Selecione a quantidade de V-Bucks que deseja</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">2️⃣</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Informe os dados</p>
              <p className="text-xs text-gray-600">Preencha as informações para entrega</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">3️⃣</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Receba com segurança</p>
              <p className="text-xs text-gray-600">Acompanhe o status e receba em minutos</p>
            </div>
          </div>
        </div>

        {/* 6️⃣ Grid de Pacotes Otimizado */}
        <div id="pacotes-vbucks" className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Pacotes de V-Bucks</h2>
          <p className="text-sm text-gray-600 text-center mb-5">Ofertas promocionais com entrega rápida e suporte especializado</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
          {vbucksPackages.map((pkg) => {
            const isSelected = selectedRechargeValue === pkg.value
            
            return (
              <div
                key={pkg.value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`group relative overflow-hidden rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-yellow-400 shadow-xl scale-105"
                    : "hover:scale-102 hover:shadow-lg"
                }`}
                onClick={() => setSelectedRechargeValue(pkg.value)}
              >
                {/* Card Compacto */}
                <div className="bg-white">
                  {/* Imagem Real */}
                  <div className="relative aspect-[3/4] w-full">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badge de desconto */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                      -50%
                    </div>
                    
                    {/* Badge Global */}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      🌍 GLOBAL
                    </div>
                  </div>

                  {/* Info do Pacote */}
                  <div className="p-2 bg-white border-t border-gray-200">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {pkg.value.toLocaleString()} V-Bucks
                    </p>
                    <div className="mb-2">
                      <div className="text-[9px] text-gray-500 mb-0.5">a partir de</div>
                      <div className="text-[10px] text-gray-400 line-through">
                        R$ {pkg.originalPrice.toFixed(2)}
                      </div>
                      <div className="text-base font-bold text-green-600">
                        R$ {pkg.price.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Mini-badges */}
                    <div className="space-y-0.5 mb-2">
                      <div className="text-[9px] text-gray-600 flex items-center gap-1">
                        <span className="text-green-600">✔</span> Entrega automática
                      </div>
                      <div className="text-[9px] text-gray-600 flex items-center gap-1">
                        <span className="text-green-600">✔</span> Suporte em português
                      </div>
                    </div>
                    
                    {/* Botão Comprar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(pkg)
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-bold py-1.5 rounded transition-all"
                    >
                      Comprar agora
                    </button>
                  </div>
                </div>

                {/* Indicador de seleção */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10">
                    <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 7️⃣ Bloco de Garantia */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔵 Entrega 100% Segura</h3>
              <p className="text-sm text-gray-700 mb-2">
                Todos os pedidos são processados pelo nosso sistema com histórico de mais de 8.200 entregas concluídas.
              </p>
              <p className="text-sm text-gray-700">
                Acompanhe o status do seu pedido em tempo real pelo painel.
              </p>
            </div>
          </div>
        </div>
        
        {/* 8️⃣ FAQ */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-5">❓ Perguntas Frequentes</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200 max-w-3xl mx-auto">
            <details className="p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                É seguro comprar V-Bucks aqui?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                Sim. Processamos mais de 8.200 pedidos com segurança e entrega garantida. Você pode acompanhar seu pedido em tempo real.
              </p>
            </details>
            <details className="p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                Como funciona a entrega?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                Após a confirmação do pagamento, você recebe os dados de acesso por e-mail/WhatsApp em poucos minutos. Basta fazer login e aproveitar.
              </p>
            </details>
            <details className="p-4 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                Posso alterar a senha da conta?
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-sm text-gray-600 mt-3">
                Sim! Recomendamos que você altere a senha no primeiro acesso para sua segurança total.
              </p>
            </details>
          </div>
        </div>
        </div>
      </div>
    </LojaLayout>
  )
}

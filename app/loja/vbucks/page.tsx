"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import LojaLayout from '@/components/loja/LojaLayout'
import VBucksBanner from '@/components/loja/VBucksBanner'
import { useCart } from '@/contexts/CartContext'

export default function VBucksPage() {
  const router = useRouter()
  const cart = useCart()
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'V-Bucks - Fortnite Recarga Rápida'
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
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 italic tracking-tight">
            COMPRAR V-BUCKS
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Desenvolvido por Epic Games Store
          </p>
          
          {/* Banner de Promoção */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-gray-900 text-sm sm:text-base">
              <span className="font-bold">GANHE <span className="text-green-600">20% DE VOLTA</span> EM RECOMPENSAS EPIC</span> AO COMPRAR PACOTES DE V-BUCKS.
            </p>
          </div>

          {/* Texto Informativo */}
          <div className="text-gray-700 text-sm space-y-2">
            <p>
              Escolha quantos V-Bucks deseja adicionar à sua conta. Para adicionar V-Bucks, seu acesso 
              será redirecionado para a Epic Games Store.
            </p>
            <p>
              Para saber todos os detalhes sobre a moeda do jogo,{" "}
              <a href="#" className="text-blue-600 underline hover:text-blue-700">
                veja seus saldos de V-Bucks do Fortnite
              </a>.
            </p>
          </div>
        </div>

        {/* Grid de Pacotes Compacto */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
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
                    
                    {/* Badge de desconto (opcional) */}
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                      -10%
                    </div>
                  </div>

                  {/* Info do Pacote */}
                  <div className="p-2 bg-white border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1 truncate">{pkg.title}</p>
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {pkg.value.toLocaleString()} V-Bucks
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-[10px] text-gray-400 line-through">
                          R$ {pkg.originalPrice.toFixed(2)}
                        </div>
                        <div className="text-base font-bold text-green-600">
                          R$ {pkg.price.toFixed(2)}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500">GLOBAL</span>
                    </div>
                    
                    {/* Botão Comprar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(pkg)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                    >
                      Comprar
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

        {/* Info Footer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1 text-gray-900">Redirecionamento para Epic Games Store</p>
              <p>Ao selecionar um pacote, você será redirecionado para a Epic Games Store para completar sua compra de forma segura.</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </LojaLayout>
  )
}

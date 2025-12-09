"use client"

import { useState, useEffect, useRef } from "react"
import LojaLayout from '@/components/loja/LojaLayout'
import { useCart } from '@/contexts/CartContext'
import CompactSocialProof from '@/components/loja/CompactSocialProof'
import CompactHowItWorks from '@/components/loja/CompactHowItWorks'
import FAQ from '@/components/loja/FAQ'

export default function FreeFirePage() {
  const cart = useCart()
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<string | null>(null)
  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [buyersToday, setBuyersToday] = useState(48)

  // Configurar título da página
  useEffect(() => {
    document.title = 'Free Fire - Recarga de Diamantes Rápida e Segura'
  }, [])
  
  // Gerar número aleatório apenas uma vez no cliente
  useEffect(() => {
    setMounted(true)
    setBuyersToday(Math.floor(35 + Math.random() * 40))
  }, [])

  // Configuração do Free Fire
  const config = {
    name: 'Free Fire',
    banner: '/images/checkout-banner.webp',
    icon: '/images/icon.png',
    coinIcon: '/images/point.webp',
    userIcon: '/images/icon.png',
    rechargeValues: ["1.060", "2.180", "5.600"],
    promotionalValues: ["1.060", "2.180", "5.600"],
    diamondPrices: {
      "1.060": 24.98,
      "2.180": 35.19,
      "5.600": 54.20
    } as { [key: string]: number },
    itemPrices: {
      'semanal': 19.90,
      'mensal': 49.90,
      'booyah': 79.90,
      'nivel': 39.90,
      'jimg-ambicioso': 29.90,
      'jimg-pisico': 29.90,
      'jimg-violento': 29.90,
      'barba-velho': 14.90,
      'calca-angelical': 24.90,
      'mochila-dino': 19.90,
      'mochila-panda': 19.90
    } as { [key: string]: number },
    specialOffers: [
      { id: 'semanal', name: 'Assinatura Semanal', image: '/images/semanal.png', description: 'Ganhe 60 diamantes agora e resgate 40 diamantes todos os dias no jogo, durante 7 dias! Você receberá 340 diamantes no total.' },
      { id: 'mensal', name: 'Assinatura Mensal', image: '/images/mensal.png', description: 'Ganhe 300 diamantes agora e resgate 50 diamantes todos os dias no jogo, durante 30 dias! Você receberá 1800 diamantes no total.' },
      { id: 'booyah', name: 'Passe Booyah Premium Plus', image: '/images/boyahplus.png', description: 'Ganhe todos os privilégios e recompensas do Booyah Pass Premium + recompensas exclusivas + 50 níveis do Booyah Pass instantaneamente.' },
      { id: 'nivel', name: 'Passe de Nível', image: '/images/passe-nivel.webp', description: 'Avance de nível e desbloqueie recompensas incríveis, incluindo skins exclusivas e diamantes.' },
      { id: 'jimg-ambicioso', name: 'JIMG Ambicioso', image: '/images/jimg_ambicioso.png', description: 'Skin exclusiva JIMG Ambicioso para seu personagem.' },
      { id: 'jimg-pisico', name: 'JIMG Pisico', image: '/images/jimg_pisico.png', description: 'Skin exclusiva JIMG Pisico para seu personagem.' },
      { id: 'jimg-violento', name: 'JIMG Violento', image: '/images/jimg_violento.png', description: 'Skin exclusiva JIMG Violento para seu personagem.' },
      { id: 'barba-velho', name: 'Barba do Velho', image: '/images/Barba do Velho.png', description: 'Acessório exclusivo Barba do Velho.' },
      { id: 'calca-angelical', name: 'Calça Angelical Azul', image: '/images/Calça Angelical Azul.png', description: 'Calça Angelical Azul - Item raro e exclusivo.' },
      { id: 'mochila-dino', name: 'Mochila Dino', image: '/images/MochilaDino.png', description: 'Mochila temática de dinossauro.' },
      { id: 'mochila-panda', name: 'Mochila Panda', image: '/images/MochilaPanda.png', description: 'Mochila temática de panda.' }
    ]
  }

  // Funções do carrossel
  const scrollToItem = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.scrollWidth / config.specialOffers.length
      carouselRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth'
      })
      setCurrentIndex(index)
    }
  }

  const nextItem = () => {
    const newIndex = (currentIndex + 1) % config.specialOffers.length
    scrollToItem(newIndex)
  }

  const prevItem = () => {
    const newIndex = currentIndex === 0 ? config.specialOffers.length - 1 : currentIndex - 1
    scrollToItem(newIndex)
  }

  // Detectar scroll manual e atualizar indicadores
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft
      const itemWidth = carousel.scrollWidth / config.specialOffers.length
      const newIndex = Math.round(scrollLeft / itemWidth)
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < config.specialOffers.length) {
        setCurrentIndex(newIndex)
      }
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [currentIndex, config.specialOffers.length])

  return (
    <LojaLayout>
      {/* Prova Social Compacta */}
      <CompactSocialProof />

      {/* Como Funciona Compacto */}
      <CompactHowItWorks />

      <div className="max-w-5xl mx-auto px-4 pb-8">
        {/* Título dos Pacotes - ULTRA COMPACTO */}
        <div id="pacotes" className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Escolha seu Pacote de Diamantes</h1>
          {/* Selo único colado no título */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-gray-600">
            <span>✔️ Entrega automática</span>
            <span>•</span>
            <span>✔️ Disponível 24h</span>
            <span>•</span>
            <span>✔️ Pix instantâneo</span>
          </div>
        </div>
        
        {/* Grid de valores */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-4 mb-12">
          {config.rechargeValues.map((value, index) => {
            const isPromotional = config.promotionalValues.includes(value)
            const isSelected = selectedRechargeValue === value
            const price = config.diamondPrices[value] || 0
            
            // Labels para cada pacote
            const labels = ['Mais Vendido', 'Melhor Custo-Benefício', 'Recomendado']
            const labelColors = ['bg-gradient-to-r from-orange-500 to-red-500', 'bg-gradient-to-r from-green-500 to-emerald-500', 'bg-gradient-to-r from-purple-500 to-indigo-500']
            const label = labels[index]
            const labelColor = labelColors[index]
            
            // Gatilhos de urgência/social proof (dinâmico apenas no cliente)
            const urgencyMessages = [
              `🔥 ${buyersToday} pessoas compraram hoje`,
              '⏳ Estoque atualizado agora',
              '⚡ Entrega em segundos'
            ]
            const urgencyMessage = urgencyMessages[index]
            
            return (
              <div
                key={value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`group relative flex flex-col min-h-[70px] sm:min-h-[80px] md:min-h-[90px] overflow-hidden rounded-lg p-2 border-2 outline-none transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "bg-white border-gray-200 hover:border-orange-300 shadow-sm"
                }`}
                onClick={() => {
                  console.log('🖱️ [FreeFire] Diamantes clicado:', value)
                  const price = config.diamondPrices[value] || 0
                  const itemToAdd = {
                    id: `ff-diamonds-${value}`,
                    name: `${value} Diamantes`,
                    image: config.coinIcon,
                    price: price,
                    category: 'freefire' as const,
                    details: {
                      'Tipo': 'Diamantes',
                      'Quantidade': value,
                      'Promocional': isPromotional ? 'Sim' : 'Não'
                    }
                  }
                  console.log('📦 [FreeFire] Item a adicionar:', itemToAdd)
                  console.log('📦 [FreeFire] Cart object:', cart)
                  cart.addItem(itemToAdd)
                  setSelectedRechargeValue(value)
                }}
              >
                {/* Label do pacote */}
                <div className={`absolute top-0 right-0 left-0 ${labelColor} text-white text-[9px] sm:text-[10px] font-bold px-1 py-0.5 text-center`}>
                  {label}
                </div>
                
                <div className="flex flex-1 flex-col items-center justify-center gap-1 pt-4">
                  <img
                    alt="Diamante"
                    loading="lazy"
                    width="20"
                    height="20"
                    decoding="async"
                    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                    src={config.coinIcon}
                  />
                  <span className="text-sm sm:text-base font-bold text-gray-900 text-center leading-tight">
                    {value}
                  </span>
                  <span className="text-xs text-gray-600 font-semibold mt-1">
                    a partir de R$ {price.toFixed(2)}
                  </span>
                  {/* Gatilho de urgência */}
                  <span className="text-[9px] text-orange-600 font-bold mt-1 text-center leading-tight">
                    {urgencyMessage}
                  </span>
                </div>
                
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Itens e Skins - Carrossel */}
        <div className="mb-8">
          {/* Títulos Centralizados */}
          <h2 className="text-2xl font-bold mb-1 text-gray-900 text-center">Itens e Skins Exclusivas</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">Ganhe vantagens e personalize sua conta!</p>
          
          {/* Carrossel */}
          <div className="relative">
            {/* Indicador de Swipe Esquerda */}
            {currentIndex > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/80 to-transparent px-3 py-2 rounded-r-full">
                  <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-xs font-bold text-white">Arraste</span>
                </div>
              </div>
            )}
            
            {/* Indicador de Swipe Direita */}
            {currentIndex < config.specialOffers.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="flex items-center gap-1 bg-gradient-to-l from-orange-500/80 to-transparent px-3 py-2 rounded-l-full">
                  <span className="text-xs font-bold text-white">Arraste</span>
                  <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Container do Carrossel */}
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {config.specialOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className="flex-shrink-0 w-[160px] snap-center"
                  onClick={() => {
                    console.log('🖱️ [FreeFire] Item clicado:', offer.name)
                    const price = config.itemPrices[offer.id] || 0
                    const itemToAdd = {
                      id: offer.id,
                      name: offer.name,
                      image: offer.image,
                      price: price,
                      category: 'freefire' as const,
                      details: {
                        'Tipo': 'Item/Skin',
                        'Descrição': offer.description
                      }
                    }
                    console.log('📦 [FreeFire] Item a adicionar:', itemToAdd)
                    console.log('📦 [FreeFire] Cart object:', cart)
                    cart.addItem(itemToAdd)
                    setSelectedSpecialOffer(offer.name)
                    setCurrentIndex(index)
                  }}
                >
                  <div
                    className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all h-full ${
                      selectedSpecialOffer === offer.name
                        ? "border-orange-500 shadow-lg"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="relative w-full pt-[56.25%] overflow-hidden bg-gradient-to-br from-orange-50 to-gray-50">
                      <img
                        alt={offer.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-contain p-1"
                        src={offer.image}
                      />
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-[10px] font-bold text-gray-900 mb-0.5 line-clamp-1">
                        {offer.name}
                      </p>
                      <p className="text-[9px] text-gray-600 line-clamp-1 mb-1">
                        {offer.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-orange-600">
                          R$ {(config.itemPrices[offer.id] || 0).toFixed(2)}
                        </span>
                        <button className="text-[9px] text-blue-600 font-semibold hover:underline">
                          Ver detalhes →
                        </button>
                      </div>
                      <p className="text-[8px] text-green-600 font-semibold mt-1">
                        ✓ Entrega automática após pagamento
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de Navegação */}
            <button
              onClick={prevItem}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-orange-50 text-orange-600 p-3 rounded-full shadow-lg border-2 border-orange-200 transition-all z-20"
              aria-label="Anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextItem}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-orange-50 text-orange-600 p-3 rounded-full shadow-lg border-2 border-orange-200 transition-all z-20"
              aria-label="Próximo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-6">
            {config.specialOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToItem(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-orange-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para item ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* FAQ - Perguntas Frequentes */}
        <FAQ />
      </div>
    </LojaLayout>
  )
}

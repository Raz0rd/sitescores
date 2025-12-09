"use client"

import { useState, useEffect, useRef } from "react"
import LojaLayout from '@/components/loja/LojaLayout'
import BrainrotBanner from '@/components/loja/BrainrotBanner'
import brainrotData from '@/data/brainrot-items.json'
import { useCart } from '@/contexts/CartContext'

interface BrainrotItem {
  id: string
  title: string
  brainrotName: string
  rarity: string
  ms: string
  msNumeric: number
  mutations: string
  hasMutation: boolean
  priceAmount: number
  priceCurrency: string
  priceUSD: number
  imageUrl: string
  description: string
  quantity: number
  isTrending: boolean
  seller: {
    username: string
    isVerified: boolean
    feedbackScore: number
  }
  originalPrice?: number
  hasDiscount?: boolean
  discountPercentage?: number
}

export default function BrainrootsPage() {
  const cart = useCart()
  
  // Aplicar desconto de 45% em itens acima de R$ 50
  const itemsWithDiscount = (brainrotData.items as BrainrotItem[]).map(item => {
    if (item.priceAmount > 50) {
      const discountAmount = item.priceAmount * 0.45
      return {
        ...item,
        originalPrice: item.priceAmount,
        priceAmount: item.priceAmount - discountAmount,
        hasDiscount: true,
        discountPercentage: 45
      }
    }
    return { ...item, hasDiscount: false }
  })
  
  const [items, setItems] = useState<BrainrotItem[]>(itemsWithDiscount)
  const [filteredItems, setFilteredItems] = useState<BrainrotItem[]>(items)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  // Filtros
  const [filterRarity, setFilterRarity] = useState<string>('')
  const [filterBrainrot, setFilterBrainrot] = useState<string>('')
  const [filterMs, setFilterMs] = useState<string>('')
  const [filterMutation, setFilterMutation] = useState<string>('')
  const [filterPrice, setFilterPrice] = useState<string>('')
  
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Brainroots - Steal a Brainrot Items'
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...items]

    // Filtro de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brainrotName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de raridade
    if (filterRarity) {
      filtered = filtered.filter(item => item.rarity === filterRarity)
    }

    // Filtro de brainrot
    if (filterBrainrot) {
      filtered = filtered.filter(item => item.brainrotName === filterBrainrot)
    }

    // Filtro de M/s
    if (filterMs) {
      filtered = filtered.filter(item => item.ms === filterMs)
    }

    // Filtro de mutação
    if (filterMutation) {
      filtered = filtered.filter(item => item.mutations === filterMutation)
    }

    // Filtro de preço
    if (filterPrice) {
      if (filterPrice === 'low') {
        filtered.sort((a, b) => a.priceAmount - b.priceAmount)
      } else if (filterPrice === 'high') {
        filtered.sort((a, b) => b.priceAmount - a.priceAmount)
      }
    }

    setFilteredItems(filtered)
    setCurrentIndex(0)
    setCurrentPage(1) // Resetar para primeira página ao filtrar
  }, [searchTerm, filterRarity, filterBrainrot, filterMs, filterMutation, filterPrice, items])

  // Navegação do carousel
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide()
    }
    if (touchStart - touchEnd < -75) {
      prevSlide()
    }
  }

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [filteredItems.length])

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'Brainrot Deus': 'from-yellow-400 to-orange-500',
      'Secreto': 'from-purple-500 to-pink-500',
      'Mítico': 'from-blue-500 to-cyan-500'
    }
    return colors[rarity] || 'from-gray-400 to-gray-500'
  }

  const getRarityBadge = (rarity: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      'Brainrot Deus': { text: 'BRAINROT DEUS', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
      'Secreto': { text: 'SECRETO', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
      'Mítico': { text: 'MÍTICO', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' }
    }
    return badges[rarity] || { text: rarity.toUpperCase(), color: 'bg-gray-500' }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterRarity('')
    setFilterBrainrot('')
    setFilterMs('')
    setFilterMutation('')
    setFilterPrice('')
  }

  // Calcular paginação
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (filteredItems.length === 0) {
    return (
      <LojaLayout>
        <div className="max-w-6xl mx-auto p-4 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Nenhum item encontrado com os filtros selecionados.</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </LojaLayout>
    )
  }

  const currentItem = filteredItems[currentIndex]
  const badge = getRarityBadge(currentItem.rarity)

  return (
    <LojaLayout customBanner={<BrainrotBanner />}>
      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <p className="text-xs text-gray-400">
            <span>Início</span>
            <span className="mx-2">›</span>
            <span className="text-gray-600 font-medium">Brainroots</span>
          </p>
        </div>

        {/* Hero - Título + Subtítulo + Trust Icons */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Steal a Brainrot — Itens
          </h1>
          <p className="text-sm text-gray-700 mb-4 max-w-2xl mx-auto">
            Encontre os melhores brainrots com segurança e entrega imediata.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Marketplace líder em venda de brainrots — preços atualizados em tempo real.
          </p>
          
          {/* Trust Icons */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔒</span>
              <span className="text-gray-700 font-medium">Itens verificados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">⚡</span>
              <span className="text-gray-700 font-medium">Entrega rápida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📦</span>
              <span className="text-gray-700 font-medium">Estoque atualizado</span>
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa - Compacta */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pesquisar brainrot por nome…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 pr-4 text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* Filtros - Compactos e Refinados */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
            <button
              onClick={clearFilters}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Raridade */}
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 text-sm border border-[#D9D9D9] rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none h-[42px]"
            >
              <option value="">Todas Raridades</option>
              {brainrotData.filterOptions.rarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>

            {/* Brainrot */}
            <select
              value={filterBrainrot}
              onChange={(e) => setFilterBrainrot(e.target.value)}
              className="px-3 py-2 text-sm border border-[#D9D9D9] rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none h-[42px]"
            >
              <option value="">Todos Brainrots</option>
              {brainrotData.filterOptions.brainrots.map(brainrot => (
                <option key={brainrot} value={brainrot}>{brainrot}</option>
              ))}
            </select>

            {/* M/s */}
            <select
              value={filterMs}
              onChange={(e) => setFilterMs(e.target.value)}
              className="px-3 py-2 text-sm border border-[#D9D9D9] rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none h-[42px]"
            >
              <option value="">Todos M/s</option>
              {brainrotData.filterOptions.msRanges.map(ms => (
                <option key={ms} value={ms}>{ms}</option>
              ))}
            </select>

            {/* Mutações */}
            <select
              value={filterMutation}
              onChange={(e) => setFilterMutation(e.target.value)}
              className="px-3 py-2 text-sm border border-[#D9D9D9] rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none h-[42px]"
            >
              <option value="">Todas Mutações</option>
              {brainrotData.filterOptions.mutations.map(mutation => (
                <option key={mutation} value={mutation}>{mutation}</option>
              ))}
            </select>

            {/* Preço */}
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="px-3 py-2 text-sm border border-[#D9D9D9] rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none h-[42px]"
            >
              <option value="">Ordenar por</option>
              <option value="low">Menor Preço</option>
              <option value="high">Maior Preço</option>
            </select>
          </div>

          {/* Contador de resultados - Menor e centralizado */}
          <div className="mt-3 text-xs text-[#888888] text-center">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} de {filteredItems.length} itens
            {filteredItems.length !== items.length && ` (${items.length} no total)`}
          </div>
        </div>

        {/* Fita Infinita de Brainrots */}
        <div className="relative mb-4 max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-lg py-2" style={{
            background: 'linear-gradient(90deg, rgba(255,0,0,0.15) 0%, rgba(255,154,0,0.15) 10%, rgba(208,222,33,0.15) 20%, rgba(79,220,74,0.15) 30%, rgba(63,218,216,0.15) 40%, rgba(47,201,226,0.15) 50%, rgba(28,127,238,0.15) 60%, rgba(95,21,242,0.15) 70%, rgba(186,12,248,0.15) 80%, rgba(251,7,217,0.15) 90%, rgba(255,0,0,0.15) 100%)',
            backgroundSize: '200% 100%',
            animation: 'rainbow-bg 3s linear infinite'
          }}>
            <div className="flex gap-2" style={{ animation: 'scroll-infinite 25s linear infinite' }}>
              {/* Duplicar itens para efeito infinito */}
              {[...filteredItems.slice(0, 20), ...filteredItems.slice(0, 20)].map((item, index) => {
                const itemBadge = getRarityBadge(item.rarity)
                return (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => {
                      console.log('🖱️ [Brainroots] Item clicado:', item.title)
                      cart.addItem({
                        id: item.id,
                        name: item.title,
                        image: item.imageUrl,
                        price: item.priceAmount,
                        originalPrice: item.originalPrice,
                        category: 'vbucks',
                        details: {
                          'Brainrot': item.brainrotName,
                          'Raridade': item.rarity,
                          'M/s': item.ms,
                          'Mutações': item.mutations || 'Nenhuma',
                          'Vendedor': item.seller.username
                        }
                      })
                    }}
                    className="flex-shrink-0 w-[100px] cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 overflow-hidden shadow-sm">
                      {/* Imagem */}
                      <div className="relative w-full h-[100px] bg-gradient-to-br from-gray-50 to-gray-100 p-1">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                        {/* Badge de Raridade */}
                        <div className={`absolute top-0.5 right-0.5 ${itemBadge.color} text-white text-[7px] font-bold px-1 py-0.5 rounded-full`}>
                          {item.rarity === 'Brainrot God' ? '🔥' : item.rarity === 'Secret' ? '💎' : '⭐'}
                        </div>
                        {/* Badge de Desconto */}
                        {item.hasDiscount && (
                          <div className="absolute top-0.5 left-0.5 bg-green-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full">
                            -{item.discountPercentage}%
                          </div>
                        )}
                        {/* Tag de Mutação */}
                        {item.hasMutation && item.mutations !== 'None' && (
                          <div className="absolute bottom-0.5 left-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full">
                            {item.mutations}
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="p-1.5 bg-white">
                        <p className="text-[9px] font-bold text-gray-900 truncate mb-0.5">{item.brainrotName}</p>
                        <p className="text-[8px] text-gray-600 mb-0.5">M/s: {item.ms}</p>
                        {item.hasDiscount && item.originalPrice && (
                          <p className="text-[7px] text-gray-400 line-through">R$ {item.originalPrice.toFixed(2)}</p>
                        )}
                        <p className="text-[10px] font-bold text-purple-600">R$ {item.priceAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll-infinite {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          @keyframes rainbow-bg {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 200% 50%;
            }
          }
        `}</style>

        {/* Grid de Thumbnails com Paginação */}
        <div className="mb-10">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-bold text-gray-900">
              Todos os Itens ({filteredItems.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            {paginatedItems.map((item, index) => {
              const itemBadge = getRarityBadge(item.rarity)
              const globalIndex = startIndex + index
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    console.log('🖱️ [Brainroots Grid] Item clicado:', item.title)
                    cart.addItem({
                      id: item.id,
                      name: item.title,
                      image: item.imageUrl,
                      price: item.priceAmount,
                      originalPrice: item.originalPrice,
                      category: 'vbucks',
                      details: {
                        'Brainrot': item.brainrotName,
                        'Raridade': item.rarity,
                        'M/s': item.ms,
                        'Mutações': item.mutations || 'Nenhuma',
                        'Vendedor': item.seller.username
                      }
                    })
                    setCurrentIndex(globalIndex)
                  }}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    globalIndex === currentIndex
                      ? 'border-purple-500 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 p-2">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                    <div className={`absolute top-1 right-1 ${itemBadge.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {item.rarity === 'Brainrot Deus' ? '🔥' : item.rarity === 'Secreto' ? '💎' : '⭐'}
                    </div>
                    {item.hasDiscount && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        -{item.discountPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <div className="flex items-center gap-1 mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate flex-1">{item.brainrotName}</p>
                      {item.hasMutation && item.mutations !== 'None' && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          {item.mutations}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{item.ms}</p>
                    <div className="flex items-baseline gap-1.5">
                      {item.hasDiscount && item.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">R$ {item.originalPrice.toFixed(2)}</span>
                      )}
                      <span className="text-base font-bold text-[#0CAF60]">R$ {item.priceAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Controles de Paginação - Minimalista */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              >
                ‹
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                          page === currentPage
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                  }
                  return null
                })}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Itens Verificados e Seguros */}
        <div className="max-w-4xl mx-auto bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💎</span>
            <div className="text-sm text-gray-900">
              <p className="font-bold text-base mb-1.5">Itens Verificados e Seguros</p>
              <p className="mb-1.5 leading-relaxed">Todos os itens são autênticos e verificados por vendedores confiáveis. Entrega rápida garantida em até 20 minutos!</p>
              <p className="text-xs text-gray-600">Os preços são atualizados em tempo real</p>
            </div>
          </div>
        </div>

        {/* SEO Footer */}
        <div className="max-w-4xl mx-auto text-center text-xs text-gray-500 mt-6">
          <p>Itens entregues automaticamente em poucos minutos após pagamento.</p>
        </div>
      </div>
    </LojaLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from 'next/navigation'
import UrgencyBannerLoja from './UrgencyBannerLoja'
import RankingTop3 from './RankingTop3'
import LojaFooter from './LojaFooter'
import FixedCartButton from './FixedCartButton'
import CartToast from './CartToast'
import { useCartToast } from '@/hooks/useCartToast'
import { useCart } from '@/contexts/CartContext'

interface LojaLayoutProps {
  children: React.ReactNode
  customBanner?: React.ReactNode
  hideRanking?: boolean
}

export default function LojaLayout({ children, customBanner, hideRanking = false }: LojaLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const cart = useCart()
  const { showToast, itemName, showCartToast, hideToast } = useCartToast()
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false)
  const [currentIcon, setCurrentIcon] = useState<React.ReactNode>(null)
  const [categoryText, setCategoryText] = useState('Recarga Rápida e Segura')
  const [prevItemCount, setPrevItemCount] = useState(0)

  // Detectar categoria atual e definir ícone + texto
  useEffect(() => {
    if (pathname.includes('/freefire')) {
      setCurrentIcon(
        <img src="/images/categoriesIcons/icons8-fogo-livre-48.png" alt="Free Fire" className="w-6 h-6 sm:w-7 sm:h-7" />
      )
      setCategoryText('Diamantes e Itens')
    } else if (pathname.includes('/robux')) {
      setCurrentIcon(
        <img src="/images/robux-coin-gold.svg" alt="Robux" className="w-6 h-6 sm:w-7 sm:h-7" />
      )
      setCategoryText('Roblox')
    } else if (pathname.includes('/vbucks')) {
      setCurrentIcon(
        <img src="/images/categoriesIcons/icons8-fortnite-30.png" alt="Fortnite" className="w-6 h-6 sm:w-7 sm:h-7" />
      )
      setCategoryText('Fortnite')
    } else if (pathname.includes('/brainroot')) {
      setCurrentIcon(
        <img src="/images/categoriesIcons/Pipi_Kiwi.webp" alt="Brainrot" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
      )
      setCategoryText('Brainrot Items')
    } else if (pathname.includes('/recarga-celular')) {
      setCurrentIcon(
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
      setCategoryText('Todas as Operadoras')
    } else {
      // Ícone padrão
      setCurrentIcon(
        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
      setCategoryText('Recarga Rápida e Segura')
    }
  }, [pathname])

  // Detectar quando um item é adicionado ao carrinho
  useEffect(() => {
    // Só mostrar toast se:
    // 1. Aumentou o número de itens (não diminuiu)
    // 2. Não é a primeira renderização (prevItemCount !== 0)
    // 3. Não está na página de checkout
    const isCheckoutPage = pathname?.includes('/checkout')
    
    if (cart.itemCount > prevItemCount && prevItemCount !== 0 && !isCheckoutPage && cart.items.length > 0) {
      const lastItem = cart.items[cart.items.length - 1]
      showCartToast(lastItem.name)
    }
    setPrevItemCount(cart.itemCount)
  }, [cart.itemCount, cart.items, pathname])

  // Função para adicionar UTMs a qualquer URL interna
  const addUtmsToUrl = (url: string): string => {
    if (typeof window === 'undefined') return url
    
    const currentParams = new URLSearchParams(window.location.search)
    const urlObj = new URL(url, window.location.origin)
    
    // Adicionar todos os parâmetros atuais à nova URL
    currentParams.forEach((value, key) => {
      if (!urlObj.searchParams.has(key)) {
        urlObj.searchParams.set(key, value)
      }
    })
    
    return urlObj.pathname + urlObj.search
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
        {/* Header Fixo */}
        <div className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Fitinha Animada Customizada ou Padrão */}
        {customBanner || <UrgencyBannerLoja />}
        
        {/* Barra de Navegação */}
        <div className="border-b border-gray-200">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Nome do Site */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center relative overflow-hidden">
                <img 
                  src="/images/shipbuxlogo.png" 
                  alt="Shipbux Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  Shipbux
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Itens Digitais Instantâneos</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] sm:text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                    🛡️ Pagamento Seguro
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-[9px] sm:text-[10px] text-blue-600 font-semibold flex items-center gap-0.5">
                    ⚡ Entrega Automática
                  </span>
                </div>
              </div>
            </div>
            
            {/* Menu de Categorias */}
            <div className="relative">
              <button 
                onClick={() => setShowCategoriesMenu(!showCategoriesMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {/* <span className="text-sm font-medium text-gray-700 hidden sm:inline">Categorias</span> */}
                <svg className={`w-4 h-4 text-gray-700 transition-transform ${showCategoriesMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showCategoriesMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCategoriesMenu(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-2">
                      <a 
                        href="#" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCategoriesMenu(false)
                          router.push(addUtmsToUrl('/loja/freefire'))
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <img src="/images/categoriesIcons/icons8-fogo-livre-48.png" alt="Free Fire" className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">Free Fire</p>
                          <p className="text-xs text-gray-500">Diamantes e itens</p>
                        </div>
                      </a>

                      <a 
                        href="#" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCategoriesMenu(false)
                          router.push(addUtmsToUrl('/loja/robux'))
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6" viewBox="36 36 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M64.9688,44.165 C66.8448,45.248 67.9998,47.249 67.9998,49.415 L67.9998,58.581 C67.9998,60.747 66.8448,62.748 64.9688,63.831 L57.0318,68.414 C55.1558,69.497 52.8448,69.497 50.9688,68.414 L43.0318,63.831 C41.1558,62.748 39.9998,60.747 39.9998,58.581 L39.9998,49.415 C39.9998,47.249 41.1558,45.248 43.0318,44.165 L50.9688,39.582 C52.8448,38.499 55.1558,38.499 57.0318,39.582 L64.9688,44.165 Z M51.9758,41.31 L44.0248,45.901 C42.7718,46.624 41.9998,47.961 41.9998,49.407 L41.9998,58.589 C41.9998,60.035 42.7718,61.372 44.0248,62.095 L51.9758,66.686 C53.2288,67.409 54.7718,67.409 56.0248,66.686 L63.9758,62.095 C65.2288,61.372 65.9998,60.035 65.9998,58.589 L65.9998,49.407 C65.9998,47.961 65.2288,46.624 63.9758,45.901 L56.0248,41.31 C54.7718,40.587 53.2288,40.587 51.9758,41.31 L51.9758,41.31 Z M55.5588,44.508 L61.4418,47.904 C62.4058,48.461 62.9998,49.49 62.9998,50.604 L62.9998,57.396 C62.9998,58.51 62.4058,59.539 61.4418,60.096 L55.5588,63.492 C54.5938,64.049 53.4058,64.049 52.4418,63.492 L46.5588,60.096 C45.5938,59.539 44.9998,58.51 44.9998,57.396 L44.9998,50.604 C44.9998,49.49 45.5938,48.461 46.5588,47.904 L52.4418,44.508 C53.4058,43.951 54.5938,43.951 55.5588,44.508 L55.5588,44.508 Z M50.9998,57 L56.9998,57 L56.9998,51 L50.9998,51 L50.9998,57 Z" fill="#393B3D"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">Robux</p>
                          <p className="text-xs text-gray-500">Roblox</p>
                        </div>
                      </a>

                      <a 
                        href="#" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCategoriesMenu(false)
                          router.push(addUtmsToUrl('/loja/recarga-celular'))
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">Recarga Celular</p>
                          <p className="text-xs text-gray-500">Todas as operadoras</p>
                        </div>
                      </a>

                      <a 
                        href="#" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCategoriesMenu(false)
                          router.push(addUtmsToUrl('/loja/vbucks'))
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <img src="/images/categoriesIcons/icons8-fortnite-30.png" alt="Fortnite" className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">V-Bucks</p>
                          <p className="text-xs text-gray-500">Fortnite</p>
                        </div>
                      </a>

                      <a 
                        href="#" 
                        className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors group"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCategoriesMenu(false)
                          router.push(addUtmsToUrl('/loja/brainroots'))
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <img src="/images/categoriesIcons/Pipi_Kiwi.webp" alt="Steal a Brainrot" className="w-6 h-6 object-contain" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">Steal a Brainrot</p>
                          <p className="text-xs text-gray-500">Brainrot Items</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Conteúdo da Página (children) */}
      <div className="flex-1 bg-gray-50">
        {children}
      </div>

      {/* Ranking Top 3 */}
      {!hideRanking && <RankingTop3 />}

      {/* Footer */}
      <LojaFooter />

      {/* Botão Fixo do Carrinho */}
      <FixedCartButton />

      {/* Toast de Confirmação */}
      <CartToast show={showToast} itemName={itemName} onHide={hideToast} />
    </div>
  )
}

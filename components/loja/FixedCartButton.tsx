"use client"

import { ShoppingCart } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { getProductById } from '@/lib/products-data'

export default function FixedCartButton() {
  const router = useRouter()
  const pathname = usePathname()
  const cart = useCart()

  // Não mostrar se carrinho vazio
  if (cart.itemCount === 0) return null
  
  // Não mostrar se já estiver no checkout
  if (pathname?.includes('/checkout')) return null

  const handleClick = () => {
    console.log('🛒 [FixedCartButton] Clicou em Finalizar')
    console.log('🛒 [FixedCartButton] Items no carrinho:', cart.items)
    console.log('🛒 [FixedCartButton] Total:', cart.totalPrice)
    
    // Verificar se há itens
    if (cart.itemCount === 0) {
      console.error('❌ [FixedCartButton] Carrinho vazio!')
      return
    }
    
    const firstItem = cart.items[0]
    const category = firstItem?.category || 'freefire'
    
    // Preservar UTMs da URL atual
    const currentParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
    
    // Se apenas 1 item, usar slug no checkout
    if (cart.itemCount === 1) {
      const product = getProductById(firstItem.id)
      
      if (product?.slug) {
        console.log('🛒 [FixedCartButton] 1 item - Checkout com slug:', product.slug)
        currentParams.set('slug', product.slug)
        router.push(`/loja/checkout?${currentParams.toString()}`)
        return
      }
    }
    
    // Se 2+ itens, ir para checkout com categoria
    console.log('🛒 [FixedCartButton] Múltiplos itens - Checkout com categoria:', category)
    currentParams.set('category', category)
    router.push(`/loja/checkout?${currentParams.toString()}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent">
      <button
        onClick={handleClick}
        type="button"
        className="w-full max-w-2xl mx-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cart.itemCount}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm leading-tight">
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'itens'} no carrinho
            </span>
            <span className="text-xs opacity-90 leading-tight">
              Total: R$ {cart.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Finalizar</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  )
}

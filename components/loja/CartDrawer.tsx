"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import RobuxIcon from './RobuxIcon'
import { getProductById } from '@/lib/products-data'

interface CartItem {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  category: 'freefire' | 'robux' | 'vbucks'
  details: {
    [key: string]: string
  }
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemoveItem: (id: string) => void
  onCheckout: () => void
}

export default function CartDrawer({ isOpen, onClose, items, onRemoveItem, onCheckout }: CartDrawerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen])

  const handleCheckout = () => {
    // Se apenas 1 item, redirecionar para página do produto com slug
    if (items.length === 1) {
      const product = getProductById(items[0].id)
      
      if (product?.slug) {
        console.log('🛒 [CartDrawer] 1 item - Redirecionando para slug:', product.slug)
        router.push(`/produto/${product.slug}`)
        onClose()
        return
      }
    }
    
    // Se 2+ itens, ir para checkout da loja
    router.push('/loja/checkout')
    onClose()
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'freefire':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-50',
          text: 'text-orange-600',
          button: 'bg-orange-500 hover:bg-orange-600'
        }
      case 'robux':
        return {
          border: 'border-gray-800',
          bg: 'bg-gray-100',
          text: 'text-gray-900',
          button: 'bg-gray-800 hover:bg-gray-900'
        }
      case 'vbucks':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          button: 'bg-blue-500 hover:bg-blue-600'
        }
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        }
    }
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)
  const totalOriginal = items.reduce((sum, item) => sum + (item.originalPrice || item.price), 0)
  const savings = totalOriginal - total

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Seu Carrinho</h2>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-400 mt-1">Adicione itens para começar</p>
            </div>
          ) : (
            items.map((item) => {
              const colors = getCategoryColor(item.category)
              return (
                <div
                  key={item.id}
                  className={`flex gap-3 p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                >
                  {/* Imagem */}
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                    {item.category === 'robux' ? (
                      <img
                        src="/images/robux-coin-gold.svg"
                        alt="Robux"
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h3>
                    
                    {/* Detalhes */}
                    <div className="space-y-0.5 mb-1.5">
                      {Object.entries(item.details).slice(0, 2).map(([key, value]) => (
                        <p key={key} className="text-[10px] text-gray-600">
                          <span className="font-semibold">{key}:</span> {value}
                        </p>
                      ))}
                    </div>

                    {/* Preço */}
                    <div className="flex items-center gap-2">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className={`text-base font-bold ${colors.text}`}>
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Botão Remover */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer com Total e Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
            {/* Resumo */}
            <div className="space-y-1">
              {savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-400 line-through">R$ {totalOriginal.toFixed(2)}</span>
                </div>
              )}
              {savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-semibold">Economia:</span>
                  <span className="text-green-600 font-semibold">- R$ {savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão Finalizar */}
            <button
              onClick={handleCheckout}
              className={`w-full ${items[0] ? getCategoryColor(items[0].category).button : 'bg-gray-800 hover:bg-gray-900'} text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2`}
            >
              <ShoppingCart className="w-5 h-5" />
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </>
  )
}

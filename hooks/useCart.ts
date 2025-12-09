"use client"

import { useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  category?: 'freefire' | 'robux' | 'vbucks' | 'recarga' | 'brainroots'
  quantity?: number
  details?: {
    [key: string]: string
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Carregar do localStorage ao montar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Erro ao carregar carrinho:', e)
      }
    }
  }, [])

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    console.log('🛒 [useCart] Adicionando item ao carrinho:', item)
    setItems(prev => {
      // Verificar se já existe
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        console.log('⚠️ [useCart] Item já existe no carrinho')
        return prev // Não adicionar duplicado
      }
      console.log('✅ [useCart] Item adicionado com sucesso')
      return [...prev, item]
    })
    // NÃO abrir drawer - usar botão fixo ao invés
    // setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const toggleDrawer = () => {
    setIsOpen(prev => !prev)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  const openDrawer = () => {
    setIsOpen(true)
  }

  const totalPrice = items.reduce((sum, item) => {
    const quantity = item.quantity || 1
    return sum + (item.price * quantity)
  }, 0)

  return {
    items,
    itemCount: items.length,
    totalPrice,
    isOpen,
    addItem,
    removeItem,
    clearCart,
    toggleDrawer,
    closeDrawer,
    openDrawer
  }
}

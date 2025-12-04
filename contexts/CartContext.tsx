"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import CartModal from '@/components/loja/CartModal'

export interface CartItem {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  category: 'freefire' | 'robux' | 'vbucks' | 'recarga'
  details: {
    [key: string]: string
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  toggleDrawer: () => void
  closeDrawer: () => void
  openDrawer: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [currentCategory, setCurrentCategory] = useState<'freefire' | 'robux' | 'vbucks' | 'recarga' | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')

  const showModal = (title: string, message: string) => {
    setModalTitle(title)
    setModalMessage(message)
    setModalOpen(true)
  }

  // Detectar categoria atual da URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path.includes('/freefire')) {
        setCurrentCategory('freefire')
      } else if (path.includes('/robux')) {
        setCurrentCategory('robux')
      } else if (path.includes('/vbucks')) {
        setCurrentCategory('vbucks')
      } else if (path.includes('/recarga-celular')) {
        setCurrentCategory('recarga')
      }
    }
  }, [])

  // Carregar do localStorage ao montar (apenas da categoria atual)
  useEffect(() => {
    if (!currentCategory) return
    
    const savedCart = localStorage.getItem(`cart_${currentCategory}`)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setItems(parsed)
        console.log(`📦 [CartContext] Carrinho ${currentCategory} carregado:`, parsed)
      } catch (e) {
        console.error('❌ [CartContext] Erro ao carregar carrinho:', e)
      }
    } else {
      setItems([])
    }
  }, [currentCategory])

  // Salvar no localStorage quando mudar (separado por categoria)
  useEffect(() => {
    if (!currentCategory) return
    
    if (items.length > 0) {
      localStorage.setItem(`cart_${currentCategory}`, JSON.stringify(items))
      console.log(`💾 [CartContext] Carrinho ${currentCategory} salvo:`, items)
    } else {
      localStorage.removeItem(`cart_${currentCategory}`)
    }
  }, [items, currentCategory])

  const addItem = (item: CartItem) => {
    console.log('🛒 [CartContext] Tentando adicionar item:', item.name, 'Categoria:', item.category)
    
    setItems(prev => {
      // Verificar se já existe
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        console.log('⚠️ [CartContext] Item já existe no carrinho')
        return prev
      }
      
      // Verificar se há itens de outra categoria
      if (prev.length > 0) {
        const currentCategory = prev[0].category
        if (currentCategory !== item.category) {
          console.log('❌ [CartContext] ERRO: Não é possível misturar categorias!')
          console.log(`   Carrinho atual: ${currentCategory}`)
          console.log(`   Item tentando adicionar: ${item.category}`)
          const categoryNames = {
            freefire: 'Free Fire',
            robux: 'Robux',
            vbucks: 'Brainrot'
          }
          showModal(
            'Categoria Diferente',
            `Você só pode comprar itens de uma categoria por vez!\n\nSeu carrinho tem itens de: ${categoryNames[currentCategory as keyof typeof categoryNames]}\n\nRemova os itens atuais para adicionar de outra categoria.`
          )
          return prev
        }
      }
      
      // REGRAS DE LIMITE POR CATEGORIA
      const categoryName = item.category === 'freefire' ? 'Free Fire' : item.category === 'robux' ? 'Robux' : item.category === 'vbucks' ? 'V-Bucks' : 'Brainrot'
      
      if (item.category === 'freefire') {
        // Free Fire: Diamantes = 1, Itens/Skins = 2
        const isDiamond = item.details?.['Tipo'] === 'Diamantes'
        const diamondCount = prev.filter(i => i.details?.['Tipo'] === 'Diamantes').length
        const itemCount = prev.filter(i => i.details?.['Tipo'] !== 'Diamantes').length
        
        if (isDiamond && diamondCount >= 1) {
          showModal('Limite Atingido', 'Você só pode adicionar 1 pacote de Diamantes por compra!')
          return prev
        }
        
        if (!isDiamond && itemCount >= 2) {
          showModal('Limite Atingido', 'Você só pode adicionar até 2 Itens/Skins por compra!')
          return prev
        }
      }
      
      if (item.category === 'robux') {
        // Robux: Apenas 1 por compra
        if (prev.length >= 1) {
          showModal('Limite Atingido', 'Você só pode adicionar 1 pacote de Robux por compra!')
          return prev
        }
      }
      
      if (item.category === 'vbucks') {
        // V-Bucks/Brainrot: Até 2 por compra
        if (prev.length >= 2) {
          showModal('Limite Atingido', 'Você só pode adicionar até 2 itens de Brainrot por compra!')
          return prev
        }
      }
      
      console.log('✅ [CartContext] Item adicionado com sucesso!')
      const newItems = [...prev, item]
      return newItems
    })
    // NÃO abrir drawer automaticamente - apenas mostrar a barra lateral
  }

  const removeItem = (id: string) => {
    console.log('🗑️ [CartContext] Removendo item:', id)
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    console.log('🧹 [CartContext] Limpando carrinho')
    setItems([])
  }

  const toggleDrawer = () => {
    console.log('🔄 [CartContext] Toggle drawer')
    setIsOpen(prev => !prev)
  }

  const closeDrawer = () => {
    console.log('❌ [CartContext] Fechando drawer')
    setIsOpen(false)
  }

  const openDrawer = () => {
    console.log('✅ [CartContext] Abrindo drawer')
    setIsOpen(true)
  }

  // Calcular total
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
      
      {/* Modal de Avisos */}
      <CartModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }
  return context
}

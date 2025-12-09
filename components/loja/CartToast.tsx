"use client"

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

interface CartToastProps {
  show: boolean
  itemName: string
  onHide: () => void
}

export default function CartToast({ show, itemName, onHide }: CartToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const hideTimer = setTimeout(() => {
        setIsVisible(false)
      }, 1800)
      
      const removeTimer = setTimeout(() => {
        onHide()
      }, 2100) // Aguardar animação de saída
      
      return () => {
        clearTimeout(hideTimer)
        clearTimeout(removeTimer)
      }
    } else {
      setIsVisible(false)
    }
  }, [show, onHide])

  if (!show && !isVisible) return null

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div 
        className="rounded-xl shadow-2xl px-5 py-3.5 flex items-center gap-3"
        style={{ backgroundColor: '#FF8A00' }}
      >
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-3.5 h-3.5 text-orange-500" />
        </div>
        <span className="font-bold text-sm text-white">
          📦 {itemName} adicionado ao carrinho!
        </span>
      </div>
    </div>
  )
}

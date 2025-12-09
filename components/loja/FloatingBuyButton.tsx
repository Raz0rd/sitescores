"use client"

import { ShoppingCart } from 'lucide-react'

interface FloatingBuyButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function FloatingBuyButton({ onClick, disabled }: FloatingBuyButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl
          font-bold text-white transition-all transform
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:scale-110 hover:shadow-3xl active:scale-95'
          }
        `}
      >
        <ShoppingCart className="w-5 h-5" />
        <div className="flex flex-col items-start">
          <span className="text-xs leading-none">Comprar Agora</span>
          <span className="text-[10px] leading-none opacity-90">(Entrega Imediata)</span>
        </div>
      </button>
    </div>
  )
}

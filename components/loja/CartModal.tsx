"use client"

import { useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export default function CartModal({ isOpen, onClose, title, message }: CartModalProps) {
  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ícone de Alerta */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-orange-600" />
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
          {title}
        </h3>

        {/* Mensagem */}
        <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* Botão OK */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          Entendi
        </button>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

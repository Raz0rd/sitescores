"use client"

import { useState, useEffect } from 'react'

interface CartButtonProps {
  itemCount: number
  totalPrice: number
  onClick: () => void
  category?: 'freefire' | 'robux' | 'vbucks'
}

export default function CartButton({ itemCount, totalPrice, onClick, category = 'freefire' }: CartButtonProps) {
  const [showWave, setShowWave] = useState(false)
  const [prevCount, setPrevCount] = useState(itemCount)

  // Detectar quando um item é adicionado
  useEffect(() => {
    if (itemCount > prevCount) {
      setShowWave(true)
      setTimeout(() => setShowWave(false), 800)
    }
    setPrevCount(itemCount)
  }, [itemCount, prevCount])

  const getCategoryStyle = () => {
    switch (category) {
      case 'freefire':
        return {
          gradient: 'from-orange-500 via-yellow-400 to-orange-500',
          solid: 'bg-orange-500',
          text: 'text-orange-500'
        }
      case 'robux':
        return {
          gradient: 'from-gray-800 via-gray-600 to-gray-800',
          solid: 'bg-gray-800',
          text: 'text-gray-800'
        }
      case 'vbucks':
        return {
          gradient: 'from-blue-500 via-cyan-400 to-blue-500',
          solid: 'bg-blue-500',
          text: 'text-blue-500'
        }
      default:
        return {
          gradient: 'from-orange-500 via-yellow-400 to-orange-500',
          solid: 'bg-orange-500',
          text: 'text-orange-500'
        }
    }
  }

  const style = getCategoryStyle()

  // Não renderizar nada se não tiver itens
  if (itemCount === 0) {
    return null
  }

  return (
    <>
      {/* Indicador Lateral com Onda - ISOLADO - APENAS MOBILE */}
      <div 
        className="lg:hidden fixed right-0 top-0 h-full pointer-events-none z-40"
        style={{ width: 'auto' }}
      >
        {/* Eclipse - Altura TOTAL da Tela */}
        <div 
          onClick={onClick}
          className="cursor-pointer pointer-events-auto transition-all duration-300 hover:scale-105"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '112px',
            height: '100%',
            backgroundColor: category === 'freefire' ? '#f97316' : category === 'robux' ? '#1f2937' : '#3b82f6',
            clipPath: 'ellipse(45% 25% at 100% 50%)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            animation: 'slideInFromRight 0.4s ease-out'
          }}
        >
          
          {/* Conteúdo - ISOLADO com inline styles */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '16px 24px 15px 87px',
            zIndex: 10
          }}>
          {/* Ícone do Carrinho */}
          <div style={{ color: 'white' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          {/* Número */}
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            {itemCount > 9 ? '9+' : itemCount}
          </div>
          
          {/* Linha Divisória */}
          <div style={{ width: '16px', height: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '2px 0' }} />
          
          {/* Valor Total */}
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '8px', fontWeight: '500', opacity: 0.8 }}>Total</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
              R$ {totalPrice.toFixed(2).replace('.', ',')}
            </div>
          </div>
          </div>
        </div>

        {/* Efeito de Onda */}
        {showWave && (
          <>
            <div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r ${style.gradient} rounded-full opacity-60 animate-wave-1`}
            />
            <div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r ${style.gradient} rounded-full opacity-40 animate-wave-2`}
            />
            <div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r ${style.gradient} rounded-full opacity-20 animate-wave-3`}
            />
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes wave-1 {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: translate(-100%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        @keyframes wave-2 {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.4;
          }
          100% {
            transform: translate(-120%, -50%) scale(2.5);
            opacity: 0;
          }
        }
        
        @keyframes wave-3 {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.2;
          }
          100% {
            transform: translate(-140%, -50%) scale(3);
            opacity: 0;
          }
        }
        
        .animate-wave-1 {
          animation: wave-1 0.8s ease-out;
        }
        
        .animate-wave-2 {
          animation: wave-2 0.8s ease-out 0.1s;
        }
        
        .animate-wave-3 {
          animation: wave-3 0.8s ease-out 0.2s;
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-50%) scale(1);
          }
          50% {
            transform: translateY(-50%) scale(1.1);
          }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
        
        @keyframes slide-in-left {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.4s ease-out;
        }
      `}</style>
    </>
  )
}

"use client"

import { useState } from 'react'

export default function CompactSocialProof() {
  const [showAll, setShowAll] = useState(false)

  const reviews = [
    { name: "Daniel R.", text: "Entrega muito rápida, recomendo demais!" },
    { name: "Luan M.", text: "Tudo automático, prático e seguro." },
    { name: "Carla S.", text: "Melhor site que já usei, super confiável!" },
    { name: "Pedro H.", text: "Recebi em menos de 5 minutos!" }
  ]

  return (
    <div className="mb-2">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          {/* Linha única com avaliação */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-base">⭐</span>
              <span className="text-base font-bold text-gray-900">4.9</span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-sm text-gray-700 font-medium">+8.200 entregas confirmadas</span>
          </div>

          {/* 1 depoimento apenas */}
          {!showAll && (
            <div className="text-center mb-3">
              <p className="text-sm text-gray-700 italic">"{reviews[0].text}"</p>
              <p className="text-[10px] text-gray-500 mt-0.5">— {reviews[0].name}</p>
            </div>
          )}

          {/* Mini-ícones de confiança */}
          {!showAll && (
            <div className="flex items-center justify-center gap-3 text-[10px] font-semibold border-t border-gray-100 pt-2">
              <span className="text-green-600 flex items-center gap-1">
                ✔️ Pagamento Seguro
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-blue-600 flex items-center gap-1">
                ⚡ Entrega Automática
              </span>
            </div>
          )}

          {/* Depoimentos expandidos */}
          {showAll && (
            <div className="grid sm:grid-cols-2 gap-2 mb-2">
              {reviews.map((review, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-700 italic">"{review.text}"</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">— {review.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Botão ver mais */}
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] text-blue-600 font-semibold hover:underline mx-auto block"
          >
            {showAll ? 'Ver menos ↑' : 'Ver mais depoimentos →'}
          </button>
        </div>
      </div>
    </div>
  )
}

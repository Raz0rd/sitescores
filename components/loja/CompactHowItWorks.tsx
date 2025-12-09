"use client"

export default function CompactHowItWorks() {
  return (
    <div className="mb-3">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-center py-2">
          <div className="flex items-center gap-1">
            <span className="text-blue-600 font-bold text-sm">1️⃣</span>
            <span className="text-[10px] font-semibold text-gray-700">Escolha o pacote</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1">
            <span className="text-green-600 font-bold text-sm">2️⃣</span>
            <span className="text-[10px] font-semibold text-gray-700">Pague no Pix</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1">
            <span className="text-orange-600 font-bold text-sm">3️⃣</span>
            <span className="text-[10px] font-semibold text-gray-700">Receba em segundos</span>
          </div>
        </div>
      </div>
    </div>
  )
}

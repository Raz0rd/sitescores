"use client"

export default function CompactHeader() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100 py-4 mb-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Lado Esquerdo - Selos */}
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-green-200">
              <span className="text-green-600 text-lg">🛡️</span>
              <span className="text-xs font-semibold text-gray-700">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-blue-200">
              <span className="text-blue-600 text-lg">⚡</span>
              <span className="text-xs font-semibold text-gray-700">Entrega Automática</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg shadow-sm border border-yellow-200">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700 ml-1">4.9</span>
            </div>
          </div>

          {/* Lado Direito - CTA */}
          <a 
            href="#pacotes"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all transform hover:scale-105 text-sm whitespace-nowrap"
          >
            Escolher Pacote →
          </a>
        </div>
      </div>
    </div>
  )
}

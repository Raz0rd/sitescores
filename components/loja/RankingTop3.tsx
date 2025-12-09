"use client"

export default function RankingTop3() {
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long' })
  
  return (
    <div className="relative mx-auto max-w-5xl px-4 sm:px-[22px] md:px-8 py-6">
      <div className="text-center mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🏆 Ranking de Clientes VIP</h3>
        <p className="text-sm text-gray-700 font-semibold">Os que mais confiaram na Shipbux este mês</p>
        <p className="text-xs text-gray-500 mt-1">Compradores que mais movimentaram este mês</p>
      </div>
      
      <div className="flex justify-center items-end gap-2 sm:gap-4 mb-4">
        {/* 2º Lugar */}
        <div className="flex-1 max-w-[110px] sm:max-w-[130px] group">
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <span className="text-white font-bold text-base sm:text-lg">2</span>
            </div>
            
            <div className="pt-5 sm:pt-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate mb-1">Ju**pets</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-base sm:text-lg font-bold text-gray-700">R$</span>
                <span className="text-base sm:text-lg font-bold text-gray-700">1.456</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">em compras</p>
            </div>
          </div>
        </div>

        {/* 1º Lugar - Maior */}
        <div className="flex-1 max-w-[130px] sm:max-w-[150px] group">
          <div className="relative bg-white/90 backdrop-blur-sm border-2 border-orange-200 rounded-xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            
            <div className="pt-6 sm:pt-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center ring-2 ring-orange-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Selo VIP do Mês */}
              <div className="inline-block bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                ⭐ VIP do Mês
              </div>
              
              <p className="text-sm sm:text-base font-bold text-gray-900 truncate mb-1">Mago**Csx</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">R$</span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">1.733</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">em compras</p>
            </div>
          </div>
        </div>

        {/* 3º Lugar */}
        <div className="flex-1 max-w-[110px] sm:max-w-[130px] group">
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <span className="text-white font-bold text-base sm:text-lg">3</span>
            </div>
            
            <div className="pt-5 sm:pt-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate mb-1">KewF**x0</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-base sm:text-lg font-bold text-gray-700">R$</span>
                <span className="text-base sm:text-lg font-bold text-gray-700">1.289</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">em compras</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selo de Verificação */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 mt-3">
        <span className="flex items-center gap-1">
          ✔️ Atualizado automaticamente
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          ✔️ Baseado em compras reais
        </span>
      </div>
    </div>
  )
}

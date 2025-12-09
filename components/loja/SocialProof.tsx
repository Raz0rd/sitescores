"use client"

export default function SocialProof() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-lg font-bold text-gray-900">4.9/5</span>
        </div>
        <p className="text-sm text-gray-600 font-medium">
          Mais de <span className="font-bold text-blue-600">8.200 entregas</span> confirmadas
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              D
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 italic">"Entrega muito rápida, recomendo demais!"</p>
              <p className="text-xs text-gray-500 mt-1">— Daniel R.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              L
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 italic">"Tudo automático, prático e seguro."</p>
              <p className="text-xs text-gray-500 mt-1">— Luan M.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

export default function HowItWorks() {
  return (
    <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Como Funciona</h3>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl font-bold text-white">1</span>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Escolha seu pacote</h4>
          <p className="text-sm text-gray-600">Selecione o valor que deseja recarregar</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl font-bold text-white">2</span>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Pague via Pix</h4>
          <p className="text-sm text-gray-600">Pagamento rápido e seguro</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-2xl font-bold text-white">3</span>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Receba automaticamente</h4>
          <p className="text-sm text-gray-600">Entrega instantânea na sua conta</p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import LojaLayout from '@/components/loja/LojaLayout'
import RecargaBanner from '@/components/loja/RecargaBanner'
import { useCart } from '@/contexts/CartContext'

export default function RecargaCelularPage() {
  const router = useRouter()
  const cart = useCart()
  const [selectedOperadora, setSelectedOperadora] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedRechargeValue, setSelectedRechargeValue] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Recarga Celular - Todas as Operadoras'
  }, [])

  const operadoras = [
    { name: 'Vivo', logo: '/images/recargacelular/Logo_VIVO.svg.png' },
    { name: 'Claro', logo: '/images/recargacelular/Logo_de_Claro.svg' },
    { name: 'TIM', logo: '/images/recargacelular/TIM_logo_(2016-present).png' },
    { name: 'Oi', logo: '/images/recargacelular/Oi_logo_2022.png' }
  ]

  const handleProsseguir = () => {
    if (!phoneNumber || !selectedOperadora || !selectedRechargeValue) return

    const rechargeItem = [
      { value: '20', bonus: '+4GB GRÁTIS' },
      { value: '30', bonus: '+6GB GRÁTIS' },
      { value: '50', bonus: '+10GB GRÁTIS' },
      { value: '70', bonus: '+14GB GRÁTIS' },
      { value: '80', bonus: '+16GB GRÁTIS' },
      { value: '100', bonus: '+20GB GRÁTIS' }
    ].find(item => item.value === selectedRechargeValue)

    cart.addItem({
      id: `recarga-${selectedOperadora}-${selectedRechargeValue}`,
      name: `Recarga ${selectedOperadora} R$ ${selectedRechargeValue}`,
      image: operadoras.find(op => op.name === selectedOperadora)?.logo || '',
      price: parseFloat(selectedRechargeValue),
      category: 'recarga',
      details: {
        'Operadora': selectedOperadora,
        'Valor': `R$ ${selectedRechargeValue}`,
        'Bônus': rechargeItem?.bonus || '',
        'Telefone': phoneNumber
      }
    })
    router.push('/loja/checkout?category=recarga')
  }

  return (
    <LojaLayout customBanner={<RecargaBanner />}>
      <div className="max-w-5xl mx-auto p-4 py-8">
        {/* Banner de Bônus */}
        <div className="mb-6">
          <img 
            src="/images/recargacelular/banner em bonus.png" 
            alt="Banner de Bônus" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Logo das Operadoras */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/images/recargacelular/logoOperadoras.png" 
            alt="Operadoras Parceiras" 
            className="max-w-md w-full"
          />
        </div>

        <div className="max-w-md mx-auto">
          {/* Input de Telefone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Digite seu número:
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                  const formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                  setPhoneNumber(formatted);
                }
              }}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
            />
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm font-bold text-gray-900">ESCOLHA SUA RECARGA</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Seleção de Operadora */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Qual sua operadora?</h3>
            <div className="grid grid-cols-2 gap-3">
              {operadoras.map((operadora) => (
                <button
                  key={operadora.name}
                  onClick={() => setSelectedOperadora(operadora.name)}
                  className={`py-4 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    selectedOperadora === operadora.name
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <img 
                    src={operadora.logo} 
                    alt={operadora.name} 
                    className="h-8 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Valores de Recarga */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quanto quer recarregar?</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '20', bonus: '+4GB GRÁTIS', highlight: false },
                { value: '30', bonus: '+6GB GRÁTIS', highlight: true },
                { value: '50', bonus: '+10GB GRÁTIS', highlight: false },
                { value: '70', bonus: '+14GB GRÁTIS', highlight: false },
                { value: '80', bonus: '+16GB GRÁTIS', highlight: false },
                { value: '100', bonus: '+20GB GRÁTIS', highlight: false }
              ].map((item) => {
                const isSelected = selectedRechargeValue === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setSelectedRechargeValue(item.value)}
                    className={`relative py-4 px-6 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {item.highlight && (
                      <div className="absolute -top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        MAIS ESCOLHIDO
                      </div>
                    )}
                    <div className="text-xl font-bold text-gray-900">R$ {item.value}</div>
                    <div className="text-xs font-semibold text-green-600 mt-1">{item.bonus}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de Prosseguir */}
          <button 
            onClick={handleProsseguir}
            className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!phoneNumber || !selectedOperadora || !selectedRechargeValue}
          >
            PROSSEGUIR
          </button>
        </div>
      </div>
    </LojaLayout>
  )
}

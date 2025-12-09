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
  const [mounted, setMounted] = useState(false)
  
  // Gerar número aleatório apenas no cliente
  const recentRecharges = mounted ? Math.floor(35 + Math.random() * 40) : 48

  useEffect(() => {
    document.title = 'Recarga de Celular Online – Crédito Instantâneo + Bônus | Shipbux'
  }, [])
  
  // Detectar montagem no cliente
  useEffect(() => {
    setMounted(true)
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
      {/* 1️⃣ Bloco de Valor - Logo após o banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-4 mb-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Recarga na Hora</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Todas Operadoras</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Bônus Exclusivo</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto p-4 py-8">
        {/* Banner de Bônus */}
        <div className="mb-6">
          <img 
            src="/images/recargacelular/banner em bonus.png" 
            alt="Banner de Bônus" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        
        {/* 2️⃣ Título Otimizado */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ⭐ Ganhe até 10GB de bônus imediato na sua recarga digital!
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Recarga rápida, segura e creditada em segundos.
          </p>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Qual sua operadora?</h3>
            <p className="text-xs text-gray-500 mb-3">Escolha sua operadora — descontos e bônus exclusivos disponíveis.</p>
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
                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                        : item.highlight
                        ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${
                      item.highlight ? 'transform scale-105' : ''
                    }`}
                  >
                    {item.highlight && (
                      <div className="absolute -top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                        🔥 MAIS ESCOLHIDO
                      </div>
                    )}
                    <div className="text-xl font-bold text-gray-900">R$ {item.value}</div>
                    <div className="text-xs font-semibold text-green-600 mt-1">{item.bonus}</div>
                    <div className="text-[9px] text-gray-500 mt-1.5 space-y-0.5">
                      <div>✔ Bônus garantido</div>
                      <div>✔ Liberação instantânea</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* 3️⃣ Bloco de Prova Social */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-gray-800">
                ⭐ <strong>4.9</strong> de avaliação — mais de <strong>8.200 clientes</strong> satisfeitos
              </p>
              <p className="text-xs text-gray-600">
                ⚡ Crédito liberado em média em <strong>8 segundos</strong>
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                🔥 {recentRecharges} pessoas recarregaram nos últimos 20 minutos
              </p>
            </div>
          </div>

          {/* Botão de Prosseguir - Desktop */}
          <button 
            onClick={handleProsseguir}
            className="hidden sm:block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
            disabled={!phoneNumber || !selectedOperadora || !selectedRechargeValue}
          >
            PROSSEGUIR →
          </button>
        </div>
      </div>
      
      {/* 4️⃣ Botão Fixo - Mobile */}
      {phoneNumber && selectedOperadora && selectedRechargeValue && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <button 
            onClick={handleProsseguir}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-full font-bold text-lg transition-all shadow-2xl pointer-events-auto"
          >
            PROSSEGUIR →
          </button>
        </div>
      )}
    </LojaLayout>
  )
}

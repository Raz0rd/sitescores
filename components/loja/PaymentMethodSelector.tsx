"use client"

import { useState } from 'react'
import { CreditCard, QrCode, AlertCircle, X } from 'lucide-react'

interface PaymentMethodSelectorProps {
  onSelectMethod: (method: 'pix' | 'card') => void
  colors: any
}

export default function PaymentMethodSelector({ onSelectMethod, colors }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Escolha a forma de pagamento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PIX */}
        <button
          onClick={() => onSelectMethod('pix')}
          className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
        >
          <QrCode className="w-12 h-12 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">PIX</h3>
          <p className="text-sm text-gray-600 text-center">Pagamento instantâneo</p>
          <p className="text-xs text-green-600 mt-2 font-medium">Aprovação imediata</p>
        </button>

        {/* Cartão de Crédito */}
        <button
          onClick={() => onSelectMethod('card')}
          className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <CreditCard className="w-12 h-12 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Cartão de Crédito</h3>
          <p className="text-sm text-gray-600 text-center">Parcelamento disponível</p>
          <p className="text-xs text-blue-600 mt-2 font-medium">Em até 12x</p>
        </button>
      </div>
    </div>
  )
}

interface CardFormProps {
  onSubmit: (cardData: any) => Promise<void>
  onBack: () => void
  colors: any
  loading: boolean
  totalAmount: number
}

export function CardForm({ onSubmit, onBack, colors, loading, totalAmount }: CardFormProps) {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    cpf: '',
    email: ''
  })

  const [cardError, setCardError] = useState('')
  const [cardBrand, setCardBrand] = useState('')

  // Algoritmo de Luhn para validar número do cartão
  const validateCardNumber = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, '')
    
    if (digits.length < 13 || digits.length > 19) {
      return false
    }

    let sum = 0
    let isEven = false

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Identificar bandeira do cartão
  const getCardBrand = (cardNumber: string): string => {
    const digits = cardNumber.replace(/\D/g, '')
    
    if (/^4/.test(digits)) return 'Visa'
    if (/^5[1-5]/.test(digits)) return 'Mastercard'
    if (/^3[47]/.test(digits)) return 'Amex'
    if (/^6(?:011|5)/.test(digits)) return 'Discover'
    if (/^35/.test(digits)) return 'JCB'
    if (/^(?:2131|1800|30[0-5])/.test(digits)) return 'Diners'
    if (/^(?:5[06-9]|6[0-9])/.test(digits)) return 'Maestro'
    if (/^(?:506099|5067|509|636368)/.test(digits)) return 'Elo'
    if (/^(?:636297|637095|637568|637599|637609|637612)/.test(digits)) return 'Hipercard'
    
    return ''
  }

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const formatted = numbers.match(/.{1,4}/g)?.join(' ') || numbers
    return formatted.substring(0, 19) // 16 dígitos + 3 espaços
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value)
    setCardData({ ...cardData, cardNumber: formatted })
    
    const digits = value.replace(/\D/g, '')
    
    // Identificar bandeira
    if (digits.length >= 4) {
      const brand = getCardBrand(digits)
      setCardBrand(brand)
    } else {
      setCardBrand('')
    }
    
    // Validar quando tiver número completo
    if (digits.length >= 13) {
      if (validateCardNumber(digits)) {
        setCardError('')
      } else {
        setCardError('Número do cartão inválido')
      }
    } else {
      setCardError('')
    }
  }

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + '/' + numbers.substring(2, 4)
    }
    return numbers
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return value
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '')
    
    // Validar número do cartão com algoritmo de Luhn
    if (!validateCardNumber(cardNumberClean)) {
      alert('Número do cartão inválido')
      return
    }

    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      alert('Número do cartão deve ter entre 13 e 19 dígitos')
      return
    }

    if (!cardData.cardExpiry.match(/^\d{2}\/\d{2}$/)) {
      alert('Data de validade inválida (MM/AA)')
      return
    }

    // Validar se a data não está expirada
    const [month, year] = cardData.cardExpiry.split('/')
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
    const now = new Date()
    if (expiry < now) {
      alert('Cartão expirado')
      return
    }

    if (cardData.cardCvv.length < 3 || cardData.cardCvv.length > 4) {
      alert('CVV inválido (deve ter 3 ou 4 dígitos)')
      return
    }

    const cpfClean = cardData.cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      alert('CPF inválido')
      return
    }

    if (!cardData.email.includes('@')) {
      alert('Email inválido')
      return
    }

    if (!cardData.cardName || cardData.cardName.length < 3) {
      alert('Nome no cartão inválido')
      return
    }

    await onSubmit(cardData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Dados do Cartão</h2>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Número do Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Cartão
            {cardBrand && (
              <span className="ml-2 text-xs font-semibold text-blue-600">
                {cardBrand}
              </span>
            )}
          </label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
              cardError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {cardError && (
            <p className="text-xs text-red-600 mt-1">{cardError}</p>
          )}
          {cardBrand && !cardError && cardData.cardNumber.replace(/\D/g, '').length >= 13 && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cartão válido
            </p>
          )}
        </div>

        {/* Validade e CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Validade
            </label>
            <input
              type="text"
              value={cardData.cardExpiry}
              onChange={(e) => setCardData({ ...cardData, cardExpiry: formatExpiry(e.target.value) })}
              placeholder="MM/AA"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={cardData.cardCvv}
              onChange={(e) => {
                const maxLength = cardBrand === 'Amex' ? 4 : 3
                setCardData({ ...cardData, cardCvv: e.target.value.replace(/\D/g, '').substring(0, maxLength) })
              }}
              placeholder={cardBrand === 'Amex' ? '1234' : '123'}
              maxLength={cardBrand === 'Amex' ? 4 : 3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {cardBrand === 'Amex' ? '4 dígitos no verso' : '3 dígitos no verso'}
            </p>
          </div>
        </div>

        {/* Nome no Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome no Cartão
          </label>
          <input
            type="text"
            value={cardData.cardName}
            onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
            placeholder="NOME COMPLETO"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            required
          />
        </div>

        {/* CPF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF do Titular
          </label>
          <input
            type="text"
            value={cardData.cpf}
            onChange={(e) => setCardData({ ...cardData, cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={cardData.email}
            onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
            placeholder="seu@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Valor Total */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total a pagar:</span>
            <span className="text-2xl font-bold text-gray-900">
              R$ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botão de Pagamento */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processando...' : 'Pagar com Cartão'}
        </button>
      </form>

      {/* Selo de Segurança */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Pagamento 100% seguro e criptografado</span>
      </div>
    </div>
  )
}

interface CardErrorModalProps {
  onClose: () => void
  onSwitchToPix: () => void
  colors: any
}

export function CardErrorModal({ onClose, onSwitchToPix, colors }: CardErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Pagamento Recusado
          </h3>

          <p className="text-gray-600 mb-6">
            Não foi possível processar o pagamento com cartão de crédito. 
            Tente novamente ou utilize o PIX para pagamento instantâneo.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onSwitchToPix}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Pagar com PIX
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

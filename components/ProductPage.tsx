"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Star, Check, ArrowLeft } from 'lucide-react'
import { Product } from '@/lib/products-data'
import { useCart } from '@/hooks/useCart'

interface ProductPageProps {
  product: Product
}

export default function ProductPage({ product }: ProductPageProps) {
  const router = useRouter()
  const cart = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    cart.addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      quantity: quantity
    })
    
    // Redirecionar para o carrinho
    router.push('/loja/carrinho')
  }

  const handleBuyNow = () => {
    cart.addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      quantity: quantity
    })
    
    // Redirecionar direto para o checkout
    router.push('/loja/checkout')
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl p-8">
            {/* Imagem do Produto */}
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-96 object-contain"
              />
            </div>

            {/* Informações do Produto */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.popular && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      Mais Popular
                    </span>
                  )}
                  {product.special && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                      Oferta Especial
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      -{discount}% OFF
                    </span>
                  )}
                </div>

                {/* Título */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Descrição */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Bônus */}
                {product.bonus && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p className="text-blue-800 font-semibold">
                      🎁 {product.bonus}
                    </p>
                  </div>
                )}

                {/* Preço */}
                <div className="mb-6">
                  {product.originalPrice && (
                    <p className="text-gray-500 line-through text-lg mb-1">
                      De: R$ {product.originalPrice.toFixed(2)}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-green-600 font-semibold">
                        Economize R$ {(product.originalPrice - product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantidade */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantidade:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Garantias */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Entrega instantânea</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Suporte 24/7</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Comprar Agora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalhes do Produto</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Categoria</h3>
                <p className="text-gray-600 capitalize">{product.category}</p>
              </div>
              {product.metadata?.amount && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quantidade</h3>
                  <p className="text-gray-600">{product.metadata.amount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

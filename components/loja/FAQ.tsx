"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "📌 Como funciona a entrega automática?",
      answer: "Após a confirmação do pagamento via Pix, nosso sistema processa automaticamente seu pedido e envia os diamantes/itens diretamente para sua conta em segundos. Não é necessário aguardar atendimento manual!"
    },
    {
      question: "📌 Em quanto tempo recebo meus diamantes?",
      answer: "A entrega é instantânea! Assim que o pagamento Pix for confirmado (geralmente em 5 a 30 segundos), você receberá seus diamantes automaticamente na sua conta do jogo."
    },
    {
      question: "📌 O pagamento via Pix é seguro?",
      answer: "Sim! Utilizamos sistema de pagamento 100% seguro e criptografado. O Pix é o método mais rápido e seguro do Brasil. Seus dados estão protegidos e a transação é instantânea."
    }
  ]

  return (
    <div className="mb-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            ❓ Perguntas Frequentes
          </h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openIndex === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Ainda tem dúvidas? Entre em contato com nosso suporte 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

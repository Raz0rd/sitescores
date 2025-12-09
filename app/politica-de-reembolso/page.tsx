"use client"

import { useRouter } from 'next/navigation'

export default function PoliticaDeReembolso() {
  const router = useRouter()
  const companyName = process.env.NEXT_PUBLIC_COMPANY_TRADE_NAME
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL
  const companyCNPJ = process.env.NEXT_PUBLIC_COMPANY_CNPJ
  const companyLegalName = process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Reembolso</h1>
          <p className="text-sm text-slate-500 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <div className="space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Reembolso Antes da Entrega</h2>
              <p className="mb-2">Pedidos podem ser reembolsados <strong>enquanto não forem entregues</strong>.</p>
              <p>Para cancelar, entre em contato: <strong>{companyEmail}</strong></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Após a Entrega</h2>
              <p className="mb-2">Após a entrega, <strong>não é possível solicitar reembolso</strong> devido à natureza digital do produto.</p>
              <p>Produtos digitais são considerados consumidos imediatamente.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. ID Incorreto</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="font-semibold text-yellow-800 mb-1">⚠️ Verifique o ID antes de finalizar</p>
                <p className="text-sm text-yellow-700">Não nos responsabilizamos por créditos entregues em IDs incorretos.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Prazo de Reembolso</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>PIX:</strong> Até 24 horas</li>
                <li><strong>Cartão:</strong> Até 7 dias úteis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Como Solicitar</h2>
              <p className="mb-2">Envie email para <strong>{companyEmail}</strong> com:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Número do pedido</li>
                <li>Email da compra</li>
                <li>Motivo do reembolso</li>
              </ul>
            </section>

            <section className="bg-slate-50 rounded-lg p-4 mt-8">
              <h3 className="font-semibold text-slate-900 mb-2">Dados da Empresa</h3>
              <p className="text-sm mb-1"><strong>{companyLegalName}</strong></p>
              <p className="text-sm mb-1">CNPJ: {companyCNPJ}</p>
              <p className="text-sm">Email: {companyEmail}</p>
            </section>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm cursor-pointer">← Voltar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

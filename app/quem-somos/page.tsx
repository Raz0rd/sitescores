"use client"

import { useRouter } from 'next/navigation'

export default function QuemSomos() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Quem Somos</h1>
          
          <div className="space-y-6 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Nossa Missão</h2>
              <p className="mb-2">Somos uma <strong>plataforma independente</strong> especializada em diamantes e créditos digitais para Free Fire.</p>
              <p>Oferecemos preços acessíveis, entrega rápida e total segurança.</p>
            </section>

            <section>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="font-semibold text-blue-800 mb-1">🛡️ Segurança</p>
                <p className="text-sm text-blue-700">Nunca solicitamos senha ou dados confidenciais. Transações 100% seguras.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Independência</h2>
              <p><strong>Importante:</strong> Não somos afiliados à Garena ou Free Fire. Atuamos como plataforma independente.</p>
            </section>

            <section className="bg-slate-50 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Dados da Empresa</h2>
              <p className="text-sm mb-1"><strong>WANESSA DE NOVAES VASCO</strong></p>
              <p className="text-sm mb-1">CNPJ: 33.010.705/0001-49</p>
              <p className="text-sm mb-1">Email: contato@techhubz.sbs</p>
              <p className="text-sm mb-2"><strong>Localização:</strong></p>
              <p className="text-sm mb-1">Logradouro: Rua De Fora, 10</p>
              <p className="text-sm mb-1">Bairro: Santa Rita</p>
              <p className="text-sm mb-1">CEP: 57160-000</p>
              <p className="text-sm mb-1">Município: Marechal Deodoro</p>
              <p className="text-sm">Estado: Alagoas</p>
            </section>

            <section className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Entre em Contato</h3>
              <p className="text-sm mb-1">📧 <a href="mailto:contato@techhubz.sbs" className="text-blue-600 hover:underline">contato@techhubz.sbs</a></p>
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

"use client"

import ComplianceFooter from '@/components/ComplianceFooter'
import { companyConfig } from '@/lib/company-config'
import { useRouter } from 'next/navigation'

export default function PoliticaDePrivacidade() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Política de Privacidade</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 mb-4">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Informações que Coletamos</h2>
            <p className="text-slate-700 mb-4">
              Coletamos apenas informações necessárias para concluir a compra, como:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>E-mail para envio de confirmação e código (quando aplicável)</li>
              <li>ID do jogador para entrega dos créditos</li>
              <li>Nome para identificação do pedido</li>
            </ul>

            <div className="bg-red-50 border-l-4 border-red-600 p-4 my-6">
              <p className="text-red-800 font-bold">
                ⚠️ NÃO COLETAMOS:
              </p>
              <ul className="list-disc pl-6 text-red-700 mt-2 space-y-1">
                <li>Senha de jogos ou contas</li>
                <li>Login ou usuário</li>
                <li>Número de telefone</li>
                <li>Códigos de segurança ou verificação</li>
                <li>Informações confidenciais</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Como Usamos seus Dados</h2>
            <p className="text-slate-700 mb-4">
              Os dados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Processar pedidos</li>
              <li>Enviar atualizações sobre o pedido</li>
              <li>Contato com o cliente em caso de dúvidas</li>
              <li>Suporte técnico quando necessário</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Compartilhamento de Dados</h2>
            <p className="text-slate-700 mb-4">
              <strong>Não vendemos, compartilhamos ou transferimos dados a terceiros.</strong>
            </p>
            <p className="text-slate-700 mb-4">
              Seus dados são mantidos em segurança e utilizados apenas internamente para processamento de pedidos.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Segurança</h2>
            <p className="text-slate-700 mb-4">
              Utilizamos medidas de segurança para proteger suas informações:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Criptografia SSL/TLS em todas as transações</li>
              <li>Servidores seguros e protegidos</li>
              <li>Acesso restrito aos dados</li>
              <li>Monitoramento constante de segurança</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Cookies</h2>
            <p className="text-slate-700 mb-4">
              Utilizamos cookies apenas para:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Melhorar a experiência de navegação</li>
              <li>Manter preferências do usuário</li>
              <li>Análise de tráfego do site</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Seus Direitos</h2>
            <p className="text-slate-700 mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-slate-700 mb-4 space-y-2">
              <li>Solicitar acesso aos seus dados</li>
              <li>Solicitar correção de dados incorretos</li>
              <li>Solicitar exclusão dos seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Conformidade com LGPD</h2>
            <p className="text-slate-700 mb-4">
              Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Contato</h2>
            <div className="bg-slate-100 rounded-lg p-4 text-slate-700">
              <p className="mb-2"><strong>WANESSA DE NOVAES VASCO</strong></p>
              <p className="mb-1">CNPJ: 33.010.705/0001-49</p>
              <p className="mb-1">Email: contato@techhubz.sbs</p>
              <p className="mb-2"><strong>Localização:</strong></p>
              <p className="mb-1">Logradouro: Rua De Fora, 10</p>
              <p className="mb-1">Bairro: Santa Rita</p>
              <p className="mb-1">CEP: 57160-000</p>
              <p className="mb-1">Município: Marechal Deodoro</p>
              <p>Estado: Alagoas</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => router.back()}
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>

      <ComplianceFooter />
    </div>
  )
}

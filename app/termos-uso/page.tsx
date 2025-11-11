'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TermosUsoPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">📜 Termos de Uso</h1>
          <p className="text-gray-600 mt-2">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          
          {/* Disclaimer Importante */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-blue-900 font-bold text-lg mb-2">⚠️ Importante - Leia com Atenção</h3>
            <p className="text-blue-800 text-sm">
              Esta é uma plataforma de <strong>eventos promocionais independente</strong>. Não somos um jogo de azar, cassino ou plataforma de apostas. 
              Estamos em conformidade com as políticas do Google Ads e LGPD.
            </p>
          </div>

          {/* Seção 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Natureza do Evento</h2>
            <p className="text-gray-700 leading-relaxed">
              Somos uma plataforma de <strong>eventos promocionais</strong> que oferece cupons de desconto para recargas em jogos como Free Fire, Delta Force e outros. 
              <strong className="text-blue-600"> NÃO somos jogo de azar, cassino ou plataforma de apostas.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Nosso objetivo é conectar jogadores a promoções e descontos em plataformas de recarga de jogos mobile.
            </p>
          </section>

          {/* Seção 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Conformidade com Google Ads</h2>
            <p className="text-gray-700 leading-relaxed">
              Estamos em <strong>total conformidade</strong> com as políticas do Google Ads. Promovemos apenas eventos legítimos com cupons para plataformas de recarga de jogos mobile.
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>✅ Não promovemos jogos de azar</li>
              <li>✅ Não operamos cassinos online</li>
              <li>✅ Não facilitamos apostas</li>
              <li>✅ Apenas eventos promocionais legítimos</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Sem Vínculo com Desenvolvedoras</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-red-600">NÃO temos afiliação, parceria ou vínculo</strong> com Garena, Tencent ou qualquer desenvolvedora de jogos. 
              Somos uma plataforma independente de eventos promocionais.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Todas as marcas, logos e nomes de jogos mencionados são propriedade de seus respectivos donos. 
              Usamos essas referências apenas para indicar os jogos compatíveis com nossos cupons promocionais.
            </p>
          </section>

          {/* Seção 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Cupons e Promoções</h2>
            <p className="text-gray-700 leading-relaxed">
              Os cupons de desconto oferecidos em nossos eventos são:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Válidos apenas para primeira recarga no site</li>
              <li>Sujeitos a disponibilidade limitada</li>
              <li>Possuem prazo de validade específico (geralmente 15 minutos)</li>
              <li>Não são cumulativos com outras promoções</li>
              <li>Podem ter termos específicos por evento</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Responsabilidade do Usuário</h2>
            <p className="text-gray-700 leading-relaxed">
              Você é responsável por:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Fornecer informações corretas (ID do jogo)</li>
              <li>Usar os cupons dentro do prazo de validade</li>
              <li>Manter a segurança de suas credenciais de jogo</li>
              <li>Respeitar os termos de cada promoção</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Privacidade e Dados (LGPD)</h2>
            <p className="text-gray-700 leading-relaxed">
              Em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong>:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>✅ NÃO coletamos dados pessoais sensíveis</li>
              <li>✅ Apenas utilizamos ID do jogo para validação</li>
              <li>✅ Não solicitamos CPF, e-mail pessoal ou telefone</li>
              <li>✅ Cookies apenas técnicos (sessão)</li>
              <li>✅ Sem rastreamento publicitário</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              Para mais detalhes, consulte nossa <Link href="/politica-privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>.
            </p>
          </section>

          {/* Seção 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Transações e Pagamentos</h2>
            <p className="text-gray-700 leading-relaxed">
              Todas as transações são processadas por gateways de pagamento certificados e seguros. 
              Não armazenamos dados de cartão de crédito ou informações bancárias.
            </p>
          </section>

          {/* Seção 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 leading-relaxed">
              Não nos responsabilizamos por:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Problemas técnicos nos jogos ou servidores dos jogos</li>
              <li>Banimentos ou suspensões de contas de jogo</li>
              <li>Alterações nas políticas das desenvolvedoras</li>
              <li>Uso indevido dos cupons promocionais</li>
            </ul>
          </section>

          {/* Seção 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Alterações nos Termos</h2>
            <p className="text-gray-700 leading-relaxed">
              Estes termos podem ser atualizados periodicamente. Usuários serão notificados sobre mudanças importantes através do site.
              O uso continuado da plataforma após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* Seção 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Contato</h2>
            <p className="text-gray-700 leading-relaxed">
              Para dúvidas, sugestões ou suporte relacionado aos termos de uso, entre em contato através dos canais disponíveis no site.
            </p>
          </section>

          {/* Footer da página */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-gray-600 text-sm text-center">
              Ao utilizar esta plataforma, você concorda com estes Termos de Uso e nossa Política de Privacidade.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voltar ao Início
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/politica-privacidade" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Política de Privacidade
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

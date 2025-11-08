import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - Centro de Recarga Oficial | Free Fire, Delta Force, Haikyu',
  description: 'Termos de uso do centro oficial de recarga de jogos. Pacotes exclusivos para usuários verificados. Transações seguras e confiáveis.',
  keywords: [
    'termos de uso recarga',
    'politica site recarga',
    'termos free fire',
    'recarga oficial termos',
    'pacotes exclusivos jogos'
  ]
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 font-semibold">
              🎁 <strong>EXCLUSIVIDADE:</strong> Usuários verificados têm acesso a pacotes especiais e benefícios exclusivos!
            </p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao usar este site oficial de recargas, você concorda com todos os termos e condições aqui estabelecidos. 
                Este acordo é válido para todas as transações realizadas em nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Usuários Verificados</h2>
              <p>
                Este site é exclusivo para jogadores reais e verificados. É terminantemente proibido:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Uso de bots ou sistemas automatizados</li>
                <li>Criação de contas falsas</li>
                <li>Uso de IDs inválidos ou de terceiros</li>
                <li>Tentativas de fraude ou burla do sistema</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Pacotes Exclusivos</h2>
              <p>
                Usuários verificados têm direito a:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Descontos especiais em recargas</li>
                <li>Pacotes exclusivos</li>
                <li>Diamantes extras</li>
                <li>Suporte prioritário</li>
                <li>Acesso antecipado a novos pacotes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Transações Seguras</h2>
              <p>
                Garantimos 100% de segurança em todas as transações através de:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Sistemas criptografados de última geração</li>
                <li>Proteção de dados financeiros</li>
                <li>Monitoramento 24h contra fraudes</li>
                <li>Garantia de entrega dos produtos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Responsabilidades do Usuário</h2>
              <p>
                O usuário se compromete a:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Usar o site apenas para fins legítimos</li>
                <li>Não compartilhar dados de acesso</li>
                <li>Reportar problemas ou irregularidades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Suporte e Atendimento</h2>
              <p>
                Nossa equipe está disponível 24 horas para:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Esclarecer dúvidas sobre termos</li>
                <li>Resolver questões técnicas</li>
                <li>Processar reembolsos quando aplicável</li>
                <li>Oferecer suporte especializado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Modificações</h2>
              <p>
                Estes termos podem ser atualizados periodicamente. Usuários serão notificados sobre mudanças importantes 
                por email ou através de avisos no site.
              </p>
            </section>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-8">
            <p className="text-green-700">
              ✅ <strong>Site Oficial e Confiável:</strong> Somos um centro de recarga oficial com milhares de usuários satisfeitos. 
              Transações rápidas, seguras e com garantia de entrega.
            </p>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Voltar ao Site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

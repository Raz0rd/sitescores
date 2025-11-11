import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Loja Digital',
  description: 'Política de privacidade. Como protegemos seus dados pessoais.',
  keywords: [
    'privacidade',
    'proteção de dados',
    'lgpd',
    'segurança'
  ]
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidade</h1>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-blue-700 font-semibold">
              🔒 <strong>PRIVACIDADE GARANTIDA:</strong> Seus dados são protegidos pelos mais altos padrões de segurança.
            </p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Coleta de Dados</h2>
              <p className="mb-3">
                Coletamos apenas as informações estritamente necessárias para processar suas recargas:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>ID do Jogador:</strong> Para identificar sua conta no jogo</li>
                <li><strong>Dados de Pagamento:</strong> Para processar transações (criptografados)</li>
                <li><strong>Email:</strong> Para confirmações e suporte (opcional)</li>
                <li><strong>Dados Técnicos:</strong> IP, navegador (para segurança)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Uso das Informações</h2>
              <p className="mb-3">
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Processar recargas e transações</li>
                <li>Enviar confirmações de compra</li>
                <li>Oferecer suporte técnico</li>
                <li>Disponibilizar ofertas personalizadas</li>
                <li>Detectar e prevenir fraudes</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compartilhamento de Dados</h2>
              <p className="mb-3">
                <strong>NÃO compartilhamos</strong> seus dados pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Processadores de pagamento (dados criptografados)</li>
                <li>Provedores de jogos (apenas ID para entrega)</li>
                <li>Autoridades legais (quando exigido por lei)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies e Rastreamento</h2>
              <p className="mb-3">
                Utilizamos cookies para:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Melhorar sua experiência de navegação</li>
                <li>Lembrar suas preferências</li>
                <li>Analisar o tráfego do site (anonimamente)</li>
                <li>Oferecer conteúdo personalizado</li>
                <li>Garantir segurança nas transações</li>
              </ul>
              <p className="mt-2 text-sm">
                Você pode desabilitar cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Segurança dos Dados</h2>
              <p className="mb-3">
                Implementamos medidas rigorosas de segurança:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Criptografia SSL/TLS em todas as transmissões</li>
                <li>Servidores protegidos em data centers seguros</li>
                <li>Monitoramento 24h contra invasões</li>
                <li>Backups regulares e criptografados</li>
                <li>Acesso restrito aos dados</li>
                <li>Auditorias de segurança periódicas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seus Direitos (LGPD)</h2>
              <p className="mb-3">
                Você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Acessar:</strong> Solicitar cópia dos seus dados</li>
                <li><strong>Corrigir:</strong> Atualizar informações incorretas</li>
                <li><strong>Excluir:</strong> Solicitar remoção dos dados</li>
                <li><strong>Portabilidade:</strong> Receber dados em formato legível</li>
                <li><strong>Oposição:</strong> Contestar o uso dos dados</li>
                <li><strong>Limitação:</strong> Restringir o processamento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Retenção de Dados</h2>
              <p>
                Mantemos seus dados apenas pelo tempo necessário:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Dados de transação:</strong> 5 anos (obrigação legal)</li>
                <li><strong>Dados de suporte:</strong> 2 anos</li>
                <li><strong>Cookies:</strong> Conforme configuração</li>
                <li><strong>Dados de marketing:</strong> Até você cancelar</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Menores de Idade</h2>
              <p>
                Nossos serviços são destinados a usuários maiores de 18 anos. Menores de idade devem ter 
                autorização dos pais ou responsáveis para usar o site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Alterações na Política</h2>
              <p>
                Esta política pode ser atualizada periodicamente. Alterações significativas serão comunicadas 
                por email ou através de avisos destacados no site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contato</h2>
              <p>
                Para questões sobre privacidade, entre em contato:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Email:</strong> privacidade@seudominio.com</li>
                <li><strong>Chat:</strong> Disponível 24h no site</li>
                <li><strong>Tempo de resposta:</strong> Até 48 horas</li>
              </ul>
            </section>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-8">
            <p className="text-green-700">
              ✅ <strong>Compromisso com a Privacidade:</strong> Respeitamos sua privacidade e seguimos as melhores práticas 
              de proteção de dados, incluindo LGPD e regulamentações internacionais.
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

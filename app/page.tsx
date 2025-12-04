"use client"

import { ArrowRight, Shield, Zap, CreditCard, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleContinue = () => {
    window.location.href = './loja/freefire'
  }

  // Função para adicionar UTMs a qualquer URL interna
  const addUtmsToUrl = (url: string): string => {
    if (typeof window === 'undefined') return url
    
    const currentParams = new URLSearchParams(window.location.search)
    const urlObj = new URL(url, window.location.origin)
    
    // Adicionar todos os parâmetros atuais à nova URL
    currentParams.forEach((value, key) => {
      if (!urlObj.searchParams.has(key)) {
        urlObj.searchParams.set(key, value)
      }
    })
    
    return urlObj.pathname + urlObj.search
  }

  // Evitar hidratação: retornar URL simples no servidor
  if (!mounted) {
    return (
      <>
        {/* Navbar Fixo de Segurança */}
        <div className="fixed top-0 left-0 right-0 bg-blue-600 z-50 py-3 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-white">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-center">
              <strong>Plataforma Independente e Segura</strong> • Não solicitamos senha, login ou dados de acesso à sua conta
            </p>
          </div>
        </div>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pt-20">
          <div className="max-w-2xl w-full">
          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Diamantes Free Fire Baratos - Recarga Rápida e Segura
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Compre diamantes para Free Fire com os melhores preços do Brasil. Entrega imediata, pagamento via PIX e 100% seguro.
              </p>
            </div>

            {/* Benefícios */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Entrega Digital Rápida</h3>
                  <p className="text-sm text-slate-600">Receba seus créditos em minutos</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Preços Acessíveis</h3>
                  <p className="text-sm text-slate-600">Melhores ofertas do mercado</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Segurança e Confiança</h3>
                  <p className="text-sm text-slate-600">Transações 100% seguras</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Plataforma Independente</h3>
                  <p className="text-sm text-slate-600">Sem solicitar dados sensíveis</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Aviso de Segurança */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-900 text-center leading-relaxed">
                <Shield className="w-4 h-4 inline-block mr-1 mb-0.5" />
                <strong>Importante:</strong> Nunca solicitamos senha, login ou dados de acesso à sua conta.
              </p>
            </div>
          </div>

          {/* Footer com Links Legais */}
          <footer className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Este site é independente e não é afiliado, administrado ou patrocinado por qualquer desenvolvedora de jogos.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <a href="/termos" className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                  Termos de Uso
                </a>
                <span className="text-slate-300">•</span>
                <a href="/privacidade" className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                  Política de Privacidade
                </a>
                <span className="text-slate-300">•</span>
                <a href="/politica-de-reembolso" className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                  Política de Reembolso
                </a>
                <span className="text-slate-300">•</span>
                <a href="/quem-somos" className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                  Quem Somos
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                © 2025 - Todos os direitos reservados
              </p>
            </div>
          </footer>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      {/* Navbar Fixo de Segurança */}
      <div className="fixed top-0 left-0 right-0 bg-blue-600 z-50 py-3 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-white">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-center">
            <strong>Plataforma Independente e Segura</strong> • Não solicitamos senha, login ou dados de acesso à sua conta
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 pt-20">
        <div className="max-w-2xl w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Créditos Digitais Rápidos
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Compre itens e créditos digitais para seus jogos mobile com entrega imediata.
            </p>
          </div>

          {/* Benefícios */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Entrega Digital Rápida</h3>
                <p className="text-sm text-slate-600">Receba seus créditos em minutos</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Preços Acessíveis</h3>
                <p className="text-sm text-slate-600">Melhores ofertas do mercado</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Segurança e Confiança</h3>
                <p className="text-sm text-slate-600">Transações 100% seguras</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Plataforma Independente</h3>
                <p className="text-sm text-slate-600">Sem solicitar dados sensíveis</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Continuar
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Aviso de Segurança */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-900 text-center leading-relaxed">
              <Shield className="w-4 h-4 inline-block mr-1 mb-0.5" />
              <strong>Importante:</strong> Nunca solicitamos senha, login ou dados de acesso à sua conta.
            </p>
          </div>
        </div>

        {/* Footer com Links Legais */}
        <footer className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Este site é independente e não é afiliado, administrado ou patrocinado por qualquer desenvolvedora de jogos.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <a href={addUtmsToUrl('/termos')} className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                Termos de Uso
              </a>
              <span className="text-slate-300">•</span>
              <a href={addUtmsToUrl('/privacidade')} className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                Política de Privacidade
              </a>
              <span className="text-slate-300">•</span>
              <a href={addUtmsToUrl('/politica-de-reembolso')} className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                Política de Reembolso
              </a>
              <span className="text-slate-300">•</span>
              <a href={addUtmsToUrl('/quem-somos')} className="text-blue-600 hover:text-blue-700 hover:underline" suppressHydrationWarning>
                Quem Somos
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              © 2025 - Todos os direitos reservados
            </p>
          </div>
        </footer>
      </div>
    </div>
    </>
  )
}

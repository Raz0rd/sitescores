"use client"

export default function LojaFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center gap-3 p-6 text-center text-sm md:items-start">
          <div className="flex flex-col items-center gap-3 leading-none md:w-full md:flex-row md:justify-between">
            <div className="md:text-start font-medium text-gray-700">© 2025 {process.env.NEXT_PUBLIC_COMPANY_TRADE_NAME || 'Loja'}. Todos os direitos reservados.</div>
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <a href="/quem-somos" className="text-gray-600 transition-colors hover:text-gray-900 hover:underline">Quem Somos</a>
              <div className="h-3 w-px bg-gray-300"></div>
              <a href="/politica-de-reembolso" className="text-gray-600 transition-colors hover:text-gray-900 hover:underline">Reembolso</a>
              <div className="h-3 w-px bg-gray-300"></div>
              <a href="/politica-de-privacidade" className="text-gray-600 transition-colors hover:text-gray-900 hover:underline">Privacidade</a>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center md:text-left">
            Plataforma independente.
          </p>
        </div>
      </div>
    </footer>
  )
}

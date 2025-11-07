import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isBlockedBotIP } from '@/lib/bot-ips'

// Configuração do cloaker
const CLOAKER_CONFIG = {
  url: 'https://www.altercpa.one/fltr/969-8f076e082dbcb1d080037ec2c216d589-15444',
  whitePagePath: '/',  // Página principal agora é white page
  offerPagePath: '/quest'  // Página de oferta
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Analytics desabilitado para desenvolvimento
  // Registrar acesso no analytics (não-bloqueante)
  // if (!pathname.startsWith('/_next') && !pathname.startsWith('/api/s7k2m9p4') && pathname !== '/x9f2w8k5') {
  //   try {
  //     const userAgent = request.headers.get('user-agent') || ''
  //     const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  //     const referer = request.headers.get('referer') || ''
  //     const query = request.nextUrl.search
  //     
  //     // Fazer requisição assíncrona sem aguardar
  //     fetch(`${request.nextUrl.origin}/api/s7k2m9p4`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         path: pathname,
  //         userAgent,
  //         ip,
  //         referer,
  //         query,
  //         timestamp: Date.now()
  //       })
  //     }).catch(() => {}) // Ignorar erros silenciosamente
  //   } catch (error) {
  //     // Ignorar erros de analytics
  //   }
  // }
  
  // ============================================
  // 🔒 SISTEMA DE REFERER WHITELIST (Cloaker Interno)
  // ============================================
  
  // Verificar se está rodando em ambiente de desenvolvimento local
  const host = request.headers.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  // Em produção, NUNCA liberar localhost (previne bypass com curl)
  if (isLocalhost && process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // ============================================
  // 🔓 ACESSO LIVRE - SEM VERIFICAÇÕES
  // ============================================
  
  // Liberar acesso total - sem verificação de cookies, referer ou subdomain
  // Controle de acesso é feito no client-side via cookies
  return NextResponse.next()
}



// Configurar em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

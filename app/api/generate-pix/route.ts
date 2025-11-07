// Deploy automático configurado via GitHub Actions
import { NextRequest, NextResponse } from "next/server"
import { orderStorageService } from "@/lib/order-storage"
import { getConfig, getEnvVar } from "./config"

// Forçar Node.js runtime
export const runtime = 'nodejs'

// Função para obter o IP real do cliente
function getClientIp(req: NextRequest): string {
  const headers = [
    'cf-connecting-ip',        // Cloudflare
    'x-real-ip',              // Nginx
    'x-forwarded-for',        // Proxy padrão
    'x-client-ip',            // Apache
  ];
  
  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }
  
  return req.ip || 'unknown';
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Função para gerar PIX via GhostPay
async function generatePixGhostPay(body: any, baseUrl: string) {
  const secretKey = process.env.GHOSTPAY_API_KEY
  console.log("\n👻 [GhostPay] Verificando autenticação:", secretKey ? "✓ Token presente" : "✗ Token ausente")
  
  if (!secretKey) {
    console.error("❌ [GhostPay] GHOSTPAY_API_KEY não configurado")
    throw new Error("Configuração de API não encontrada")
  }

  console.log("📤 [GhostPay] REQUEST BODY:", JSON.stringify(body, null, 2))
  
  // Log dos parâmetros UTM recebidos
  console.log("🔗 [UTM PARAMS] Parâmetros recebidos para PIX:")
  console.log("📊 [UTM PARAMS] UTM Source:", body.utmParams?.utm_source || 'N/A')
  console.log("📊 [UTM PARAMS] Todos os UTMs:", JSON.stringify(body.utmParams || {}, null, 2))
  
  console.log("🌐 [GhostPay] URL dinâmica detectada:", baseUrl)

  // Gerar email fake baseado no nome do usuário
  const generateFakeEmail = (name: string): string => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    return `${cleanName}@gmail.com`
  }

  const ghostPayload = {
    amount: body.amount,
    paymentMethod: 'pix',
    customer: {
      name: body.customer.name,
      email: generateFakeEmail(body.customer.name),
      phone: body.customer.phone,
      document: {
        number: body.customer.document.number || body.customer.document,
        type: 'cpf'
      }
    },
    items: [
      {
        title: body.itemType === "recharge" ? "eBook eSport Digital Premium" : "eBook eSport Gold Edition",
        unitPrice: body.amount,
        quantity: 1,
        tangible: false
      }
    ]
  }
  
  // Criar auth Basic com base64
  const authString = Buffer.from(`${secretKey}:x`).toString('base64')
  
  console.log("📦 [GhostPay] PAYLOAD ENVIADO:", JSON.stringify(ghostPayload, null, 2))
  console.log("🎯 [GhostPay] URL:", "https://api.ghostspaysv2.com/functions/v1/transactions")
  console.log("🔑 [GhostPay] Auth Token:", authString.substring(0, 10) + "...")
  
  const response = await fetch("https://api.ghostspaysv2.com/functions/v1/transactions", {
    method: "POST",
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ghostPayload),
  })

  console.log("📡 [GhostPay] RESPONSE STATUS:", response.status)
  console.log("📊 [GhostPay] RESPONSE HEADERS:", Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ [GhostPay] ERROR RESPONSE:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    throw new Error(`Erro na API de pagamento: ${response.status}`)
  }

  const data = await response.json()
  console.log("✅ [GhostPay] SUCCESS RESPONSE:", JSON.stringify(data, null, 2))

  // Extrair informações importantes da resposta GhostPay
  const transactionId = data.id || data.transaction_id || data.transactionId
  const pixCode = data.pix?.qrcode || data.pixCode || data.pix_code || data.code
  const qrCodeImage = data.qrCode || data.qr_code || data.qr_code_url || data.pix?.qr_code_url
  
  console.log("🔍 [GhostPay] DADOS EXTRAÍDOS:", {
    transactionId,
    pixCode: pixCode ? `${pixCode.substring(0, 50)}...` : null,
    qrCodeImage: qrCodeImage ? "Presente" : "Ausente"
  })

  // Retornar apenas dados essenciais para o frontend (segurança)
  const normalizedResponse = {
    transactionId,
    pixCode,
    qrCode: qrCodeImage,
    success: true
  }
  console.log("🎉 [GhostPay] RESPOSTA NORMALIZADA (dados essenciais)")
  return normalizedResponse
}

// Função para gerar PIX via Ezzpag
async function generatePixEzzpag(body: any, baseUrl: string, presell?: string) {
  const authToken = process.env.EZZPAG_API_AUTH
  console.log("\n💳 [Ezzpag] Verificando autenticação:", authToken ? "✓ Token presente" : "✗ Token ausente")
  
  if (!authToken) {
    console.error("❌ [Ezzpag] EZZPAG_API_AUTH não configurado")
    throw new Error("Configuração de API Ezzpag não encontrada")
  }

  console.log("📤 [Ezzpag] REQUEST BODY:", JSON.stringify(body, null, 2))
  console.log("🌐 [Ezzpag] URL dinâmica detectada:", baseUrl)

  // Gerar email fake baseado no nome do usuário
  const generateFakeEmail = (name: string): string => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    return `${cleanName}@icloud.com`
  }

  // Limpar telefone (somente números)
  const cleanPhone = (phone: string): string => {
    return phone.replace(/\D/g, '')
  }

  // Endereços para uso aleatório
  const ADDRESSES = [
  { cep: "12510516", cidade: "Guaratinguetá", estado: "SP", bairro: "Bosque dos Ipês", rua: "Rua Fábio Rangel Dinamarco" },
  { cep: "58400295", cidade: "Campina Grande", estado: "PB", bairro: "Centro", rua: "Rua Frei Caneca" },
  { cep: "66025660", cidade: "Belém", estado: "PA", bairro: "Jurunas", rua: "Rua dos Mundurucus" },
  { cep: "29161376", cidade: "Serra", estado: "ES", bairro: "Novo Horizonte", rua: "Rua dos Ipês" },
  { cep: "88302350", cidade: "Itajaí", estado: "SC", bairro: "Centro", rua: "Rua Alberto Werner" },
  { cep: "38411140", cidade: "Uberlândia", estado: "MG", bairro: "Luizote de Freitas", rua: "Rua Rio Corumbá" },
  { cep: "69020470", cidade: "Manaus", estado: "AM", bairro: "Centro", rua: "Rua Ferreira Pena" },
  { cep: "57020570", cidade: "Maceió", estado: "AL", bairro: "Centro", rua: "Rua do Imperador" },
  { cep: "11704000", cidade: "Praia Grande", estado: "SP", bairro: "Ocian", rua: "Avenida Presidente Kennedy" },
  { cep: "64001210", cidade: "Teresina", estado: "PI", bairro: "Centro", rua: "Rua Areolino de Abreu" },
  { cep: "40015120", cidade: "Salvador", estado: "BA", bairro: "Comércio", rua: "Rua Portugal" },
  { cep: "50710160", cidade: "Recife", estado: "PE", bairro: "Madalena", rua: "Rua Real da Torre" },
  { cep: "74055010", cidade: "Goiânia", estado: "GO", bairro: "Setor Central", rua: "Rua 4" },
  { cep: "79002140", cidade: "Campo Grande", estado: "MS", bairro: "Centro", rua: "Rua 14 de Julho" },
  { cep: "87020025", cidade: "Maringá", estado: "PR", bairro: "Zona 01", rua: "Avenida Herval" },
  { cep: "69083350", cidade: "Manaus", estado: "AM", bairro: "Coroado", rua: "Rua do Sol" },
  { cep: "96010600", cidade: "Pelotas", estado: "RS", bairro: "Centro", rua: "Rua XV de Novembro" },
  { cep: "76820394", cidade: "Porto Velho", estado: "RO", bairro: "Centro", rua: "Rua José de Alencar" },
  { cep: "69304520", cidade: "Boa Vista", estado: "RR", bairro: "Mecejana", rua: "Rua General Penha Brasil" },
  { cep: "64018520", cidade: "Teresina", estado: "PI", bairro: "Piçarra", rua: "Rua Desembargador Pires de Castro" },
  { cep: "89010025", cidade: "Blumenau", estado: "SC", bairro: "Centro", rua: "Rua XV de Novembro" },
  { cep: "76870466", cidade: "Ariquemes", estado: "RO", bairro: "Setor 04", rua: "Rua Jamari" },
  { cep: "69900120", cidade: "Rio Branco", estado: "AC", bairro: "Centro", rua: "Rua Marechal Deodoro" },
  { cep: "72030015", cidade: "Brasília", estado: "DF", bairro: "Taguatinga Centro", rua: "C 1" },
  { cep: "15025020", cidade: "São José do Rio Preto", estado: "SP", bairro: "Centro", rua: "Rua Voluntários de São Paulo" },
  { cep: "79002240", cidade: "Campo Grande", estado: "MS", bairro: "Centro", rua: "Rua Dom Aquino" },
  { cep: "69918732", cidade: "Rio Branco", estado: "AC", bairro: "Village Tiradentes", rua: "Rua da Paz" },
  { cep: "59015300", cidade: "Natal", estado: "RN", bairro: "Cidade Alta", rua: "Rua João Pessoa" },
  { cep: "65010250", cidade: "São Luís", estado: "MA", bairro: "Centro", rua: "Rua Grande" },
  { cep: "87050210", cidade: "Maringá", estado: "PR", bairro: "Jardim Novo Horizonte", rua: "Rua das Tulipas" }
]

  
  const randomAddress = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)]
  
  // Gerar número de rua aleatório entre 12 e 999
  const randomStreetNumber = Math.floor(Math.random() * (999 - 12 + 1)) + 12

  const ezzpagPayload = {
    customer: {
      document: {
        number: body.customer.document.number || body.customer.document,
        type: 'cpf'
      },
      name: body.customer.name,
      email: body.customer.email || generateFakeEmail(body.customer.name),
      phone: cleanPhone(body.customer.phone)
    },
    shipping: {
      address: {
        street: randomAddress.rua,
        streetNumber: randomStreetNumber.toString(),
        zipCode: randomAddress.cep,
        neighborhood: randomAddress.bairro,
        city: randomAddress.cidade,
        state: randomAddress.estado,
        country: 'BR'
      },
      fee: 0
    },
    items: [{
      tangible: false,
      title: body.itemType === "recharge" ? "Gmeports Premium" : "Gmeports",
      unitPrice: body.amount,
      quantity: 1
    }],
    amount: body.amount,
    paymentMethod: 'pix'
  }
  
  console.log("📤 [Ezzpag] Criando transação PIX...")
  
  const response = await fetch("https://api.ezzypag.com.br/v1/transactions", {
    method: "POST",
    headers: {
      'Authorization': `Basic ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(ezzpagPayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData: any = {}
    
    try {
      errorData = JSON.parse(errorText)
    } catch (e) {
      errorData = { message: errorText }
    }
    
    console.error("❌ [Ezzpag] ERROR:", response.status, errorData.message || errorText)
    
    // Extrair mensagem de erro específica da Ezzpag
    let userMessage = 'Erro ao processar pagamento. Tente novamente.'
    const ezzpagError = errorData.message || errorText
    
    // Verificar erros específicos da Ezzpag (422 retorna array de erros)
    if (response.status === 422) {
      if (ezzpagError.includes('customer.email is invalid')) {
        userMessage = 'customer.email is invalid'
      } else if (ezzpagError.includes('customer.phone is invalid')) {
        userMessage = 'customer.phone is invalid'
      } else if (ezzpagError.includes('customer.document is invalid')) {
        userMessage = 'customer.document is invalid'
      } else if (ezzpagError.includes('customer.name is invalid')) {
        userMessage = 'customer.name is invalid'
      } else {
        userMessage = 'Dados incompletos ou inválidos. Verifique as informações.'
      }
    } else if (response.status === 400) {
      if (ezzpagError.toLowerCase().includes('cpf')) {
        userMessage = 'CPF inválido. Por favor, verifique os dados e tente novamente.'
      } else if (ezzpagError.toLowerCase().includes('phone')) {
        userMessage = 'customer.phone is invalid'
      } else if (ezzpagError.toLowerCase().includes('email')) {
        userMessage = 'customer.email is invalid'
      } else {
        userMessage = 'Dados inválidos. Por favor, verifique as informações.'
      }
    } else if (response.status === 401 || response.status === 403) {
      userMessage = 'Erro de autenticação. Entre em contato com o suporte.'
    } else if (response.status >= 500) {
      userMessage = 'Serviço temporariamente indisponível. Tente novamente em instantes.'
    }
    
    throw new Error(userMessage)
  }

  const data = await response.json()

  // Extrair informações da resposta Ezzpag
  const transactionId = data.id?.toString()
  const pixCode = data.pix?.qrcode
  
  console.log("✅ [Ezzpag] PIX criado com sucesso!")
  console.log(`   - Transaction ID: ${transactionId}`)
  console.log(`   - Valor: R$ ${(data.amount / 100).toFixed(2)}`)
  console.log(`   - Status: ${data.status}`)
  console.log(`   - Cliente: ${data.customer?.name}`)
  console.log(`   - Presell: ${presell || 'Direto'}`)
  console.log(`   - URL Origem: ${body.baseUrl || 'N/A'}`)

  // Retornar apenas dados essenciais para o frontend (segurança)
  return {
    transactionId,
    pixCode,
    qrCode: pixCode,
    success: true
  }
}

// Função para gerar PIX via Nitro Pagamentos
async function generatePixNitro(body: any, baseUrl: string) {
  const apiKey = process.env.NITRO_API_KEY
  console.log("\n⚡ [Nitro] Verificando autenticação:", apiKey ? "✓ Token presente" : "✗ Token ausente")
  
  if (!apiKey) {
    console.error("❌ [Nitro] NITRO_API_KEY não configurado")
    throw new Error("Configuração de API Nitro não encontrada")
  }

  console.log("📤 [Nitro] REQUEST BODY:", JSON.stringify(body, null, 2))
  console.log("🌐 [Nitro] URL dinâmica detectada:", baseUrl)

  // Extrair hostname para offer_hash
  const hostname = baseUrl.split('//')[1]?.split(':')[0] || 'localhost'
  const offerHash = hostname.split('.')[0].toUpperCase()
  
  // Extrair apenas o nome do domínio (sem www e extensão)
  // Exemplos: www.algo.com.br → algo, www.algo2.shop → algo2
  const domainParts = hostname.replace('www.', '').split('.')
  const domainName = domainParts[0]

  const nitroPayload = {
    amount: body.amount,
    offer_hash: offerHash,
    payment_method: "pix",
    customer: {
      name: body.customer.name,
      email: body.customer.email || `${body.customer.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone_number: body.customer.phone,
      document: body.customer.document.number || body.customer.document,
      street_name: "Nome da Rua",
      number: "sn",
      complement: "Lt19 Qd 134",
      neighborhood: "Centro",
      city: "Itaguaí",
      state: "RJ",
      zip_code: "23822180"
    },
    cart: [
      {
        product_hash: offerHash,
        title: offerHash,
        cover: null,
        price: body.amount,
        quantity: body.quantity || 1,
        operation_type: 1,
        tangible: false
      }
    ],
    installments: 12,
    expire_in_days: 1,
    postback_url: domainName
  }
  
  console.log("📦 [Nitro] PAYLOAD ENVIADO:", JSON.stringify(nitroPayload, null, 2))
  console.log("🎯 [Nitro] URL:", `https://api.nitropagamentos.com/api/public/v1/transactions?api_token=${apiKey}`)
  
  const response = await fetch(`https://api.nitropagamentos.com/api/public/v1/transactions?api_token=${apiKey}`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(nitroPayload),
  })

  console.log("📡 [Nitro] RESPONSE STATUS:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ [Nitro] ERROR RESPONSE:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    
    throw new Error(`Erro na API Nitro: ${response.status}`)
  }

  const data = await response.json()
  console.log("✅ [Nitro] SUCCESS RESPONSE:", JSON.stringify(data, null, 2))

  // Extrair informações da resposta Nitro
  const transactionId = data.hash || data.id
  const pixCode = data.pix?.pix_qr_code
  
  // Gerar QR Code base64
  const QRCode = require('qrcode')
  const qrCodeBase64 = await QRCode.toDataURL(pixCode, { errorCorrectionLevel: 'H' })
  
  console.log("🔍 [Nitro] DADOS EXTRAÍDOS:", {
    transactionId,
    pixCode: pixCode ? `${pixCode.substring(0, 50)}...` : null,
    hasQrCode: !!qrCodeBase64
  })

  // Retornar dados essenciais para o frontend + created_at e updated_at
  return {
    transactionId,
    pixCode,
    qrCode: qrCodeBase64,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    success: true
  }
}

// Função para gerar PIX via Umbrela
async function generatePixUmbrela(body: any, baseUrl: string) {
  const config = getConfig()
  const apiKey = config.umbrelaApiKey
  console.log("\n☂️ [Umbrela] Verificando autenticação:", apiKey ? "✓ Token presente" : "✗ Token ausente")
  console.log("🔧 [Umbrela] Config debug:", {
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    paymentGateway: config.paymentGateway,
    isNetlify: config.isNetlify,
    isProduction: config.isProduction
  })
  
  if (!apiKey) {
    console.error("❌ [Umbrela] UMBRELA_API_KEY não configurado")
    console.error("❌ [Umbrela] Env vars debug:", {
      processEnvKeys: Object.keys(process.env).length,
      hasProcessEnv: typeof process !== 'undefined',
      umbrelaDirect: process.env.UMBRELA_API_KEY ? 'present' : 'missing'
    })
    throw new Error("UMBRELA_API_KEY não configurado no servidor")
  }

  console.log("📤 [Umbrela] REQUEST BODY:", JSON.stringify(body, null, 2))
  console.log("🌐 [Umbrela] URL dinâmica detectada:", baseUrl)

  // Gerar email fake baseado no nome do usuário
  const generateFakeEmail = (name: string): string => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    return `${cleanName}@gmail.com`
  }

  // Gerar nome de produto IPTV variado
  const generateIptvProductName = (itemType: string, amount: number): string => {
    const variants = [200, 250, 300, 350, 400, 500, 600]
    const randomVariant = variants[Math.floor(Math.random() * variants.length)]
    
    if (itemType === "recharge") {
      return `IPTV Assinatura Premium ${randomVariant}new`
    } else {
      return `IPTV Gold Premium ${randomVariant}new`
    }
  }

  // Endereços para uso aleatório
  const ADDRESSES = [
    { cep: "12510516", cidade: "Guaratinguetá", estado: "SP", bairro: "Bosque dos Ipês", rua: "Rua Fábio Rangel Dinamarco" },
    { cep: "58400295", cidade: "Campina Grande", estado: "PB", bairro: "Centro", rua: "Rua Frei Caneca" },
    { cep: "66025660", cidade: "Belém", estado: "PA", bairro: "Jurunas", rua: "Rua dos Mundurucus" },
    { cep: "37206660", cidade: "Lavras", estado: "MG", bairro: "Jardim Floresta", rua: "Rua Tenente Fulgêncio" },
    { cep: "13150148", cidade: "Cosmópolis", estado: "SP", bairro: "Jardim Bela Vista", rua: "Rua Eurides de Godoi" },
    { cep: "89560190", cidade: "Videira", estado: "SC", bairro: "Centro", rua: "Rua Padre Anchieta" },
    { cep: "60331200", cidade: "Fortaleza", estado: "CE", bairro: "Barra do Ceará", rua: "Avenida Vinte de Janeiro" },
    { cep: "71065330", cidade: "Brasília", estado: "DF", bairro: "Guará II", rua: "Quadra QI 33" },
    { cep: "61932130", cidade: "Maracanaú", estado: "CE", bairro: "Pajuçara", rua: "Rua Senador Petrônio Portela" },
    { cep: "60331240", cidade: "Fortaleza", estado: "CE", bairro: "Barra do Ceará", rua: "Rua Estevão de Campos" },
    { cep: "29125036", cidade: "Vila Velha", estado: "ES", bairro: "Barra do Jucu", rua: "Rua das Andorinhas" },
    { cep: "85863000", cidade: "Foz do Iguaçu", estado: "PR", bairro: "Centro Cívico", rua: "Avenida Costa e Silva" },
    { cep: "35162087", cidade: "Ipatinga", estado: "MG", bairro: "Iguaçu", rua: "Rua Magnetita" }
  ]
  
  // Selecionar endereço aleatório
  const randomAddress = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)]
  
  // Endereço padrão (obrigatório para Umbrela)
  const defaultAddress = {
    street: randomAddress.rua || "Rua Digital",
    streetNumber: "123",
    complement: "",
    zipCode: randomAddress.cep || "01000000",
    neighborhood: randomAddress.bairro || "Centro",
    city: randomAddress.cidade || "São Paulo",
    state: randomAddress.estado || "SP",
    country: "br"
  }

  // Preparar metadata com dados do usuário para verificação
  const customerCPF = body.customer.document.number || body.customer.document
  const customerEmail = body.customer.email || generateFakeEmail(body.customer.name)
  const metadataObject = {
    usuario: {
      nome: body.customer.name,
      cpf: customerCPF,
      email: customerEmail,
      telefone: body.customer.phone,
      endereco: `${randomAddress.rua}, 123 - ${randomAddress.bairro}, ${randomAddress.cidade}/${randomAddress.estado} - CEP: ${randomAddress.cep}`
    },
    pedido: {
      valor_centavos: body.amount,
      valor_reais: (body.amount / 100).toFixed(2)
    }
  }
  
  console.log("📋 [Umbrela] METADATA ENVIADO:", JSON.stringify(metadataObject, null, 2))
  
  const metadata = JSON.stringify(metadataObject)

  const umbrelaPayload = {
    amount: body.amount,
    currency: "BRL",
    paymentMethod: "PIX",
    customer: {
      name: body.customer.name,
      email: customerEmail,
      document: {
        number: customerCPF,
        type: "CPF"
      },
      phone: body.customer.phone,
      externalRef: "",
      address: defaultAddress
    },
    shipping: {
      fee: 0,
      address: defaultAddress
    },
    items: [{
      title: generateIptvProductName(body.itemType, body.amount),
      unitPrice: body.amount,
      quantity: 1,
      tangible: false,
      externalRef: ""
    }],
    pix: {
      expiresInDays: 1
    },
    postbackUrl: `${baseUrl}/api/webhook`,
    metadata: metadata,
    traceable: true,
    ip: "0.0.0.0"
  }
  
  console.log("📦 [Umbrela] PAYLOAD ENVIADO:", JSON.stringify(umbrelaPayload, null, 2))
  console.log("🎯 [Umbrela] URL:", "https://api-gateway.umbrellapag.com/api/user/transactions")
  console.log("🔑 [Umbrela] API Key:", apiKey.substring(0, 10) + "...")
  
  // Salvar debug em storage para Netlify
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl,
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    payloadSize: JSON.stringify(umbrelaPayload).length
  }
  
  try {
    const response = await fetch("https://api-gateway.umbrellapag.com/api/user/transactions", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "User-Agent": "UMBRELLAB2B/1.0",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(umbrelaPayload),
    })

    console.log("📡 [Umbrela] RESPONSE STATUS:", response.status)
    console.log("📊 [Umbrela] RESPONSE HEADERS:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [Umbrela] ERROR RESPONSE:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      // Retornar erro estruturado para debug no Netlify
      return NextResponse.json({ 
        error: "Erro na API Umbrela",
        debug: {
          ...debugInfo,
          responseStatus: response.status,
          responseBody: errorText,
          apiUrl: "https://api-gateway.umbrellapag.com/api/user/transactions"
        }
      }, { status: 500 })
    }

    const data = await response.json()
    console.log("✅ [Umbrela] SUCCESS RESPONSE:", JSON.stringify(data, null, 2))

    // Extrair informações da resposta Umbrela
    const transactionId = data.data?.id
    const pixCode = data.data?.qrCode
    const qrCodeImage = data.data?.qrCode // Umbrela retorna QR Code direto no texto
    
    console.log("🔍 [Umbrela] DADOS EXTRAÍDOS:", {
      transactionId,
      pixCode: pixCode ? `${pixCode.substring(0, 50)}...` : null,
      status: data.data?.status
    })
    
    // Retornar apenas dados essenciais para o frontend (segurança)
    const normalizedResponse = {
      transactionId,
      pixCode,
      qrCode: qrCodeImage,
      success: true
    }
    
    console.log("🎉 [Umbrela] RESPOSTA NORMALIZADA (dados essenciais)")
    return normalizedResponse
    
  } catch (networkError) {
    console.error("❌ [Umbrela] NETWORK ERROR:", networkError)
    
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = getConfig()
    const gateway = config.paymentGateway
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🚀 [GATEWAY] Iniciando geração de PIX")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🎯 [GATEWAY] Gateway selecionado:", gateway)
    
    // Debug de variáveis de ambiente
    console.log("🔑 [ENV] PAYMENT_GATEWAY:", config.paymentGateway)
    console.log("🔑 [ENV] UMBRELA_API_KEY:", config.umbrelaApiKey ? "✓ Presente" : "❌ Ausente")
    console.log("🔑 [ENV] EZZPAG_API_AUTH:", process.env.EZZPAG_API_AUTH ? "✓ Presente" : "❌ Ausente")
    console.log("🔑 [ENV] NODE_ENV:", getEnvVar('NODE_ENV'))
    console.log("🔧 [CONFIG] Debug completo:", {
      isNetlify: config.isNetlify,
      isProduction: config.isProduction,
      hasUmbrelaKey: !!config.umbrelaApiKey,
      hasEzzpagKey: !!process.env.EZZPAG_API_AUTH
    })
    
    const body = await request.json()
    
    // Obter URL atual dinamicamente
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
    const baseUrl = `${protocol}://${host}`
    
    // Obter presell do cookie _ref_origin
    const refOriginCookie = request.cookies.get('_ref_origin')?.value
    let presell = 'Direto'
    if (refOriginCookie) {
      try {
        presell = Buffer.from(refOriginCookie, 'base64').toString('utf-8')
      } catch (e) {
        presell = 'Direto'
      }
    }
    
    // Debug detalhado da URL
    console.log("🌐 [URL DEBUG] Headers recebidos:", {
      host: request.headers.get('host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      protocol,
      baseUrl
    })
    
    // Chamar gateway apropriado
    let result: any
    
    if (gateway === 'nitro') {
      result = await generatePixNitro(body, baseUrl)
    } else if (gateway === 'ghostpay') {
      result = await generatePixGhostPay(body, baseUrl)
    } else if (gateway === 'umbrela') {
      result = await generatePixUmbrela(body, baseUrl)
    } else {
      // Padrão: Ezzpag
      result = await generatePixEzzpag(body, baseUrl, presell)
    }
    
    // Validar resposta do gateway
    if (!result || !result.transactionId) {
      throw new Error("Resposta inválida do gateway de pagamento")
    }
    
    // Type assertion após validação
    const validResult = result as { transactionId: string; pixCode: string; qrCode: string; success: boolean }
    
    console.log("💾 [STORAGE] Salvando pedido no order storage...")
    console.log("🔍 [STORAGE DEBUG] Body completo:", JSON.stringify(body, null, 2))
    console.log("🔍 [STORAGE DEBUG] trackingParams:", body.trackingParams)
    console.log("🔍 [STORAGE DEBUG] utmParams:", body.utmParams)
    
    try {
      
      let trackingParameters: any = {}
      if (body.trackingParams) {
        if (typeof body.trackingParams === 'string') {
          try {
            trackingParameters = JSON.parse(body.trackingParams)
            console.log("✅ [STORAGE] trackingParams parseado de string para objeto")
          } catch (e) {
            console.error("❌ [STORAGE] Erro ao parsear trackingParams:", e)
            trackingParameters = {}
          }
        } else {
          // Extrair apenas propriedades UTM válidas (ignorar índices numéricos)
          const params = body.trackingParams
          trackingParameters = {
            utm_source: params.utm_source || null,
            utm_medium: params.utm_medium || null,
            utm_campaign: params.utm_campaign || null,
            utm_content: params.utm_content || null,
            utm_term: params.utm_term || null,
            gclid: params.gclid || null,
            gbraid: params.gbraid || null,
            wbraid: params.wbraid || null,
            fbclid: params.fbclid || null,
            keyword: params.keyword || null,
            device: params.device || null,
            network: params.network || null,
            gad_source: params.gad_source || null,
            timestamp: params.timestamp || new Date().toISOString(),
            current_page: params.current_page || 'checkout'
          }
          console.log("✅ [STORAGE] trackingParams extraídos (apenas UTMs válidos):", trackingParameters)
        }
      } else if (body.utmParams) {
        trackingParameters = body.utmParams
      }
      
      const orderData = {
        orderId: validResult.transactionId,
        transactionId: validResult.transactionId,
        amount: body.amount,
        customerData: {
          name: body.customer?.name || '',
          email: body.customer?.email || '',
          phone: body.customer?.phone || '',
          document: body.customer?.document?.number || ''
        },
        trackingParameters,
        createdAt: new Date().toISOString(),
        status: 'pending' as const
      }
      
      console.log("💾 [STORAGE] Salvando pedido no orderStorage...")
      console.log("💾 [STORAGE] Transaction ID:", validResult.transactionId)
      console.log("💾 [STORAGE] Dados completos:", JSON.stringify(orderData, null, 2))
      
      orderStorageService.saveOrder(orderData)
      
      // Verificar se foi salvo corretamente
      const savedOrder = orderStorageService.getOrder(validResult.transactionId)
      if (savedOrder) {
        console.log("✅ [STORAGE] Pedido salvo e VERIFICADO com sucesso!")
        console.log("✅ [STORAGE] Confirmação - ID encontrado:", savedOrder.transactionId)
      } else {
        console.error("❌ [STORAGE] ERRO: Pedido NÃO foi salvo corretamente!")
      }
    } catch (storageError) {
      console.error("❌ [STORAGE] Erro ao salvar:", storageError)
    }
    return NextResponse.json(validResult)
  } catch (error) {
    console.error("💥 [GATEWAY] ERRO:", error instanceof Error ? error.message : 'Unknown error')
    
    // Retornar mensagem amigável para o usuário
    const userMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento. Tente novamente.'
    
    return NextResponse.json({ 
      error: userMessage,
      success: false 
    }, { status: 500 })
  }
}

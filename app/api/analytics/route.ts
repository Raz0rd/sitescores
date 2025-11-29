import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Forçar rota dinâmica
export const dynamic = 'force-dynamic'

// Inicializar Supabase (opcional - só se as variáveis estiverem configuradas)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

interface AnalyticsData {
  ip: string
  realIp: string
  userAgent: string
  referer: string
  path: string
  query: string
  isFilterDetected: boolean
  filterReason?: string
  timestamp: string
}

// Função para obter IP real do usuário
function getRealIP(request: NextRequest): string {
  // Tentar múltiplas fontes de IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (cfConnectingIp) return cfConnectingIp
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIp) return realIp
  
  return 'unknown'
}

// POST - Registrar analytics
export async function POST(request: NextRequest) {
  try {
    // Verificar se Supabase está configurado
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Analytics não configurado (Supabase não disponível)' 
      }, { status: 503 })
    }
    
    const body = await request.json()
    
    const realIp = getRealIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referer = request.headers.get('referer') || 'direct'
    
    const analyticsData: AnalyticsData = {
      ip: body.ip || realIp,
      realIp: realIp,
      userAgent: userAgent,
      referer: referer,
      path: body.path || '/',
      query: body.query || '',
      isFilterDetected: body.isFilterDetected || false,
      filterReason: body.filterReason || null,
      timestamp: new Date().toISOString()
    }
    
    // Salvar no Supabase
    const { data, error } = await supabase
      .from('analytics')
      .insert([analyticsData])
      .select()
    
    if (error) {
      console.error('[Analytics] Erro ao salvar no Supabase:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao salvar analytics' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      data: data[0]
    })
    
  } catch (error) {
    console.error('[Analytics] Erro:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno' 
    }, { status: 500 })
  }
}

// GET - Buscar analytics (protegido)
export async function GET(request: NextRequest) {
  try {
    // Verificar se Supabase está configurado
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Analytics não configurado (Supabase não disponível)' 
      }, { status: 503 })
    }
    
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const path = searchParams.get('path')
    const filterOnly = searchParams.get('filterOnly') === 'true'
    
    let query = supabase
      .from('analytics')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Filtros opcionais
    if (path) {
      query = query.eq('path', path)
    }
    
    if (filterOnly) {
      query = query.eq('isFilterDetected', true)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('[Analytics] Erro ao buscar do Supabase:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar analytics' 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      data: data,
      total: count,
      limit,
      offset
    })
    
  } catch (error) {
    console.error('[Analytics] Erro:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno' 
    }, { status: 500 })
  }
}

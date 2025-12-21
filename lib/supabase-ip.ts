import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

// Cliente Supabase para operações de IP
const supabaseIP = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseIPConfigured = !!(supabaseUrl && supabaseKey)

// Tipos
export type IPListType = 'whitelist' | 'blacklist'

export interface IPEntry {
  id?: number
  ip: string
  user_agent: string
  list_type: IPListType
  bearer_token?: string
  created_at?: string
  expires_at?: string
  source?: string // 'cloaker', 'manual', 'keyword'
}

// Adicionar IP à lista (whitelist ou blacklist)
export async function addIPToList(entry: Omit<IPEntry, 'id' | 'created_at'>): Promise<IPEntry | null> {
  if (!supabaseIP) {
    console.warn('⚠️ Supabase não configurado - IP não será salvo')
    return null
  }

  try {
    // Verificar se já existe
    const { data: existing } = await supabaseIP
      .from('cloaker')
      .select('*')
      .eq('ip', entry.ip)
      .eq('list_type', entry.list_type)
      .single()

    if (existing) {
      // Atualizar registro existente
      const { data, error } = await supabaseIP
        .from('cloaker')
        .update({
          user_agent: entry.user_agent,
          bearer_token: entry.bearer_token,
          expires_at: entry.expires_at,
          source: entry.source
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar IP:', error.message)
        return null
      }

      console.log(`✅ IP atualizado na ${entry.list_type}:`, entry.ip)
      return data
    }

    // Inserir novo registro
    const { data, error } = await supabaseIP
      .from('cloaker')
      .insert({
        ip: entry.ip,
        user_agent: entry.user_agent,
        list_type: entry.list_type,
        bearer_token: entry.bearer_token,
        expires_at: entry.expires_at,
        source: entry.source || 'cloaker'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao inserir IP:', error.message)
      return null
    }

    console.log(`✅ IP adicionado à ${entry.list_type}:`, entry.ip)
    return data
  } catch (err) {
    console.error('❌ Erro ao salvar IP no Supabase:', err)
    return null
  }
}

// Adicionar à whitelist (atalho)
export async function addToWhitelistDB(
  ip: string, 
  userAgent: string, 
  bearerToken: string,
  source: string = 'cloaker'
): Promise<IPEntry | null> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

  return addIPToList({
    ip,
    user_agent: userAgent,
    list_type: 'whitelist',
    bearer_token: bearerToken,
    expires_at: expiresAt.toISOString(),
    source
  })
}

// Adicionar à blacklist (atalho)
export async function addToBlacklistDB(
  ip: string, 
  userAgent: string,
  source: string = 'cloaker'
): Promise<IPEntry | null> {
  return addIPToList({
    ip,
    user_agent: userAgent,
    list_type: 'blacklist',
    source
  })
}

// Verificar se IP está na whitelist
export async function isIPWhitelisted(ip: string): Promise<boolean> {
  if (!supabaseIP) return false

  try {
    const { data, error } = await supabaseIP
      .from('cloaker')
      .select('id, expires_at')
      .eq('ip', ip)
      .eq('list_type', 'whitelist')
      .single()

    if (error || !data) return false

    // Verificar se não expirou
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at)
      if (expiresAt < new Date()) {
        // Expirado - remover
        await supabaseIP.from('cloaker').delete().eq('id', data.id)
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

// Verificar se IP está na blacklist
export async function isIPBlacklisted(ip: string): Promise<boolean> {
  if (!supabaseIP) return false

  try {
    const { data, error } = await supabaseIP
      .from('cloaker')
      .select('id')
      .eq('ip', ip)
      .eq('list_type', 'blacklist')
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

// Buscar entrada de IP
export async function getIPEntry(ip: string, listType: IPListType): Promise<IPEntry | null> {
  if (!supabaseIP) return null

  try {
    const { data, error } = await supabaseIP
      .from('cloaker')
      .select('*')
      .eq('ip', ip)
      .eq('list_type', listType)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

// Remover IP da lista
export async function removeIPFromList(ip: string, listType: IPListType): Promise<boolean> {
  if (!supabaseIP) return false

  try {
    const { error } = await supabaseIP
      .from('cloaker')
      .delete()
      .eq('ip', ip)
      .eq('list_type', listType)

    if (error) {
      console.error('❌ Erro ao remover IP:', error.message)
      return false
    }

    console.log(`✅ IP removido da ${listType}:`, ip)
    return true
  } catch {
    return false
  }
}

// Listar todos os IPs de uma lista
export async function listIPs(listType: IPListType, limit: number = 100): Promise<IPEntry[]> {
  if (!supabaseIP) return []

  try {
    const { data, error } = await supabaseIP
      .from('cloaker')
      .select('*')
      .eq('list_type', listType)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return data || []
  } catch {
    return []
  }
}

// Contar IPs por lista
export async function countIPs(listType: IPListType): Promise<number> {
  if (!supabaseIP) return 0

  try {
    const { count, error } = await supabaseIP
      .from('cloaker')
      .select('*', { count: 'exact', head: true })
      .eq('list_type', listType)

    if (error) return 0
    return count || 0
  } catch {
    return 0
  }
}

// Limpar IPs expirados
export async function cleanExpiredIPs(): Promise<number> {
  if (!supabaseIP) return 0

  try {
    const { data, error } = await supabaseIP
      .from('cloaker')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) return 0
    return data?.length || 0
  } catch {
    return 0
  }
}

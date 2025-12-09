import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

// Criar cliente apenas se as credenciais existirem
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not configured - card attempts will not be saved')
}

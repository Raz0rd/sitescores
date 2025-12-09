/**
 * Utilitários para hash SHA-256 (Enhanced Conversions do Google Ads)
 */

/**
 * Gera hash SHA-256 de uma string
 * @param value - Valor para fazer hash
 * @returns Hash SHA-256 em hexadecimal
 */
export async function sha256Hash(value: string): Promise<string> {
  if (!value) return ''
  
  // Normalizar: lowercase e remover espaços
  const normalized = value.toLowerCase().trim()
  
  // Converter para Uint8Array
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  
  // Gerar hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  
  // Converter para hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Normaliza e faz hash de email
 * @param email - Email para normalizar e fazer hash
 * @returns Hash SHA-256 do email normalizado
 */
export async function hashEmail(email: string): Promise<string> {
  if (!email) return ''
  
  // Remover espaços e converter para lowercase
  let normalized = email.toLowerCase().trim()
  
  // Remover pontos (.) antes do @ para Gmail e Googlemail (requisito do Google Ads)
  if (normalized.includes('@gmail.com') || normalized.includes('@googlemail.com')) {
    const [localPart, domain] = normalized.split('@')
    const localWithoutDots = localPart.replace(/\./g, '')
    normalized = `${localWithoutDots}@${domain}`
  }
  
  return sha256Hash(normalized)
}

/**
 * Normaliza e faz hash de telefone
 * @param phone - Telefone no formato E.164 (+5511999999999)
 * @returns Hash SHA-256 do telefone normalizado
 */
export async function hashPhone(phone: string): Promise<string> {
  if (!phone) return ''
  
  // Remover tudo exceto números e +
  const normalized = phone.replace(/[^\d+]/g, '')
  
  return sha256Hash(normalized)
}

/**
 * Normaliza e faz hash de nome
 * @param name - Nome para normalizar e fazer hash
 * @returns Hash SHA-256 do nome normalizado
 */
export async function hashName(name: string): Promise<string> {
  if (!name) return ''
  
  // Remover espaços extras, converter para lowercase
  const normalized = name.toLowerCase().trim().replace(/\s+/g, ' ')
  
  return sha256Hash(normalized)
}

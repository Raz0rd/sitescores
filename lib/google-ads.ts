/**
 * Google Ads Conversion Tracking
 * 
 * Helper functions para disparar eventos de conversão do Google Ads
 */

// Declarar gtag no window
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Hashear dados do usuário com SHA-256 (para Enhanced Conversions)
 */
async function hashUserData(value: string): Promise<string> {
  // Normalizar: minúsculas e sem espaços
  const normalized = value.toLowerCase().trim();
  
  // Converter para ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  
  // Gerar hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Converter para hex
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Verifica se o Google Ads está habilitado e o gtag está disponível
 */
function isGoogleAdsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  const enabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true';
  const hasGtag = typeof window.gtag === 'function';
  
  if (enabled && !hasGtag) {
    console.warn('[Google Ads] Google Ads está habilitado mas gtag() não está disponível');
  }
  
  return enabled && hasGtag;
}

/**
 * Disparar conversão quando pagamento é confirmado (status PAID)
 * Evento: "Compra" com Enhanced Conversions (dados hasheados)
 * 
 * @param transactionId - ID da transação
 * @param value - Valor da compra em reais (ex: 14.24)
 * @param email - Email do cliente (opcional, para Enhanced Conversions)
 * @param phone - Telefone do cliente (opcional, para Enhanced Conversions)
 */
export async function trackPurchase(
  transactionId: string, 
  value: number,
  email?: string,
  phone?: string
) {
  if (!isGoogleAdsEnabled()) {
    console.log('[Google Ads] Tracking desabilitado ou gtag não disponível');
    return;
  }

  try {
    // Pegar ID de conversão do .env
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    
    if (!googleAdsId || !conversionLabel) {
      console.warn('[Google Ads] ⚠️ ID ou Label não configurados no .env');
      console.warn('[Google Ads] Google Ads ID:', googleAdsId);
      console.warn('[Google Ads] Conversion Label:', conversionLabel);
      return;
    }
    const conversionId = `${googleAdsId}/${conversionLabel}`;
    
    console.log('[Google Ads] 🎯 Disparando conversão: Compra');
    console.log('[Google Ads] Conversion ID:', conversionId);
    console.log('[Google Ads] Transaction ID:', transactionId);
    console.log('[Google Ads] Valor: R$', value.toFixed(2));
    
    // 1. ENHANCED CONVERSIONS: Enviar user_data ANTES
    if (email || phone) {
      console.log('[Google Ads] 🔐 Preparando Enhanced Conversions...');
      
      const userData: any = {};
      
      // Hashear email
      if (email) {
        const hashedEmail = await hashUserData(email);
        userData.email = hashedEmail;
        console.log('[Google Ads] Email hasheado:', hashedEmail.substring(0, 16) + '...');
      }
      
      // Hashear telefone (formato E.164: +5511999999999)
      if (phone) {
        let cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('55')) {
          cleanPhone = '55' + cleanPhone;
        }
        const e164Phone = '+' + cleanPhone;
        const hashedPhone = await hashUserData(e164Phone);
        userData.phone_number = hashedPhone;
        console.log('[Google Ads] Telefone hasheado:', hashedPhone.substring(0, 16) + '...');
      }
      
      // Enviar user_data ANTES
      console.log('[Google Ads] 📤 Enviando user_data...');
      window.gtag!('set', 'user_data', userData);
      console.log('[Google Ads] ✅ user_data enviado');
    }
    
    // 2. Enviar conversão (purchase)
    const conversionData = {
      'send_to': conversionId,
      'value': value,
      'currency': 'BRL',
      'transaction_id': transactionId
    }
    
    console.log('📊 [Google Ads] Enviando conversão...');
    window.gtag!('event', 'conversion', conversionData);
    console.log('[Google Ads] ✅ Conversão enviada com sucesso');
  } catch (error) {
    console.error('[Google Ads] ❌ Erro ao disparar conversão de compra:', error);
  }
}

/**
 * Disparar conversão customizada
 * 
 * @param conversionLabel - Label de conversão (ex: 'S9KKCL7Qo6obEMa9u7JB')
 * @param params - Parâmetros adicionais
 */
export function trackCustomConversion(conversionLabel: string, params: Record<string, any> = {}) {
  if (!isGoogleAdsEnabled()) {
    console.log('[Google Ads] Tracking desabilitado ou gtag não disponível');
    return;
  }

  try {
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    
    if (!googleAdsId) {
      console.warn('[Google Ads] ⚠️ Google Ads ID não configurado no .env');
      return;
    }
    const conversionId = `${googleAdsId}/${conversionLabel}`;
    
    console.log('[Google Ads] 🎯 Disparando conversão customizada');
    console.log('[Google Ads] Conversion ID:', conversionId);
    console.log('[Google Ads] Params:', params);
    
    window.gtag!('event', 'conversion', {
      'send_to': conversionId,
      ...params
    });
    
    console.log('[Google Ads] ✅ Conversão customizada enviada com sucesso');
  } catch (error) {
    console.error('[Google Ads] ❌ Erro ao disparar conversão customizada:', error);
  }
}

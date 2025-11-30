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
 * Evento: "Compra"
 * 
 * @param transactionId - ID da transação
 * @param value - Valor da compra em reais (ex: 14.24)
 */
export function trackPurchase(transactionId: string, value: number) {
  if (!isGoogleAdsEnabled()) {
    return;
  }

  try {
    // Pegar ID de conversão do .env
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    
    if (!googleAdsId || !conversionLabel) {
      return;
    }
    const conversionId = `${googleAdsId}/${conversionLabel}`;
    
    // Objeto exato que será enviado para o Google Ads
    const conversionData = {
      'send_to': conversionId,
      'value': value,
      'currency': 'BRL',
      'transaction_id': transactionId
    }
    
    window.gtag!('event', 'conversion', conversionData);
  } catch (error) {
    // Silencioso
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

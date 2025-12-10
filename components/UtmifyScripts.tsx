'use client';

import { useEffect } from 'react';

export default function UtmifyScripts() {
  const utmifyPixelId = process.env.NEXT_PUBLIC_PIXELID_UTMFY || '691cd3b3b92ea77f371e882b';
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (isDevelopment) {
      console.log('🔧 [UtmifyScripts] Modo desenvolvimento: Scripts UTMify desabilitados');
    } else {
      console.log('✅ [UTMify] Scripts carregados no client-side');
    }
  }, [isDevelopment]);

  // Não renderizar scripts em modo de desenvolvimento
  if (isDevelopment) {
    return null;
  }

  return (
    <>
      {/* UTMify Pixel - Google Ads Tracking */}
      <script
        id="utmify-pixel-inline"
        dangerouslySetInnerHTML={{
          __html: `
            window.googlePixelId = "${utmifyPixelId}";
            (function() {
              var a = document.createElement("script");
              a.setAttribute("async", "");
              a.setAttribute("defer", "");
              a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel-google.js");
              document.head.appendChild(a);
            })();
          `
        }}
      />
      
      {/* Script próprio para capturar UTMs - SEM RELOAD */}
      <script
        id="utm-capture"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Capturar UTMs da URL SEMPRE que houver parâmetros
              if (typeof window !== 'undefined') {
                var params = new URLSearchParams(window.location.search);
                var hasParams = false;
                
                var utmParams = {
                  utm_source: params.get('utm_source') || '',
                  utm_campaign: params.get('utm_campaign') || '',
                  utm_medium: params.get('utm_medium') || '',
                  utm_content: params.get('utm_content') || '',
                  utm_term: params.get('utm_term') || '',
                  gclid: params.get('gclid') || '',
                  gbraid: params.get('gbraid') || '',
                  wbraid: params.get('wbraid') || '',
                  fbclid: params.get('fbclid') || '',
                  keyword: params.get('keyword') || '',
                  device: params.get('device') || '',
                  network: params.get('network') || '',
                  gad_source: params.get('gad_source') || '',
                  gad_campaignid: params.get('gad_campaignid') || ''
                };
                
                // Salvar CADA parâmetro individualmente no localStorage
                Object.keys(utmParams).forEach(function(key) {
                  if (utmParams[key]) {
                    localStorage.setItem(key, utmParams[key]);
                    hasParams = true;
                  }
                });
                
                if (hasParams && !sessionStorage.getItem('utms_captured')) {
                  sessionStorage.setItem('utms_captured', 'true');
                  console.log('✅ UTMs capturadas e salvas no localStorage:', utmParams);
                }
              }
            })();
          `
        }}
      />
    </>
  );
}

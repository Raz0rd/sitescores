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
              if (typeof window !== 'undefined') {
                var params = new URLSearchParams(window.location.search);
                var hasValidParams = false;
                
                // Lista de parâmetros para capturar
                var paramKeys = [
                  'utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term',
                  'gclid', 'gbraid', 'wbraid', 'fbclid', 'keyword', 'device', 'network',
                  'gad_source', 'gad_campaignid'
                ];
                
                // Capturar parâmetros da URL
                paramKeys.forEach(function(key) {
                  var value = params.get(key);
                  
                  // PROTEÇÃO: Só salvar se o valor for válido
                  if (value && value !== '' && value !== 'organic' && value !== 'null' && value !== 'undefined') {
                    // Verificar se já existe no localStorage
                    var existing = localStorage.getItem(key);
                    
                    // IMPORTANTE: Só sobrescrever se:
                    // 1. Não existe valor anterior, OU
                    // 2. O novo valor é do Google Ads (gclid, gbraid) e é diferente
                    if (!existing || (key === 'gclid' || key === 'gbraid' || key === 'wbraid') && existing !== value) {
                      localStorage.setItem(key, value);
                      hasValidParams = true;
                    }
                  }
                });
                
                // Log apenas na primeira captura
                if (hasValidParams && !sessionStorage.getItem('utms_captured')) {
                  sessionStorage.setItem('utms_captured', 'true');
                  var captured = {};
                  paramKeys.forEach(function(key) {
                    var val = localStorage.getItem(key);
                    if (val) captured[key] = val;
                  });
                  console.log('✅ UTMs capturadas e protegidas no localStorage:', captured);
                }
              }
            })();
          `
        }}
      />
    </>
  );
}

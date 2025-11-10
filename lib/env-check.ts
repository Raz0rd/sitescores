/**
 * Verificação e log das variáveis de ambiente ao iniciar o servidor
 */

export function checkEnvironmentVariables() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 [ENV CHECK] Variáveis de Ambiente Carregadas')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Variáveis do Google Ads
  console.log('📊 Google Ads:')
  console.log(`   NEXT_PUBLIC_GOOGLE_ADS_ID: ${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)
  console.log(`   NEXT_PUBLIC_GTAG_CONVERSION_COMPRA: ${process.env.NEXT_PUBLIC_GTAG_CONVERSION_COMPRA ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)
  console.log(`   NEXT_PUBLIC_GOOGLE_AW_ID: ${process.env.NEXT_PUBLIC_GOOGLE_AW_ID ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)
  console.log(`   NEXT_PUBLIC_GOGLE_CONVERSION_LABEL: ${process.env.NEXT_PUBLIC_GOOGLE_CONVERSION_LABEL ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)



  // Variáveis do UTMify
  console.log('\n📈 UTMify:')
  console.log(`   NEXT_PUBLIC_UTMIFY_TOKEN: ${process.env.NEXT_PUBLIC_UTMIFY_TOKEN ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)

  // Variáveis de API Externa
  console.log('\n🎮 APIs Externas:')
  console.log(`   NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)

  // Verificar se há variáveis críticas faltando
  const criticalVars = [
    'NEXT_PUBLIC_GOOGLE_ADS_ID',
    'NEXT_PUBLIC_GTAG_CONVERSION_COMPRA',
    'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
    'MERCADOPAGO_ACCESS_TOKEN'
  ]

  const missingVars = criticalVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.log('\n⚠️  ATENÇÃO: Variáveis críticas não configuradas:')
    missingVars.forEach(varName => {
      console.log(`   ❌ ${varName}`)
    })
    console.log('\n💡 Configure essas variáveis no arquivo .env.local\n')
  } else {
    console.log('\n✅ Todas as variáveis críticas estão configuradas!\n')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

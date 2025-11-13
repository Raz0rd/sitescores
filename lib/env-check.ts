/**
 * Verificação e log das variáveis de ambiente ao iniciar o servidor
 */

export function checkEnvironmentVariables() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔧 [ENV CHECK] Variáveis de Ambiente Carregadas')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Ambiente
  console.log('🌍 Ambiente:')
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || '❌ NÃO CONFIGURADO'}`)
  console.log(`   NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL || '❌ NÃO CONFIGURADO'}`)
  console.log(`   NEXT_PUBLIC_ALLOWED_DOMAINS: ${process.env.NEXT_PUBLIC_ALLOWED_DOMAINS || '❌ NÃO CONFIGURADO'}`)

  // Cloaker
  console.log('\n🎯 Cloaker:')
  console.log(`   NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED: ${process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true' ? '✅ ATIVO' : '❌ DESATIVADO'}`)

  // Google Ads
  console.log('\n📊 Google Ads:')
  console.log(`   NEXT_PUBLIC_GOOGLE_ADS_ENABLED: ${process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true' ? '✅ ATIVO' : '❌ DESATIVADO'}`)
  console.log(`   NEXT_PUBLIC_GOOGLE_ADS_ID: ${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)
  console.log(`   NEXT_PUBLIC_GTAG_CONVERSION_COMPRA: ${process.env.NEXT_PUBLIC_GTAG_CONVERSION_COMPRA ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)

  // Gateway de Pagamento
  console.log('\n💳 Gateway de Pagamento:')
  console.log(`   PAYMENT_GATEWAY: ${process.env.PAYMENT_GATEWAY || '❌ NÃO CONFIGURADO'}`)
  console.log(`   EZZPAG_API_AUTH: ${process.env.EZZPAG_API_AUTH ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)
  console.log(`   NITRO_API_KEY: ${process.env.NITRO_API_KEY ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)

  // UTMify
  console.log('\n📈 UTMify:')
  console.log(`   UTMIFY_ENABLED: ${process.env.UTMIFY_ENABLED === 'true' ? '✅ ATIVO' : '❌ DESATIVADO'}`)
  console.log(`   UTMIFY_API_TOKEN: ${process.env.UTMIFY_API_TOKEN ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`)
  console.log(`   UTMIFY_TEST_MODE: ${process.env.UTMIFY_TEST_MODE === 'true' ? '⚠️ TESTE' : '✅ PRODUÇÃO'}`)

  // Verificação de Usuário
  console.log('\n🔐 Verificação:')
  console.log(`   NEXT_PUBLIC_ENABLE_USER_VERIFICATION: ${process.env.NEXT_PUBLIC_ENABLE_USER_VERIFICATION === 'true' ? '✅ ATIVO' : '❌ DESATIVADO'}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

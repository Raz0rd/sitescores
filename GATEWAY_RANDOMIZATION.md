# Sistema de Randomização de Gateways de Pagamento

## 📋 Visão Geral

Este sistema permite randomizar automaticamente entre múltiplos gateways de pagamento (GhostPay, Ezzpag, Umbrela, etc.) para distribuir a carga e evitar dependência de um único provedor.

## 🚀 Como Implementar em Outro Projeto

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env` ou `.env.local`:

```bash
# Gateway de Pagamento
# Para randomizar entre múltiplos, separe por vírgula
PAYMENT_GATEWAY=ghostpay,ezzpag,umbrela

# Credenciais GhostPay
GHOSTPAY_API_KEY=sk_live_sua_secret_key_aqui
GHOSTPAY_COMPANY_ID=seu_company_id_aqui

# Credenciais Ezzpag
EZZPAG_API_AUTH=seu_token_ezzpag_aqui

# Credenciais Umbrela
UMBRELA_API_KEY=sua_chave_umbrela_aqui
```

### 2. Código de Randomização

No arquivo que processa pagamentos (ex: `app/api/generate-pix/route.ts`):

```typescript
export async function POST(request: NextRequest) {
  try {
    const config = getConfig()
    
    // Randomizar gateway se houver múltiplos configurados
    let gateway = config.paymentGateway
    const gateways = gateway.split(',').map(g => g.trim()).filter(g => g.length > 0)
    
    if (gateways.length > 1) {
      // Escolher gateway aleatório
      const randomIndex = Math.floor(Math.random() * gateways.length)
      gateway = gateways[randomIndex]
      console.log("🎲 [GATEWAY] Múltiplos gateways detectados:", gateways)
      console.log("🎯 [GATEWAY] Gateway sorteado:", gateway)
    } else {
      gateway = gateways[0] || 'ezzpag'
    }
    
    console.log("🎯 [GATEWAY] Gateway final selecionado:", gateway)
    
    // Chamar gateway apropriado
    let result: any
    
    if (gateway === 'ghostpay') {
      result = await generatePixGhostPay(body, baseUrl)
    } else if (gateway === 'ezzpag') {
      result = await generatePixEzzpag(body, baseUrl)
    } else if (gateway === 'umbrela') {
      result = await generatePixUmbrela(body, baseUrl)
    } else {
      // Gateway padrão
      result = await generatePixEzzpag(body, baseUrl)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ [GATEWAY] Erro:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
```

### 3. Autenticação GhostPay (Importante!)

A GhostPay usa **Basic Auth** com `SECRET_KEY:COMPANY_ID`:

```typescript
async function generatePixGhostPay(body: any, baseUrl: string) {
  const secretKey = process.env.GHOSTPAY_API_KEY
  const companyId = process.env.GHOSTPAY_COMPANY_ID
  
  if (!secretKey || !companyId) {
    throw new Error("GHOSTPAY_API_KEY e GHOSTPAY_COMPANY_ID são obrigatórios")
  }
  
  // Criar auth Basic com base64 (SECRET_KEY:COMPANY_ID)
  const authString = Buffer.from(`${secretKey}:${companyId}`).toString('base64')
  
  const response = await fetch("https://api.ghostspaysv2.com/functions/v1/transactions", {
    method: "POST",
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  
  return await response.json()
}
```

## 📊 Exemplos de Uso

### Usar apenas um gateway:
```bash
PAYMENT_GATEWAY=ghostpay
```

### Randomizar entre dois:
```bash
PAYMENT_GATEWAY=ghostpay,ezzpag
```

### Randomizar entre três ou mais:
```bash
PAYMENT_GATEWAY=ghostpay,ezzpag,umbrela,nitro
```

## 🔍 Logs de Debug

Quando múltiplos gateways estão configurados, você verá nos logs:

```
🎲 [GATEWAY] Múltiplos gateways detectados: ['ghostpay', 'ezzpag', 'umbrela']
🎯 [GATEWAY] Gateway sorteado: ezzpag
🎯 [GATEWAY] Gateway final selecionado: ezzpag
```

## ✅ Checklist de Implementação

- [ ] Adicionar variáveis de ambiente no `.env`
- [ ] Implementar código de randomização
- [ ] Configurar autenticação de cada gateway
- [ ] Testar cada gateway individualmente
- [ ] Testar randomização com múltiplos gateways
- [ ] Verificar logs no PM2/console
- [ ] Fazer build e restart do servidor

## 🔧 Comandos Úteis

### Atualizar servidor:
```bash
git pull origin seu-branch
npm run build
pm2 restart seu-app
```

### Ver logs em tempo real:
```bash
pm2 logs seu-app --lines 100
```

### Testar localmente:
```bash
npm run dev
```

## 📝 Notas Importantes

1. **Credenciais**: Cada gateway precisa de suas próprias credenciais configuradas
2. **Fallback**: Se um gateway falhar, implemente retry ou fallback para outro
3. **Logs**: Sempre logue qual gateway foi usado para debug
4. **Testes**: Teste cada gateway individualmente antes de randomizar
5. **Monitoramento**: Monitore taxas de sucesso de cada gateway

## 🆘 Troubleshooting

### Gateway não está sendo randomizado
- Verifique se há vírgulas no `PAYMENT_GATEWAY`
- Confirme que não há espaços extras
- Veja os logs para confirmar detecção

### Erro 401 na GhostPay
- Verifique `GHOSTPAY_API_KEY` e `GHOSTPAY_COMPANY_ID`
- Confirme que está usando `:` entre as credenciais no base64
- Teste as credenciais manualmente com curl

### Gateway não encontrado
- Verifique se o nome no `.env` corresponde ao código
- Nomes válidos: `ghostpay`, `ezzpag`, `umbrela`, `nitro`
- Case-sensitive: use minúsculas

## 📚 Documentação das APIs

- **GhostPay**: https://ghostspay.readme.io/reference
- **Ezzpag**: (documentação interna)
- **Umbrela**: (documentação interna)

## 🎯 Benefícios

✅ **Distribuição de carga** entre múltiplos provedores
✅ **Redundância** - se um cair, outros continuam
✅ **Flexibilidade** - fácil adicionar/remover gateways
✅ **Sem downtime** - troca de gateway sem parar o sistema
✅ **A/B Testing** - testar performance de cada gateway

---

**Desenvolvido para**: Sistema de Pagamentos PIX
**Última atualização**: Novembro 2025

# 🎯 Google Ads - Múltiplas Tags e Labels

Sistema flexível para disparar múltiplas conversões do Google Ads simultaneamente.

---

## 📋 **RECURSOS**

✅ **Múltiplas conversões** - Dispare quantas conversões quiser  
✅ **Múltiplas contas** - Suporte para diferentes contas Google Ads  
✅ **Múltiplos labels** - Mesma conta, labels diferentes  
✅ **Enhanced Conversions** - Email e telefone hasheados (SHA-256)  
✅ **Logs detalhados** - Veja exatamente o que foi disparado  
✅ **Compatibilidade** - Funciona com configuração antiga  

---

## 🚀 **COMO USAR**

### **Método 1: Variáveis Individuais (1 conversão)**

Mais simples, ideal para quem tem apenas 1 conversão:

```bash
# .env
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-17731323187
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=wKeVCK6GirUbEKSpqfBB
```

---

### **Método 2: Múltiplas Conversões Numeradas (até 10)**

Use este método para disparar várias conversões:

```bash
# .env

# Conversão 1
NEXT_PUBLIC_GOOGLE_ADS_ID_1=AW-17731323187
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_1=wKeVCK6GirUbEKSpqfBB
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_1=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_1=Conversão Principal

# Conversão 2
NEXT_PUBLIC_GOOGLE_ADS_ID_2=AW-12345678901
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_2=AbCdEfGhIjKl
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_2=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_2=Conversão Backup

# Conversão 3 (desativada)
NEXT_PUBLIC_GOOGLE_ADS_ID_3=AW-98765432109
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_3=XyZaBcDeFgHi
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_3=false
NEXT_PUBLIC_GOOGLE_ADS_NAME_3=Conversão Teste
```

**Campos obrigatórios por conversão:**
- `NEXT_PUBLIC_GOOGLE_ADS_ID_X` - ID da conta (ex: AW-17731323187)
- `NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_X` - Label da conversão
- `NEXT_PUBLIC_GOOGLE_ADS_ENABLED_X` - true/false
- `NEXT_PUBLIC_GOOGLE_ADS_NAME_X` - Nome descritivo (opcional)

**Onde X = 1, 2, 3... até 10**

---

### **Método 3: JSON (Avançado)**

Para configuração mais flexível:

```bash
# .env (TUDO EM UMA LINHA)
NEXT_PUBLIC_GOOGLE_ADS_CONVERSIONS=[{"id":"main","name":"Conversão Principal","adsId":"AW-17731323187","label":"wKeVCK6GirUbEKSpqfBB","enabled":true},{"id":"backup","name":"Conversão Backup","adsId":"AW-12345678901","label":"AbCdEfGhIjKl","enabled":true}]
```

---

## 📊 **EXEMPLOS DE USO**

### **Exemplo 1: Mesma conta, 2 labels diferentes**

```bash
# Disparar 2 conversões na mesma conta Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ID_1=AW-17731323187
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_1=wKeVCK6GirUbEKSpqfBB
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_1=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_1=Compra - Label Principal

NEXT_PUBLIC_GOOGLE_ADS_ID_2=AW-17731323187
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_2=XyZaBcDeFgHi
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_2=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_2=Compra - Label Backup
```

### **Exemplo 2: 2 contas diferentes**

```bash
# Disparar conversões em 2 contas Google Ads diferentes
NEXT_PUBLIC_GOOGLE_ADS_ID_1=AW-17731323187
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_1=wKeVCK6GirUbEKSpqfBB
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_1=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_1=Conta Principal

NEXT_PUBLIC_GOOGLE_ADS_ID_2=AW-98765432109
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_2=MnOpQrStUvWx
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_2=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_2=Conta Secundária
```

### **Exemplo 3: Ativar/Desativar conversões**

```bash
# Conversão 1 - ATIVA
NEXT_PUBLIC_GOOGLE_ADS_ID_1=AW-17731323187
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_1=wKeVCK6GirUbEKSpqfBB
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_1=true
NEXT_PUBLIC_GOOGLE_ADS_NAME_1=Produção

# Conversão 2 - DESATIVADA (não será disparada)
NEXT_PUBLIC_GOOGLE_ADS_ID_2=AW-12345678901
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA_2=AbCdEfGhIjKl
NEXT_PUBLIC_GOOGLE_ADS_ENABLED_2=false
NEXT_PUBLIC_GOOGLE_ADS_NAME_2=Teste
```

---

## 🔍 **LOGS NO CONSOLE**

Após uma compra, você verá no console do navegador (F12):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ [Google Ads] DISPARANDO 2 CONVERSÃO(ÕES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 Transaction ID: e1c0e998-f110-4b8f-b613-e2de2f139e08
💰 Valor: R$ 11.99
📧 Email: ✅ Hasheado
📱 Telefone: ✅ Hasheado
🎯 Enhanced Conversions: ✅ ATIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ [Conversão Principal] AW-17731323187/wKeVCK6GirUbEKSpqfBB
✅ [Conversão Backup] AW-12345678901/AbCdEfGhIjKl
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚙️ **PRIORIDADE DE CARREGAMENTO**

O sistema carrega as conversões nesta ordem:

1. **NEXT_PUBLIC_GOOGLE_ADS_CONVERSIONS** (JSON) - Prioridade máxima
2. **NEXT_PUBLIC_GOOGLE_ADS_ID** + **NEXT_PUBLIC_GTAG_CONVERSION_COMPRA** - Compatibilidade
3. **NEXT_PUBLIC_GOOGLE_ADS_ID_1**, **_2**, **_3**... - Múltiplas conversões

Se você usar o **Método 3 (JSON)**, os outros métodos serão ignorados.

---

## 🔧 **COMO OBTER OS VALORES**

### **1. NEXT_PUBLIC_GOOGLE_ADS_ID**

1. Acesse o Google Ads
2. Vá em **Ferramentas e Configurações** → **Conversões**
3. Clique na conversão desejada
4. Copie o **ID da conversão** (ex: `AW-17731323187`)

### **2. NEXT_PUBLIC_GTAG_CONVERSION_COMPRA**

1. Na mesma tela da conversão
2. Copie o **Label da conversão** (ex: `wKeVCK6GirUbEKSpqfBB`)

### **3. Formato completo**

```
AW-17731323187/wKeVCK6GirUbEKSpqfBB
     ↑              ↑
     ID           Label
```

---

## 🚀 **DEPLOY**

Após configurar o `.env`:

```bash
# Build e restart
npm run build && pm2 restart aprovarevolucaoweb-click
```

---

## ✅ **VERIFICAR SE ESTÁ FUNCIONANDO**

1. Faça uma compra de teste (R$ 0,10)
2. Abra o console do navegador (F12)
3. Vá para a página `/sucesso`
4. Verifique os logs (veja exemplo acima)
5. Confira no Google Ads se as conversões foram registradas

---

## 🆘 **TROUBLESHOOTING**

### **Nenhuma conversão disparada**

```
⚠️ [Google Ads] Nenhuma conversão configurada
```

**Solução:** Verifique se pelo menos uma conversão está com `ENABLED=true`

### **Conversão não aparece no Google Ads**

1. Aguarde até 3 horas (delay do Google Ads)
2. Verifique se o ID e Label estão corretos
3. Verifique se a tag do Google Ads está instalada (`NEXT_PUBLIC_GOOGLE_ADS_ENABLED=true`)

### **Enhanced Conversions não está ativo**

```
🎯 Enhanced Conversions: ❌ Inativo
```

**Causa:** Email ou telefone não foram fornecidos no checkout

---

## 📝 **NOTAS IMPORTANTES**

- ✅ Todas as conversões são disparadas **simultaneamente**
- ✅ Cada conversão recebe os **mesmos dados** (valor, transaction_id, etc)
- ✅ **Enhanced Conversions** funciona em todas as conversões
- ✅ Você pode **ativar/desativar** conversões sem remover a configuração
- ✅ Suporta até **10 conversões** pelo Método 2 (numerado)
- ✅ Suporta **ilimitadas conversões** pelo Método 3 (JSON)

---

## 📚 **ARQUIVOS RELACIONADOS**

- `lib/google-ads-config.ts` - Configuração e carregamento
- `app/sucesso/page.tsx` - Disparo das conversões
- `.env.google-ads-example` - Exemplos de configuração

---

## 🎉 **PRONTO!**

Agora você pode disparar múltiplas conversões do Google Ads simultaneamente! 🚀

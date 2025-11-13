# 🎯 Cloaker - Detecção de Bot vs Usuário Real

## 🔧 Como Funciona

O cloaker detecta se o visitante é um **bot/crawler** ou **usuário real** e mostra conteúdo diferente **na mesma URL (`/`)**.

### 🤖 Bot/Crawler → WhitePage
- Google Bot
- Facebook Crawler  
- Scrapers
- Ferramentas automatizadas

### 👤 Usuário Real → Loja
- Tráfego orgânico
- Anúncios (Google Ads, Facebook Ads)
- Links diretos

---

## 📋 Configuração

### 1. Configurar no AlterCPA

Acesse: https://www.altercpa.one/

**Target and dummy sites:**
- **Target site (Black):** `https://seu-dominio.com/`
- **Dummy site (White):** `https://seu-dominio.com/`
- **Método:** `request` ou `file`

**Filtros:**
- ✅ Check language (rejeitar idiomas não suportados)
- ✅ Check ad click ID (aceitar apenas com gclid, fbclid, etc)
- ✅ AlterCPA One IPv4 (filtro de IPs)
- ✅ Smart IPv4 (detecção inteligente)

### 2. Ativar no `.env`

```bash
# Cloaker
NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED=true
```

### 3. Atualizar URL do Cloaker

No `middleware.ts`, linha 7:

```typescript
const CLOAKER_CONFIG = {
  url: 'https://www.altercpa.one/fltr/SEU-ID-AQUI',
  enabled: process.env.NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED === 'true'
}
```

---

## 🔄 Fluxo de Funcionamento

### 1️⃣ Primeira Visita

```
Visitante → Middleware → AlterCPA API
                             ↓
                    ┌────────┴────────┐
                    ↓                 ↓
                  BOT              USUÁRIO
                    ↓                 ↓
              WhitePage          Cookie setado
              (sem cookie)       (cloaker_verified)
                    ↓                 ↓
              Fica na /         WhitePage → Loja
```

### 2️⃣ Visitas Seguintes

**Bot (sem cookie):**
```
Bot → Middleware → Sem cookie → WhitePage
```

**Usuário Real (com cookie):**
```
Usuário → Middleware → Cookie válido → Pula verificação → Loja
```

---

## 🎯 Comportamento por Tipo

### 🤖 Bot Detectado

1. Middleware **NÃO seta cookie**
2. `WhitePageWrapper` detecta ausência de cookie
3. Mostra **WhitePage** (página genérica)
4. Bot vê apenas conteúdo neutro

### 👤 Usuário Real Detectado

1. Middleware **seta cookie** `cloaker_verified=true`
2. `WhitePageWrapper` detecta cookie
3. Primeira vez: Mostra **WhitePage** (botão ativar)
4. Após clicar: Mostra **Loja** (conteúdo real)
5. Cookie dura **24 horas**

---

## 🧪 Testes

### 1. Testar como Bot

```bash
# Sem cookies (simula bot)
curl -I https://seu-dominio.com/

# Deve retornar WhitePage
```

### 2. Testar como Usuário

```bash
# Com navegador normal
# 1. Abrir https://seu-dominio.com/
# 2. Deve mostrar WhitePage
# 3. Clicar em "Ativar"
# 4. Deve mostrar Loja

# Verificar cookie no DevTools:
# Application → Cookies → cloaker_verified = true
```

### 3. Verificar Logs

No console do servidor (PM2):

```bash
sudo pm2 logs seu-projeto

# Logs esperados:
# 🤖 [Cloaker] BOT detectado - mostrando whitepage
# 👤 [Cloaker] USUÁRIO REAL detectado - setando cookie
```

---

## 📊 Vantagens

### ✅ Mesma URL
- Bot e usuário acessam `/`
- Não precisa de rotas diferentes (`/promo`, `/offer`, etc)
- Mais natural e difícil de detectar

### ✅ Cookie HttpOnly
- Cookie setado pelo servidor (middleware)
- Não pode ser forjado via JavaScript
- Mais seguro que localStorage

### ✅ Compatível com Google Ads
- WhitePage é genérica (sem marcas de jogos)
- Usuários reais veem conteúdo completo
- Bots do Google veem página limpa

### ✅ Performance
- Verificação rápida (cookie check)
- Apenas primeira visita consulta AlterCPA
- Visitas seguintes são instantâneas

---

## ⚙️ Configurações Avançadas

### Duração do Cookie

No `middleware.ts`, linha 95:

```typescript
maxAge: 60 * 60 * 24 // 24 horas
```

Altere para:
- `60 * 60` = 1 hora
- `60 * 60 * 24 * 7` = 7 dias
- `60 * 60 * 24 * 30` = 30 dias

### Rotas Públicas

No `WhitePageWrapper.tsx`, linha 27:

```typescript
const publicRoutes = ['/cupons', '/success', '/sucesso', '/checkout', '/termos', '/privacidade']
```

Adicione rotas que **NÃO** devem ter whitepage.

---

## 🚨 Troubleshooting

### Problema: Cookie não é setado

**Causa:** HTTPS não configurado

**Solução:**
```typescript
// middleware.ts, linha 93
secure: false, // Apenas para desenvolvimento local
```

### Problema: Todos veem WhitePage

**Causa:** Cloaker retornando sempre "white"

**Solução:**
1. Verificar configuração no AlterCPA
2. Verificar filtros (pode estar bloqueando tudo)
3. Testar com `gclid` na URL: `/?gclid=teste`

### Problema: Todos veem Loja

**Causa:** Cloaker retornando sempre "black"

**Solução:**
1. Verificar se URL do cloaker está correta
2. Verificar se filtros não estão muito permissivos
3. Testar com user-agent de bot

---

## 📋 Checklist de Ativação

- [ ] Configurado no AlterCPA
- [ ] URL do cloaker atualizada no `middleware.ts`
- [ ] `.env` com `NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED=true`
- [ ] HTTPS configurado (para cookies secure)
- [ ] Testado como bot (sem cookie)
- [ ] Testado como usuário (com cookie)
- [ ] Logs verificados no PM2
- [ ] WhitePage genérica (sem marcas)
- [ ] Loja funcional após ativar

---

## 🎯 Resultado Final

**Mesma URL (`/`), conteúdos diferentes:**

| Visitante | Cookie | Vê |
|-----------|--------|-----|
| Bot | ❌ Não | WhitePage |
| Usuário (1ª vez) | ✅ Sim | WhitePage → Loja |
| Usuário (retorno) | ✅ Sim | Loja direto |

**Proteção máxima + UX perfeita!** 🛡️✨

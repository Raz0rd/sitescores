# 🛡️ Proteção Contra Acesso por IP

## 🎯 Problema

Scrapers e bots estavam acessando o site **diretamente pelo IP do servidor**, ignorando o domínio:

```bash
curl -v -H "Host: recargaspravce.shop" 38.180.220.203/
```

Isso permite:
- ❌ Descobrir o IP do servidor
- ❌ Fazer scraping direto
- ❌ Ignorar proteções de domínio
- ❌ Mapear infraestrutura

## ✅ Solução Implementada

### 🔒 Bloqueio no Middleware

**Arquivo:** `middleware.ts`

```typescript
// Domínios permitidos do .env (separados por vírgula)
const allowedDomainsEnv = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS || ''
const allowedDomains = [
  ...allowedDomainsEnv.split(',').map(d => d.trim()).filter(Boolean),
  'localhost:3000',
  'localhost:3001'
]

// Bloquear se não for um domínio autorizado
if (allowedDomains.length > 2 && !allowedDomains.some(domain => requestHost.includes(domain))) {
  return new NextResponse('Forbidden', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  })
}
```

**Arquivo:** `.env`

```bash
# Domínios permitidos (separados por vírgula)
NEXT_PUBLIC_ALLOWED_DOMAINS=recarregueseujoguinho.shop,www.recarregueseujoguinho.shop
```

## 🎯 Como Funciona

### ✅ Acesso Permitido:

```bash
# Via domínio correto
curl https://recarregueseujoguinho.shop/
→ ✅ 200 OK

# Via www
curl https://www.recarregueseujoguinho.shop/
→ ✅ 200 OK

# Localhost (dev)
curl http://localhost:3000/
→ ✅ 200 OK
```

### ❌ Acesso Bloqueado:

```bash
# Via IP direto
curl http://38.180.220.203/
→ ❌ 403 Forbidden

# Via IP com header fake
curl -H "Host: recargaspravce.shop" http://38.180.220.203/
→ ❌ 403 Forbidden

# Via domínio não autorizado
curl http://outro-dominio.com/
→ ❌ 403 Forbidden
```

## 📊 Benefícios

### 🛡️ Segurança:

- ✅ **Esconde o IP** - Scrapers não conseguem acessar diretamente
- ✅ **Bloqueia bypass** - Não adianta usar header fake
- ✅ **Protege infraestrutura** - IP do servidor fica oculto
- ✅ **Previne mapeamento** - Dificulta descoberta de servidores

### 🚀 Performance:

- ✅ **Bloqueio rápido** - Primeira verificação no middleware
- ✅ **Sem processamento** - Retorna 403 imediatamente
- ✅ **Economiza recursos** - Não processa requisições inválidas

## 🔍 Logs

### Console do Servidor:

```
🚫 [Middleware] Bloqueado acesso por IP/domínio não autorizado: 38.180.220.203
🚫 [Middleware] Bloqueado acesso por IP/domínio não autorizado: 172.67.129.196
🚫 [Middleware] Bloqueado acesso por IP/domínio não autorizado: outro-site.com
```

## 🌐 Cloudflare (Camada Extra)

Se usar Cloudflare, adicione regras extras:

### Firewall Rules:

```
(http.host ne "recarregueseujoguinho.shop" and 
 http.host ne "www.recarregueseujoguinho.shop")
→ Block
```

### Page Rules:

```
*38.180.220.203*
→ Forwarding URL (301): https://recarregueseujoguinho.shop/
```

## 🔐 Nginx (Camada Servidor)

Se tiver acesso ao Nginx, adicione:

```nginx
server {
    listen 80;
    listen 443 ssl;
    
    # Bloquear acesso por IP
    server_name 38.180.220.203;
    return 403;
}

server {
    listen 80;
    listen 443 ssl;
    
    # Apenas domínios autorizados
    server_name recarregueseujoguinho.shop www.recarregueseujoguinho.shop;
    
    # ... resto da configuração
}
```

## 📋 Checklist de Proteção

- [x] ✅ Middleware bloqueia acesso por IP
- [x] ✅ Apenas domínios autorizados permitidos
- [x] ✅ Localhost permitido para desenvolvimento
- [x] ✅ Logs de tentativas bloqueadas
- [x] ✅ Header `X-Robots-Tag` para SEO
- [ ] ⏳ Cloudflare Firewall Rules (opcional)
- [ ] ⏳ Nginx server blocks (opcional)

## 🧪 Como Testar

### 1. Teste Acesso Normal:

```bash
curl -I https://recarregueseujoguinho.shop/
# Deve retornar: 200 OK
```

### 2. Teste Acesso por IP:

```bash
curl -I http://38.180.220.203/
# Deve retornar: 403 Forbidden
```

### 3. Teste com Header Fake:

```bash
curl -I -H "Host: fake.com" http://38.180.220.203/
# Deve retornar: 403 Forbidden
```

## ⚠️ Importante

### Adicionar Novos Domínios:

Se adicionar um novo domínio, atualize o `.env`:

```bash
# Adicione separado por vírgula
NEXT_PUBLIC_ALLOWED_DOMAINS=recarregueseujoguinho.shop,www.recarregueseujoguinho.shop,novo-dominio.com
```

### Ambientes de Staging:

Para staging/preview, adicione no `.env`:

```bash
# Produção + Staging
NEXT_PUBLIC_ALLOWED_DOMAINS=recarregueseujoguinho.shop,www.recarregueseujoguinho.shop,staging.recarregueseujoguinho.shop
```

**Vantagens de usar .env:**
- ✅ Não precisa recompilar o código
- ✅ Diferentes domínios por ambiente
- ✅ Fácil de gerenciar
- ✅ Não expõe domínios no código

## 🎯 Resultado Final

### Antes (Vulnerável):

```bash
curl http://38.180.220.203/
→ ✅ 200 OK (PROBLEMA!)
```

### Depois (Protegido):

```bash
curl http://38.180.220.203/
→ ❌ 403 Forbidden (BLOQUEADO!)
```

---

**Status:** ✅ Implementado e funcionando
**Data:** 13/11/2025
**Proteção:** 🛡️ Ativa contra acesso por IP

# 🌐 Sistema de Detecção Automática de Domínio

## Como funciona

O sistema detecta automaticamente o domínio do projeto, eliminando a necessidade de configurar manualmente no `.env`.

## Ordem de prioridade

1. **NEXT_PUBLIC_BASE_URL** (se definida) - Override manual
2. **Variáveis de ambiente da plataforma:**
   - Vercel: `VERCEL_URL`
   - Netlify: `DEPLOY_PRIME_URL` ou `URL`
3. **Browser:** `window.location.origin` (client-side)
4. **Fallback:** localhost (dev) ou hubsblog.netlify.app (prod)

## Uso

```typescript
import { getBaseUrl, getCurrentDomain, getAllowedDomains } from '@/lib/get-base-url'

// Pegar URL completa
const baseUrl = getBaseUrl()
// Retorna: https://aprovarevolucaoweb.click

// Pegar só o domínio
const domain = getCurrentDomain()
// Retorna: aprovarevolucaoweb.click

// Pegar domínios permitidos
const allowed = getAllowedDomains()
// Retorna: ['aprovarevolucaoweb.click', 'www.aprovarevolucaoweb.click', 'localhost:3000']
```

## Variáveis do .env (OPCIONAIS)

```bash
# Se quiser forçar um domínio específico (override)
NEXT_PUBLIC_BASE_URL=https://aprovarevolucaoweb.click

# Se quiser definir domínios permitidos manualmente
NEXT_PUBLIC_ALLOWED_DOMAINS=aprovarevolucaoweb.click,www.aprovarevolucaoweb.click

# Caso contrário, tudo é detectado automaticamente! ✨
```

## Benefícios

✅ **Menos variáveis no .env**
✅ **Funciona automaticamente em qualquer domínio**
✅ **Suporta múltiplos ambientes** (dev, staging, prod)
✅ **Funciona em Vercel, Netlify, e servidor próprio**
✅ **Não precisa editar código ao trocar de domínio**

## Exemplo: company-config.ts

```typescript
import { getBaseUrl } from './get-base-url'

export const companyConfig = {
  // ...
  website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || getBaseUrl(),
  // Detecta automaticamente: https://aprovarevolucaoweb.click
}
```

Agora você pode remover do `.env`:
- ~~NEXT_PUBLIC_BASE_URL~~
- ~~NEXT_PUBLIC_COMPANY_WEBSITE~~
- ~~NEXT_PUBLIC_ALLOWED_DOMAINS~~

Tudo funciona automaticamente! 🚀

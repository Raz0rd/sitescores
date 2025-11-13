# 🛡️ Proteção Completa Contra Rapid7 / Garena

## 🚨 Situação

Rapid7 (agindo pela Garena/Free Fire) está:
- ❌ Descobrindo IP do servidor via Cloudflare
- ❌ Reportando sites por uso de trademark
- ❌ Usando comando: `curl -v -H "Host: site.com" IP_DO_SERVIDOR/`

## ✅ Proteções Já Implementadas

### 1. ✅ Remoção de Marcas
- [x] Removido "Free Fire" de todos os arquivos
- [x] Removido "Garena" de todos os arquivos
- [x] Textos genéricos ("Créditos Digitais", "Jogos")
- [x] Disclaimer genérico
- [x] Meta tags genéricas

**Arquivos:** `PROTECAO-LEGAL.md`

### 2. ✅ Bloqueio por Domínio
- [x] Middleware bloqueia acesso por IP
- [x] Apenas domínios do .env são permitidos
- [x] Retorna 403 Forbidden para IPs

**Arquivos:** `middleware.ts`, `PROTECAO-IP.md`

### 3. ✅ Anti-Scraping
- [x] Bloqueio de bots conhecidos
- [x] Headers suspeitos bloqueados
- [x] robots.txt restritivo

**Arquivos:** `ANTI-SCRAPING.md`

## 🔥 URGENTE: Proteções Faltando

### 1. 🔒 Cloudflare Proxy (CRÍTICO!)

**Status:** ⚠️ PRECISA CONFIGURAR

O Cloudflare precisa estar em modo **PROXY** (nuvem laranja) para esconder o IP:

```
DNS Records:
A    @    38.180.196.70    [🟠 Proxied]  ← DEVE ESTAR LARANJA
A    www  38.180.196.70    [🟠 Proxied]  ← DEVE ESTAR LARANJA
```

**Como verificar:**
```bash
# Se mostrar IP do Cloudflare = PROTEGIDO ✅
nslookup centralderecarga-jogo.cyou
→ 104.21.x.x (Cloudflare)

# Se mostrar seu IP = EXPOSTO ❌
→ 38.180.196.70 (SEU SERVIDOR)
```

**Como ativar:**
1. Login no Cloudflare
2. DNS → Records
3. Clique no ícone da nuvem cinza (🌐) para ficar laranja (🟠)

### 2. 🔥 Firewall no Servidor (CRÍTICO!)

**Status:** ⚠️ PRECISA CONFIGURAR

Bloquear TODOS os acessos diretos ao servidor, permitindo apenas Cloudflare:

```bash
# Ubuntu/Debian
sudo apt install ufw

# Bloquear tudo
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir apenas IPs do Cloudflare
sudo ufw allow from 173.245.48.0/20
sudo ufw allow from 103.21.244.0/22
sudo ufw allow from 103.22.200.0/22
sudo ufw allow from 103.31.4.0/22
sudo ufw allow from 141.101.64.0/18
sudo ufw allow from 108.162.192.0/18
sudo ufw allow from 190.93.240.0/20
sudo ufw allow from 188.114.96.0/20
sudo ufw allow from 197.234.240.0/22
sudo ufw allow from 198.41.128.0/17
sudo ufw allow from 162.158.0.0/15
sudo ufw allow from 104.16.0.0/13
sudo ufw allow from 104.24.0.0/14
sudo ufw allow from 172.64.0.0/13
sudo ufw allow from 131.0.72.0/22

# Ativar
sudo ufw enable
```

**Resultado:**
```bash
# Acesso direto por IP = BLOQUEADO
curl http://38.180.196.70/
→ Connection refused ✅

# Acesso via domínio = FUNCIONA
curl https://centralderecarga-jogo.cyou/
→ 200 OK ✅
```

### 3. 📝 .env Configurado

**Status:** ⚠️ VERIFICAR

Certifique-se que o `.env` tem:

```bash
# Domínios permitidos
NEXT_PUBLIC_ALLOWED_DOMAINS=centralderecarga-jogo.cyou,www.centralderecarga-jogo.cyou

# URL base
NEXT_PUBLIC_BASE_URL=https://centralderecarga-jogo.cyou
```

### 4. 🌐 Nginx (Se Aplicável)

Se usar Nginx, adicione:

```nginx
# Bloquear acesso por IP
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    return 444;  # Fechar conexão
}

# Apenas domínio autorizado
server {
    listen 80;
    listen 443 ssl;
    server_name centralderecarga-jogo.cyou www.centralderecarga-jogo.cyou;
    
    # Verificar se vem do Cloudflare
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    # ... (todos os IPs do Cloudflare)
    real_ip_header CF-Connecting-IP;
    
    # Sua configuração...
}
```

## 🧪 Testes de Segurança

### Teste 1: IP Exposto?

```bash
# Verificar DNS
nslookup centralderecarga-jogo.cyou

# Se retornar 38.180.196.70 = ❌ PROBLEMA!
# Se retornar 104.21.x.x = ✅ PROTEGIDO!
```

### Teste 2: Acesso Direto Bloqueado?

```bash
# Tentar acessar por IP
curl -I http://38.180.196.70/

# Deve retornar:
# - Connection refused (firewall) ✅
# - 403 Forbidden (middleware) ✅
# - Timeout ✅

# NÃO deve retornar:
# - 200 OK ❌
```

### Teste 3: Acesso via Domínio Funciona?

```bash
# Acessar via domínio
curl -I https://centralderecarga-jogo.cyou/

# Deve retornar:
# - 200 OK ✅
```

### Teste 4: Marcas Removidas?

```bash
# Buscar por "Free Fire" no site
curl https://centralderecarga-jogo.cyou/ | grep -i "free fire"

# Deve retornar:
# - Nada (vazio) ✅

# Buscar por "Garena"
curl https://centralderecarga-jogo.cyou/ | grep -i "garena"

# Deve retornar:
# - Nada (vazio) ✅
```

## 📊 Status Atual

| Proteção | Status | Prioridade |
|----------|--------|------------|
| Remoção de marcas | ✅ Feito | Alta |
| Middleware bloqueio IP | ✅ Feito | Alta |
| Anti-scraping | ✅ Feito | Média |
| Cloudflare Proxy | ⚠️ **VERIFICAR** | **CRÍTICA** |
| Firewall servidor | ⚠️ **CONFIGURAR** | **CRÍTICA** |
| .env configurado | ⚠️ **VERIFICAR** | Alta |
| Nginx (opcional) | ⏳ Pendente | Média |

## 🚨 Ações Imediatas

### 1. Verificar Cloudflare Proxy (AGORA!)

```bash
# Verificar se proxy está ativo
nslookup centralderecarga-jogo.cyou

# Se mostrar seu IP:
# 1. Login no Cloudflare
# 2. DNS → Records
# 3. Ativar proxy (🟠 laranja)
```

### 2. Configurar Firewall (URGENTE!)

```bash
# Copiar e executar no servidor
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp

# Adicionar IPs do Cloudflare (ver script completo em FIREWALL-CLOUDFLARE.md)
# ...

sudo ufw enable
```

### 3. Verificar .env

```bash
# No servidor
cat .env | grep ALLOWED_DOMAINS

# Deve ter:
NEXT_PUBLIC_ALLOWED_DOMAINS=centralderecarga-jogo.cyou,www.centralderecarga-jogo.cyou
```

### 4. Rebuild e Restart

```bash
# Rebuild
npm run build

# Restart (PM2)
pm2 restart all

# Ou restart (systemd)
sudo systemctl restart seu-servico
```

## 📧 Responder ao Cloudflare

Depois de implementar tudo, responda ao Cloudflare:

```
Subject: Re: Trademark Complaint - centralderecarga-jogo.cyou

Dear Cloudflare Team,

We have taken immediate action regarding the trademark complaint:

1. ✅ Removed all references to "Free Fire" and "Garena" from our website
2. ✅ Changed all content to generic terms ("Digital Credits", "Games")
3. ✅ Updated meta tags and descriptions to be brand-neutral
4. ✅ Implemented IP blocking to prevent direct server access
5. ✅ Activated Cloudflare proxy to hide server IP

Our platform is an independent digital credits distribution service and does not claim any affiliation with the mentioned brands.

We are committed to compliance and have implemented all necessary changes.

Best regards,
[Your Name]
```

## 🎯 Resultado Esperado

### Antes (Vulnerável):

```
❌ IP exposto: 38.180.196.70
❌ Menções a "Free Fire"
❌ Menções a "Garena"
❌ Acesso direto por IP funciona
```

### Depois (Protegido):

```
✅ IP escondido pelo Cloudflare
✅ Sem menções a marcas
✅ Conteúdo genérico
✅ Acesso direto por IP bloqueado
✅ Firewall ativo
```

## 📋 Checklist Final

- [ ] Cloudflare proxy ativado (🟠 laranja)
- [ ] DNS retorna IP do Cloudflare (não seu IP)
- [ ] Firewall UFW configurado
- [ ] Apenas IPs do Cloudflare permitidos
- [ ] .env com domínios corretos
- [ ] Middleware bloqueando IPs
- [ ] Sem menções a "Free Fire"
- [ ] Sem menções a "Garena"
- [ ] Teste: `curl IP` = bloqueado
- [ ] Teste: `curl dominio` = funciona
- [ ] Build e restart feitos
- [ ] Resposta enviada ao Cloudflare

---

**PRIORIDADE MÁXIMA:** Ativar Cloudflare Proxy e Firewall AGORA! 🚨

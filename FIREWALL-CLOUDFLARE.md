# 🔥 Firewall: Bloquear Tudo Exceto Cloudflare

## 🎯 Objetivo

Bloquear **TODOS** os acessos diretos ao servidor, permitindo apenas requisições vindas do Cloudflare.

## 🛡️ Ubuntu/Debian (UFW)

### 1. Instalar UFW:

```bash
sudo apt update
sudo apt install ufw
```

### 2. Configurar Regras:

```bash
# Bloquear tudo por padrão
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (IMPORTANTE!)
sudo ufw allow 22/tcp

# Permitir apenas IPs do Cloudflare
# IPv4
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

# IPv6
sudo ufw allow from 2400:cb00::/32
sudo ufw allow from 2606:4700::/32
sudo ufw allow from 2803:f800::/32
sudo ufw allow from 2405:b500::/32
sudo ufw allow from 2405:8100::/32
sudo ufw allow from 2a06:98c0::/29
sudo ufw allow from 2c0f:f248::/32

# Ativar firewall
sudo ufw enable

# Ver status
sudo ufw status
```

### 3. Script Automático:

```bash
#!/bin/bash
# cloudflare-firewall.sh

# Baixar IPs atualizados do Cloudflare
curl -s https://www.cloudflare.com/ips-v4 > /tmp/cf-ips-v4.txt
curl -s https://www.cloudflare.com/ips-v6 > /tmp/cf-ips-v6.txt

# Limpar regras antigas do Cloudflare
sudo ufw --force reset

# Bloquear tudo
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow 22/tcp

# Adicionar IPs do Cloudflare
while read ip; do
  sudo ufw allow from $ip to any port 80,443 proto tcp
done < /tmp/cf-ips-v4.txt

while read ip; do
  sudo ufw allow from $ip to any port 80,443 proto tcp
done < /tmp/cf-ips-v6.txt

# Ativar
sudo ufw --force enable

echo "✅ Firewall configurado! Apenas Cloudflare pode acessar."
```

**Executar:**
```bash
chmod +x cloudflare-firewall.sh
sudo ./cloudflare-firewall.sh
```

## 🔥 Nginx (Camada Extra)

### nginx.conf:

```nginx
# Bloquear acesso direto por IP
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    return 444;  # Fechar conexão sem resposta
}

# Apenas domínio autorizado
server {
    listen 80;
    listen 443 ssl;
    server_name recarregueseujoguinho.shop www.recarregueseujoguinho.shop;
    
    # Verificar se vem do Cloudflare
    set $cloudflare 0;
    
    # IPs do Cloudflare
    if ($http_cf_connecting_ip) {
        set $cloudflare 1;
    }
    
    # Bloquear se não for Cloudflare
    if ($cloudflare = 0) {
        return 403;
    }
    
    # Usar IP real do visitante (do Cloudflare)
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;
    
    # Resto da configuração...
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Aplicar:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Testar Proteção

### 1. Teste Direto (Deve Falhar):

```bash
# Acesso direto por IP
curl -I http://38.180.220.203/
→ ❌ Connection refused / 403 Forbidden

# Com header fake
curl -I -H "Host: recarregueseujoguinho.shop" http://38.180.220.203/
→ ❌ Connection refused / 403 Forbidden
```

### 2. Teste via Cloudflare (Deve Funcionar):

```bash
# Via domínio
curl -I https://recarregueseujoguinho.shop/
→ ✅ 200 OK
```

## 📊 Resultado Final

### Antes (IP Exposto):

```
┌─────────┐
│ Scraper │
└────┬────┘
     │
     │ curl http://38.180.220.203/
     ↓
┌─────────────┐
│ Seu Servidor│ ← ❌ Acesso direto!
│ 38.180.220.203
└─────────────┘
```

### Depois (IP Protegido):

```
┌─────────┐
│ Scraper │
└────┬────┘
     │
     │ curl http://38.180.220.203/
     ↓
┌─────────────┐
│  Firewall   │ ← 🛡️ BLOQUEADO!
│   (UFW)     │
└─────────────┘
     ❌

┌─────────┐
│ Usuário │
└────┬────┘
     │
     │ https://recarregueseujoguinho.shop/
     ↓
┌─────────────┐
│ Cloudflare  │ ← ✅ Proxy
│ 104.21.x.x  │
└──────┬──────┘
       │ (IP escondido)
       ↓
┌─────────────┐
│ Seu Servidor│ ← ✅ Acesso via Cloudflare
│ 38.180.220.203
└─────────────┘
```

## ⚠️ IMPORTANTE

### Antes de Ativar o Firewall:

1. ✅ Certifique-se que o Cloudflare está ativo (proxy ON)
2. ✅ Teste o acesso via domínio primeiro
3. ✅ Mantenha acesso SSH (porta 22) aberto
4. ✅ Tenha acesso físico/console ao servidor (caso algo dê errado)

### Se Travar o Acesso:

```bash
# Via console do servidor
sudo ufw disable
sudo ufw reset
```

## 🎯 Checklist Completo

- [ ] Cloudflare configurado
- [ ] DNS com proxy ativado (🟠)
- [ ] UFW instalado
- [ ] Regras do Cloudflare adicionadas
- [ ] SSH permitido (porta 22)
- [ ] Firewall ativado
- [ ] Nginx configurado (opcional)
- [ ] Testado acesso via domínio
- [ ] Testado bloqueio por IP

---

**Com essas proteções, ninguém consegue acessar seu servidor diretamente pelo IP!** 🛡️🔒

# 🚀 Script para Instalar Sites Next.js

## 📋 Como usar

### 1️⃣ **Instalação no servidor Ubuntu (RECOMENDADO):**

```bash
# Fazer upload dos scripts
scp instalarsite.sh instalar-instalarsitenovo.sh root@seu-servidor:/root/

# Conectar no servidor
ssh root@seu-servidor

# Instalar no PATH
sudo bash instalar-instalarsitenovo.sh

# Recarregar PATH
source ~/.bashrc

# Agora pode usar de qualquer lugar!
instalarsitenovo
```

### 2️⃣ **Uso manual (sem instalar):**

```bash
# Fazer upload do script
scp instalarsite.sh root@seu-servidor:/root/

# Conectar no servidor
ssh root@seu-servidor

# Dar permissão de execução
chmod +x /root/instalarsite.sh

# Executar
sudo bash /root/instalarsite.sh
```

---

## 🎯 **Modos de uso:**

### **Modo Interativo (Recomendado):**

```bash
instalarsitenovo
```

O script vai perguntar:
1. 🌐 **Domínio** (ex: `exemplo.com`)
2. 🔌 **Porta** (sugestão automática de porta disponível)
3. 📁 **Nome do projeto** (sugestão baseada no domínio)
4. 🔗 **URL do repositório Git**
5. 🌿 **Branch**
6. 📧 **Email para SSL** (opcional)

### **Modo com Parâmetros:**

```bash
instalarsitenovo dominio.com 3000 nome-projeto https://github.com/user/repo.git branch
```

**Exemplo:**
```bash
instalarsitenovo free-firesite.shop 3044 ffireshop https://github.com/Raz0rd/presellfgo.git ffireshop
```

---

## ✨ **O que o script faz automaticamente:**

✅ Verifica e instala **Node.js** (v20)  
✅ Verifica e instala **PM2**  
✅ Verifica e instala **Nginx**  
✅ Verifica e instala **Certbot**  
✅ Verifica se o **domínio já existe**  
✅ Verifica **DNS do domínio**  
✅ Lista **portas em uso** e sugere disponível  
✅ Clona o **repositório Git**  
✅ Instala **dependências** (npm install)  
✅ Cria **.env.production** com configurações  
✅ Faz o **build** (npm run build)  
✅ Configura **PM2** com ecosystem.config.js  
✅ Inicia a aplicação com **PM2**  
✅ Configura **PM2 startup** (auto-start)  
✅ Cria configuração do **Nginx**  
✅ Ativa o site no **Nginx**  
✅ Configura **SSL/HTTPS** com Let's Encrypt  
✅ Configura **Firewall** (UFW)  

---

## 🚀 **Exemplo de execução:**

```bash
root@servidor:~# instalarsitenovo

==========================================
   🚀 INSTALADOR DE SITES NEXT.JS
==========================================

📝 Modo Interativo - Responda as perguntas abaixo:

🌐 Domínio (ex: exemplo.com): free-firesite.shop
🔍 Verificando DNS do domínio...
✅ DNS configurado corretamente!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PORTAS EM USO NO SERVIDOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Projetos PM2 e suas portas:
   ✓ site1 → Porta 3000
   ✓ site2 → Porta 3001

💡 Sugestão: Próxima porta disponível é 3002

🔌 Porta para o app (sugestão: 3002): 3044
✅ Porta 3044 disponível!

📁 Nome do projeto (padrão: free-firesite-shop): ffireshop
🔗 URL do repositório Git: https://github.com/Raz0rd/presellfgo.git
🌿 Branch (padrão: baseffshop): ffireshop
📧 Email para SSL (Let's Encrypt): 

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 INSTALAÇÃO AUTOMÁTICA DE SITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Configurações:
   Domain: free-firesite.shop
   Porta: 3044
   Projeto: ffireshop
   Repositório: https://github.com/Raz0rd/presellfgo.git
   Branch: ffireshop
   Diretório: /var/www/ffireshop

Continuar? (y/n) y

✅ Node.js já instalado: v20.x.x
✅ PM2 já instalado: 5.x.x
✅ Nginx já instalado
✅ Certbot já instalado
✅ Repositório clonado
✅ Dependências instaladas
✅ .env.production criado
✅ Build concluído
✅ Aplicação iniciada
✅ PM2 startup configurado
✅ Configuração Nginx criada
✅ Site ativado no Nginx
✅ SSL configurado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Site: https://free-firesite.shop
🌐 WWW: https://www.free-firesite.shop
📁 Diretório: /var/www/ffireshop
🔌 Porta: 3044
📦 PM2 App: ffireshop
```

---

## 📝 **Próximos passos após instalação:**

### 1. Editar variáveis de ambiente:

```bash
sudo nano /var/www/seu-projeto/.env.production
```

**Variáveis importantes para configurar:**
- `EZZPAG_API_AUTH` - Chave de autenticação do gateway
- `UTMIFY_API_TOKEN` - Token da API UTMify
- `NEXT_PUBLIC_GOOGLE_ADS_ID` - ID do Google Ads
- `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` - Label de conversão

### 2. Reiniciar após editar .env:

```bash
sudo pm2 restart seu-projeto
```

### 3. Configurar Cloudflare (se usar):

- **DNS:** A @ → IP do servidor (Proxy ON)
- **DNS:** A www → IP do servidor (Proxy ON)
- **SSL/TLS:** Full (strict)

---

## 🔧 **Comandos úteis:**

```bash
# Ver logs em tempo real
sudo pm2 logs seu-projeto

# Ver logs de erro
sudo pm2 logs seu-projeto --err

# Reiniciar aplicação
sudo pm2 restart seu-projeto

# Parar aplicação
sudo pm2 stop seu-projeto

# Ver status de todos os projetos
sudo pm2 status

# Ver uso de recursos
sudo pm2 monit

# Salvar configuração PM2
sudo pm2 save

# Recarregar Nginx
sudo systemctl reload nginx

# Testar configuração Nginx
sudo nginx -t

# Ver logs do Nginx
sudo tail -f /var/log/nginx/seu-projeto-access.log
sudo tail -f /var/log/nginx/seu-projeto-error.log
```

---

## 🛠️ **Estrutura criada:**

```
/var/www/seu-projeto/
├── .next/                    # Build do Next.js
├── app/                      # Código fonte
├── components/               # Componentes
├── lib/                      # Bibliotecas
├── public/                   # Arquivos públicos
├── logs/                     # Logs da aplicação
│   ├── err.log              # Logs de erro
│   ├── out.log              # Logs de saída
│   └── combined.log         # Logs combinados
├── .env.production          # Variáveis de ambiente
├── ecosystem.config.js      # Configuração PM2
├── package.json             # Dependências
└── next.config.js           # Configuração Next.js
```

---

## ⚠️ **Requisitos:**

- ✅ Ubuntu Server 20.04+ ou 22.04+
- ✅ Acesso root (sudo)
- ✅ Domínio apontando para o servidor
- ✅ Portas 80 e 443 abertas no firewall
- ✅ Git instalado
- ✅ Repositório Git acessível

---

## 🆘 **Troubleshooting:**

### Porta já em uso:
```bash
# Ver qual processo está usando a porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 PID
```

### Build falhou:
```bash
# Limpar cache e reinstalar
cd /var/www/seu-projeto
sudo rm -rf .next node_modules
sudo npm install
sudo npm run build
```

### PM2 não inicia:
```bash
# Ver logs de erro
sudo pm2 logs seu-projeto --err

# Reiniciar PM2
sudo pm2 restart seu-projeto
```

### SSL não funciona:
```bash
# Renovar certificado
sudo certbot renew

# Forçar renovação
sudo certbot renew --force-renewal
```

---

## 📞 **Suporte:**

Para mais informações, consulte a documentação do Next.js, PM2 e Nginx.

**Pronto para usar!** 🚀

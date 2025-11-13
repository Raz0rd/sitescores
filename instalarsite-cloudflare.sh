#!/bin/bash

# Script para instalar sites Next.js no Ubuntu Server com Cloudflare
# NÃO USA CERTBOT - Cloudflare cuida do SSL
# Uso: sudo bash instalarsite-cloudflare.sh

set -e

echo "=========================================="
echo "   🚀 INSTALADOR DE SITES NEXT.JS"
echo "   ☁️  COM CLOUDFLARE SSL"
echo "=========================================="
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
   echo "❌ Por favor, execute como root (sudo bash instalarsite-cloudflare.sh)"
   exit 1
fi

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Modo interativo
echo "📝 Modo Interativo - Responda as perguntas abaixo:"
echo ""

# 1. Pedir domínio
while true; do
    read -p "🌐 Domínio (ex: exemplo.com): " DOMAIN

    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}❌ Domínio não pode ser vazio!${NC}"
        continue
    fi

    # Verificar se domínio aponta para Cloudflare
    echo -e "${BLUE}🔍 Verificando DNS do domínio...${NC}"
    DOMAIN_IP=$(dig +short "$DOMAIN" @8.8.8.8 | head -n1)
    
    if [[ "$DOMAIN_IP" =~ ^104\. ]] || [[ "$DOMAIN_IP" =~ ^172\. ]] || [[ "$DOMAIN_IP" =~ ^188\. ]]; then
        echo -e "${GREEN}✅ Cloudflare detectado! IP: $DOMAIN_IP${NC}"
        break
    else
        echo -e "${YELLOW}⚠️  AVISO: Domínio não parece estar no Cloudflare${NC}"
        echo -e "   IP detectado: ${YELLOW}$DOMAIN_IP${NC}"
        echo ""
        read -p "Continuar mesmo assim? (s/N): " CONTINUAR_DNS
        if [[ "$CONTINUAR_DNS" =~ ^[Ss]$ ]]; then
            break
        fi
    fi
done

# 2. Pedir porta
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 PORTAS EM USO NO SERVIDOR${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Listar portas em uso por projetos PM2
if command -v pm2 &> /dev/null; then
    echo ""
    echo -e "${YELLOW}🔍 Projetos PM2 e suas portas:${NC}"
    pm2 list 2>/dev/null | grep -E "online|stopped" | while read line; do
        PROJECT=$(echo "$line" | awk '{print $2}')
        if [ ! -z "$PROJECT" ] && [ "$PROJECT" != "name" ]; then
            # Tentar encontrar porta no ecosystem.config.js
            PROJECT_DIR="/var/www/$PROJECT"
            if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
                PORT_IN_USE=$(grep -oP 'PORT:\s*\K\d+' "$PROJECT_DIR/ecosystem.config.js" 2>/dev/null | head -1)
                if [ ! -z "$PORT_IN_USE" ]; then
                    echo -e "   ${GREEN}✓${NC} $PROJECT → Porta ${YELLOW}$PORT_IN_USE${NC}"
                fi
            fi
        fi
    done
fi

# Listar todas as portas em uso na faixa 3000-4000
echo ""
echo -e "${YELLOW}🔍 Portas ocupadas (3000-4000):${NC}"
USED_PORTS=$(ss -tlnp 2>/dev/null | grep -oP ':\K(3[0-9]{3}|4000)(?=\s)' | sort -n | uniq)
if [ -z "$USED_PORTS" ]; then
    echo -e "   ${GREEN}Nenhuma porta em uso nesta faixa${NC}"
else
    echo "$USED_PORTS" | while read port; do
        PROCESS=$(lsof -ti:$port 2>/dev/null | xargs -I {} ps -p {} -o comm= 2>/dev/null | head -1)
        if [ -z "$PROCESS" ]; then
            PROCESS="node"
        fi
        echo -e "   ${RED}✗${NC} Porta ${YELLOW}$port${NC} - Processo: ${PROCESS}"
    done
fi

# Sugerir próxima porta disponível
echo ""
NEXT_PORT=3001
# Verificar com ss (mais confiável que lsof)
while ss -tlnp 2>/dev/null | grep -q ":$NEXT_PORT "; do
    NEXT_PORT=$((NEXT_PORT + 1))
    # Evitar loop infinito
    if [ $NEXT_PORT -gt 4000 ]; then
        NEXT_PORT=3001
        break
    fi
done
echo -e "${GREEN}💡 Sugestão: Próxima porta disponível é ${YELLOW}$NEXT_PORT${NC}"
echo ""

while true; do
    read -p "🔌 Porta para o app (sugestão: $NEXT_PORT): " PORT
    PORT=${PORT:-$NEXT_PORT}

    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1024 ] || [ "$PORT" -gt 65535 ]; then
        echo -e "${RED}❌ Porta inválida! Use um número entre 1024 e 65535${NC}"
        continue
    fi

    # Verificar com ss (mais confiável)
    if ss -tlnp 2>/dev/null | grep -q ":$PORT "; then
        echo -e "${RED}❌ Porta $PORT já está em uso${NC}"
        continue
    else
        echo -e "${GREEN}✅ Porta $PORT disponível!${NC}"
        break
    fi
done

# 3. Nome do projeto
PROJECT_NAME=$(echo "$DOMAIN" | sed 's/^www\.//' | sed 's/\./-/g')
read -p "📁 Nome do projeto (padrão: $PROJECT_NAME): " INPUT_PROJECT_NAME
PROJECT_NAME=${INPUT_PROJECT_NAME:-$PROJECT_NAME}

# 4. Repositório e branch
read -p "🔗 URL do repositório Git (padrão: https://github.com/Raz0rd/sitescores.git): " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/Raz0rd/sitescores.git}

read -p "🌿 Branch (padrão: FINAL_NOVO): " BRANCH
BRANCH=${BRANCH:-FINAL_NOVO}

PROJECT_DIR="/var/www/$PROJECT_NAME"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 INSTALAÇÃO AUTOMÁTICA DE SITE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📋 Configurações:${NC}"
echo -e "   Domain: ${YELLOW}$DOMAIN${NC}"
echo -e "   Porta: ${YELLOW}$PORT${NC}"
echo -e "   Projeto: ${YELLOW}$PROJECT_NAME${NC}"
echo -e "   Repositório: ${YELLOW}$REPO_URL${NC}"
echo -e "   Branch: ${YELLOW}$BRANCH${NC}"
echo ""

read -p "Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Instalação cancelada${NC}"
    exit 1
fi

# 1. Verificar Node.js
echo ""
echo -e "${YELLOW}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"

# 2. Verificar PM2
echo ""
echo -e "${YELLOW}📦 Verificando PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2: $(pm2 -v)${NC}"

# 3. Verificar Nginx
echo ""
echo -e "${YELLOW}📦 Verificando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi
echo -e "${GREEN}✅ Nginx instalado${NC}"

# 4. Clonar repositório
echo ""
echo -e "${YELLOW}📥 Clonando repositório...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${RED}⚠️  Diretório já existe!${NC}"
    read -p "Remover e reinstalar? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo rm -rf $PROJECT_DIR
    else
        exit 1
    fi
fi

cd /var/www
sudo git clone $REPO_URL $PROJECT_NAME
cd $PROJECT_DIR
sudo git checkout $BRANCH
echo -e "${GREEN}✅ Repositório clonado${NC}"

# 5. Instalar dependências
echo ""
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
sudo npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 6. Criar .env
echo ""
echo -e "${YELLOW}📝 Criando .env...${NC}"
sudo tee .env > /dev/null <<EOF
# Node
NODE_ENV=production

# URLs
NEXT_PUBLIC_BASE_URL=https://$DOMAIN

# Domínios Permitidos
NEXT_PUBLIC_ALLOWED_DOMAINS=$DOMAIN,www.$DOMAIN

# Cloaker
NEXT_PUBLIC_CLOAKER_TRACKING_ENABLED=false

# Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ENABLED=false
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
NEXT_PUBLIC_GTAG_CONVERSION_COMPRA=XXXXXXXXXXX

# Gateway de Pagamento
PAYMENT_GATEWAY=ezzpag
EZZPAG_API_AUTH=SUA_AUTH_KEY
NITRO_API_KEY=SUA_KEY

# UTMify
UTMIFY_API_TOKEN=SEU_TOKEN
UTMIFY_ENABLED=false
UTMIFY_TEST_MODE=false

# Verificação
NEXT_PUBLIC_ENABLE_USER_VERIFICATION=false
EOF
echo -e "${GREEN}✅ .env criado${NC}"

# 7. Build
echo ""
echo -e "${YELLOW}🔨 Fazendo build...${NC}"
sudo npm run build
echo -e "${GREEN}✅ Build concluído${NC}"

# 8. Criar logs
sudo mkdir -p logs

# 9. Criar ecosystem.config.js
echo ""
echo -e "${YELLOW}📝 Criando ecosystem.config.js...${NC}"
sudo tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: '$PROJECT_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '$PROJECT_DIR/logs/err.log',
    out_file: '$PROJECT_DIR/logs/out.log',
    log_file: '$PROJECT_DIR/logs/combined.log',
    time: true
  }]
}
EOF

# 10. Iniciar PM2
echo ""
echo -e "${YELLOW}🚀 Iniciando com PM2...${NC}"
sudo pm2 start ecosystem.config.js --env production
sudo pm2 save
sudo pm2 startup systemd -u $USER --hp $HOME
echo -e "${GREEN}✅ PM2 configurado${NC}"

# 11. Configurar Nginx (SEM SSL - Cloudflare cuida)
echo ""
echo -e "${YELLOW}📝 Criando configuração Nginx...${NC}"
sudo tee /etc/nginx/sites-available/$PROJECT_NAME > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    access_log /var/log/nginx/$PROJECT_NAME-access.log;
    error_log /var/log/nginx/$PROJECT_NAME-error.log;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 10M;
    gzip on;
}
EOF

sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx configurado${NC}"

# Resumo final
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ INSTALAÇÃO CONCLUÍDA!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🌐 Site:${NC} ${GREEN}https://$DOMAIN${NC}"
echo -e "${BLUE}📁 Diretório:${NC} $PROJECT_DIR"
echo -e "${BLUE}🔌 Porta:${NC} $PORT"
echo ""
echo -e "${YELLOW}⚠️  PRÓXIMOS PASSOS:${NC}"
echo -e "1. Editar .env:"
echo -e "   ${BLUE}sudo nano $PROJECT_DIR/.env${NC}"
echo ""
echo -e "2. Reiniciar:"
echo -e "   ${BLUE}sudo pm2 restart $PROJECT_NAME${NC}"
echo ""
echo -e "3. Cloudflare:"
echo -e "   - DNS: Proxy ON (🟠)"
echo -e "   - SSL/TLS: Flexible"
echo ""
echo -e "${GREEN}🎉 Pronto! Cloudflare cuida do SSL automaticamente!${NC}"
echo ""

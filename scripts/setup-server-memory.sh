#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 CONFIGURAÇÃO DE MEMÓRIA DO SERVIDOR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Criar SWAP de 4GB
echo "📦 Criando SWAP de 4GB..."
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ SWAP adicionado ao /etc/fstab"
fi

# Ajustar swappiness
sudo sysctl vm.swappiness=10
if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    echo "✅ Swappiness configurado"
fi

echo ""
echo "📊 Memória após configuração:"
free -h
echo ""

# 2. Configurar NODE_OPTIONS globalmente
echo "🔧 Configurando NODE_OPTIONS globalmente..."
if ! grep -q 'NODE_OPTIONS' /etc/environment; then
    echo 'NODE_OPTIONS="--max-old-space-size=2048"' | sudo tee -a /etc/environment
    echo "✅ NODE_OPTIONS adicionado"
fi

source /etc/environment

# 3. Atualizar todos os ecosystem.config.js
echo ""
echo "🔄 Atualizando configuração de todos os sites..."

SITES=(
  "cuponeriavirtual-qpon"
  "ffireshop"
  "fireboost-store"
  "free-gamerecargas-site"
  "jogo-recargafreefire-shop"
  "maisacaoproseugame"
  "nacional-acai"
  "promocoes-qpon"
  "novaeradiamantes-qpon"
)

for site in "${SITES[@]}"; do
  SITE_PATH="/var/www/$site"
  ECOSYSTEM_FILE="$SITE_PATH/ecosystem.config.js"
  
  if [ -d "$SITE_PATH" ]; then
    echo "   🔧 Processando $site..."
    
    if [ -f "$ECOSYSTEM_FILE" ]; then
      # Verificar se já tem node_args
      if ! grep -q "node_args" "$ECOSYSTEM_FILE"; then
        # Adicionar node_args após max_memory_restart
        sed -i "/max_memory_restart/a \    node_args: '--max-old-space-size=2048'," "$ECOSYSTEM_FILE"
        echo "      ✅ node_args adicionado"
      else
        echo "      ⏭️  já tem node_args configurado"
      fi
    else
      echo "      ⚠️  ecosystem.config.js não encontrado"
    fi
  else
    echo "   ⏭️  $site não existe"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Status final da memória:"
free -h
echo ""
echo "💡 Próximos passos:"
echo "   1. Reinicie o PM2: pm2 restart all && pm2 save"
echo "   2. Faça o build: cd /var/www/novaeradiamantes-qpon && npm run build"
echo ""

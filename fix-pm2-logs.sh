#!/bin/bash

echo "🔧 Corrigindo logs do PM2..."
echo ""

# Criar diretórios de logs se não existirem
echo "📁 Criando diretórios de logs..."
sudo mkdir -p /var/www/free-gamerecargas-site/logs
sudo mkdir -p /var/www/promocoes-qpon/logs
sudo mkdir -p /var/www/ffestrategia-sbs/logs

# Criar arquivos de log vazios se não existirem
echo "📝 Criando arquivos de log..."

# free-gamerecargas-site
sudo touch /var/www/free-gamerecargas-site/logs/out-3.log
sudo touch /var/www/free-gamerecargas-site/logs/err-3.log
sudo touch /var/www/free-gamerecargas-site/logs/combined-3.log

# promocoes-qpon
sudo touch /var/www/promocoes-qpon/logs/out-2.log
sudo touch /var/www/promocoes-qpon/logs/err-2.log
sudo touch /var/www/promocoes-qpon/logs/combined-2.log

# ffestrategia-sbs (caso precise)
sudo touch /var/www/ffestrategia-sbs/logs/out.log
sudo touch /var/www/ffestrategia-sbs/logs/err.log
sudo touch /var/www/ffestrategia-sbs/logs/combined.log

# Ajustar permissões
echo "🔐 Ajustando permissões..."
sudo chown -R $USER:$USER /var/www/*/logs
sudo chmod -R 755 /var/www/*/logs

echo ""
echo "✅ Logs corrigidos!"
echo ""
echo "Agora você pode rodar: pm2 flush"

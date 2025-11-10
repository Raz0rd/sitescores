#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ATUALIZANDO TODOS OS SITES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Lista de sites e seus branches correspondentes
declare -A SITES_BRANCHES=(
  ["cuponeriavirtual-qpon"]="cuponeriavirtualqpon"
  ["ffireshop"]="ffdiamantestop"
  ["fireboost-store"]="firebooststore"
  ["free-gamerecargas-site"]="freefiregamerecargas"
  ["jogo-recargafreefire-shop"]="jogo-recargafreefireshop"
  ["maisacaoproseugame"]="maisacaoproseugame"
  ["novaeradiamantes-qpon"]="novaeradiamantesqpon"
  ["novaeradiamantes-shop"]="novaeradiamantesshop"
  ["promocoes-qpon"]="promocoesqpon"
  ["recargasdejogos-shop"]="recargasdejogosshop"
)

# Contador de sucessos e falhas
SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_SITES=()

for SITE in "${!SITES_BRANCHES[@]}"; do
  BRANCH="${SITES_BRANCHES[$SITE]}"
  SITE_PATH="/var/www/$SITE"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Processando: $SITE"
  echo "📂 Branch: $BRANCH"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ ! -d "$SITE_PATH" ]; then
    echo "❌ Diretório não encontrado: $SITE_PATH"
    echo ""
    ((FAIL_COUNT++))
    FAILED_SITES+=("$SITE (diretório não encontrado)")
    continue
  fi
  
  cd "$SITE_PATH" || {
    echo "❌ Erro ao acessar $SITE_PATH"
    echo ""
    ((FAIL_COUNT++))
    FAILED_SITES+=("$SITE (erro ao acessar)")
    continue
  }
  
  echo "📍 Diretório atual: $(pwd)"
  echo ""
  
  # 1. Git Pull
  echo "🔄 Fazendo git pull do branch $BRANCH..."
  git fetch origin
  git checkout "$BRANCH" 2>/dev/null || {
    echo "⚠️  Branch $BRANCH não existe, tentando criar..."
    git checkout -b "$BRANCH" "origin/$BRANCH" || {
      echo "❌ Erro ao criar branch $BRANCH"
      ((FAIL_COUNT++))
      FAILED_SITES+=("$SITE (erro no git)")
      continue
    }
  }
  
  # Verificar se há alterações locais
  if [[ -n $(git status -s) ]]; then
    echo "⚠️  Há alterações locais. Fazendo stash..."
    git stash
  fi
  
  git pull origin "$BRANCH" || {
    echo "❌ Erro no git pull"
    ((FAIL_COUNT++))
    FAILED_SITES+=("$SITE (erro no pull)")
    continue
  }
  echo "✅ Git pull concluído"
  echo ""
  
  # 2. NPM Install (se houver package.json modificado)
  if git diff HEAD@{1} HEAD --name-only | grep -q "package.json"; then
    echo "📦 Instalando dependências (package.json foi modificado)..."
    npm install || {
      echo "⚠️  Erro no npm install, continuando..."
    }
    echo ""
  fi
  
  # 3. Build
  echo "🔨 Fazendo build do projeto..."
  npm run build || {
    echo "❌ Erro no build"
    ((FAIL_COUNT++))
    FAILED_SITES+=("$SITE (erro no build)")
    continue
  }
  echo "✅ Build concluído"
  echo ""
  
  # 4. PM2 Restart
  echo "🔄 Reiniciando PM2..."
  pm2 restart "$SITE" || {
    echo "❌ Erro ao reiniciar PM2"
    ((FAIL_COUNT++))
    FAILED_SITES+=("$SITE (erro no PM2)")
    continue
  }
  echo "✅ PM2 reiniciado"
  echo ""
  
  ((SUCCESS_COUNT++))
  echo "✅ $SITE atualizado com sucesso!"
  echo ""
done

# Salvar configuração do PM2
echo "💾 Salvando configuração do PM2..."
pm2 save

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA ATUALIZAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Sucessos: $SUCCESS_COUNT"
echo "❌ Falhas: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
  echo "⚠️  Sites com falha:"
  for FAILED in "${FAILED_SITES[@]}"; do
    echo "   - $FAILED"
  done
  echo ""
fi

echo "📊 Status final do PM2:"
pm2 status

echo ""
echo "✅ Processo concluído!"
echo ""

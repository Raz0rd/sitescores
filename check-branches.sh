#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICANDO BRANCHES DE TODOS OS SITES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Lista de sites
SITES=(
  "cuponeriavirtual-qpon"
  "ffireshop"
  "fireboost-store"
  "free-gamerecargas-site"
  "jogo-recargafreefire-shop"
  "maisacaoproseugame"
  "nacional-acai"
  "novaeradiamantes-qpon"
  "novaeradiamantes-shop"
  "promocoes-qpon"
  "recargasdejogos-shop"
)

printf "%-35s %-30s %-15s\n" "SITE" "BRANCH ATUAL" "STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for SITE in "${SITES[@]}"; do
  SITE_PATH="/var/www/$SITE"
  
  if [ -d "$SITE_PATH" ]; then
    cd "$SITE_PATH" || continue
    
    # Pegar branch atual
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "N/A")
    
    # Verificar se há alterações não commitadas
    if [[ -n $(git status -s 2>/dev/null) ]]; then
      STATUS="⚠️  Modificado"
    else
      STATUS="✅ Limpo"
    fi
    
    printf "%-35s %-30s %-15s\n" "$SITE" "$CURRENT_BRANCH" "$STATUS"
  else
    printf "%-35s %-30s %-15s\n" "$SITE" "❌ Não encontrado" "-"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verificação concluída!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

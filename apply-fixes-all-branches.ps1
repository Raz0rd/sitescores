# Script para aplicar fixes em todos os branches
# Fix 1: UTMify createdAt UTC
# Fix 2: Cookie user_verified

$branches = @(
    "ffdiamantestop",
    "firebooststore",
    "freefiregamerecargas",
    "gmeports",
    "jogo-recargafreefireshop",
    "maisacaoproseugame",
    "novaeradiamantesqpon",
    "recargasdejogosshop"
)

$currentBranch = git branch --show-current

Write-Host "Branch atual: $currentBranch" -ForegroundColor Cyan
Write-Host "Aplicando fixes em $($branches.Count) branches..." -ForegroundColor Yellow
Write-Host ""

foreach ($branch in $branches) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Processando branch: $branch" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # Checkout para o branch
    git checkout $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erro ao fazer checkout para $branch. Pulando..." -ForegroundColor Red
        continue
    }
    
    # Verificar se o arquivo existe
    if (Test-Path "components\UserVerification.tsx") {
        # Aplicar Fix 1: Cookie user_verified
        Write-Host "Aplicando Fix 1: Cookie user_verified..." -ForegroundColor Yellow
        
        $content = Get-Content "components\UserVerification.tsx" -Raw
        
        # Verificar se já tem o fix
        if ($content -match 'user_verified=true') {
            Write-Host "  -> Cookie user_verified já existe. Pulando..." -ForegroundColor Gray
        } else {
            # Aplicar o fix
            $oldPattern = "      document\.cookie = ``referer_verified=true; `${cookieOptions}``\s+\n\s+console\.log\('🍪 \[VERIFICAÇÃO\] Cookies definidos'\)\s+\n\s+console\.log\('   - quiz_completed=true'\)\s+\n\s+console\.log\('   - referer_verified=true'\)"
            
            $newPattern = @"
      document.cookie = ``referer_verified=true; `${cookieOptions}``
      document.cookie = ``user_verified=true; `${cookieOptions}``
      
      console.log('🍪 [VERIFICAÇÃO] Cookies definidos')
      console.log('   - quiz_completed=true')
      console.log('   - referer_verified=true')
      console.log('   - user_verified=true')
"@
            
            $content = $content -replace $oldPattern, $newPattern
            $content | Set-Content "components\UserVerification.tsx" -NoNewline
            Write-Host "  -> Cookie user_verified aplicado!" -ForegroundColor Green
        }
    } else {
        Write-Host "  -> UserVerification.tsx não encontrado" -ForegroundColor Red
    }
    
    # Verificar se o arquivo de check-transaction-status existe
    if (Test-Path "app\api\check-transaction-status\route.ts") {
        # Aplicar Fix 2: UTMify createdAt UTC
        Write-Host "Aplicando Fix 2: UTMify createdAt UTC..." -ForegroundColor Yellow
        
        $content = Get-Content "app\api\check-transaction-status\route.ts" -Raw
        
        # Verificar se já tem o fix
        if ($content -match 'getBrazilTimestamp\(new Date\(storedOrder\.createdAt\)\)') {
            Write-Host "  -> UTMify createdAt UTC já existe. Pulando..." -ForegroundColor Gray
        } else {
            # Fix na linha do createdAt
            $content = $content -replace 'createdAt: storedOrder\.createdAt \|\| getBrazilTimestamp\(\)', 'createdAt: storedOrder.createdAt ? getBrazilTimestamp(new Date(storedOrder.createdAt)) : getBrazilTimestamp()'
            
            # Adicionar logs de debug se não existirem
            if ($content -notmatch 'CreatedAt \(UTC\)') {
                $content = $content -replace "console\.log\(\`\`\[CHECK-STATUS\] .+ Enviando PAID para UTMify:\`\`\)", "console.log(\`\`[CHECK-STATUS] Enviando PAID para UTMify:\`\`)`n          console.log(\`\`   - CreatedAt (UTC): \`\${utmifyData.createdAt}\`\`)`n          console.log(\`\`   - ApprovedDate (UTC): \`\${utmifyData.approvedDate}\`\`)"
            }
            
            $content | Set-Content "app\api\check-transaction-status\route.ts" -NoNewline
            Write-Host "  -> UTMify createdAt UTC aplicado!" -ForegroundColor Green
        }
    } else {
        Write-Host "  -> check-transaction-status/route.ts não encontrado" -ForegroundColor Red
    }
    
    # Verificar se há alterações
    $status = git status --porcelain
    if ($status) {
        Write-Host "Commitando alterações..." -ForegroundColor Yellow
        git add .
        git commit -m "fix: UTMify createdAt UTC + cookie user_verified"
        
        Write-Host "Fazendo push..." -ForegroundColor Yellow
        git push origin $branch
        
        Write-Host "Branch $branch atualizado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Nenhuma alteração necessária em $branch" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Voltar para o branch original
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Voltando para o branch original: $currentBranch" -ForegroundColor Cyan
git checkout $currentBranch

Write-Host ""
Write-Host "Processo concluído!" -ForegroundColor Green
Write-Host "Branches processados: $($branches.Count)" -ForegroundColor Green

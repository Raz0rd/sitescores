# Script para aplicar fix de redirecionamento para /sucesso em todos os branches

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "APLICANDO FIX: Redirecionamento /sucesso" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$branches = @(
    "promocoesqpon",
    "cuponeriavirtualqpon",
    "ffdiamantestop",
    "firebooststore",
    "freefiregamerecargas",
    "jogo-recargafreefireshop",
    "maisacaoproseugame",
    "novaeradiamantesqpon",
    "recargasdejogosshop"
)

$originalBranch = git branch --show-current
Write-Host "Branch atual: $originalBranch" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($branch in $branches) {
    Write-Host "============================================" -ForegroundColor Gray
    Write-Host "Processando: $branch" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Gray
    
    try {
        # Checkout do branch
        git checkout $branch 2>$null | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro ao fazer checkout" -ForegroundColor Red
            $failCount++
            continue
        }
        
        # Copiar os arquivos corretos do novaeradiamantesshop
        Write-Host "  Copiando arquivos do novaeradiamantesshop..." -ForegroundColor Yellow
        git checkout novaeradiamantesshop -- app/checkout/page.tsx 2>$null | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro ao copiar checkout/page.tsx" -ForegroundColor Red
            $failCount++
            continue
        }
        
        git checkout novaeradiamantesshop -- app/sucesso/page.tsx 2>$null | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro ao copiar sucesso/page.tsx" -ForegroundColor Red
            $failCount++
            continue
        }
        
        # Verificar se há alterações
        $status = git status --porcelain
        
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host "  Nenhuma alteracao necessaria" -ForegroundColor Gray
            $successCount++
            continue
        }
        
        # Commit
        Write-Host "  Fazendo commit..." -ForegroundColor Yellow
        git add app/checkout/page.tsx app/sucesso/page.tsx
        git commit -m "fix: Redirecionar para /sucesso interno apos pagamento confirmado" 2>$null | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro no commit" -ForegroundColor Red
            $failCount++
            continue
        }
        
        # Push
        Write-Host "  Fazendo push..." -ForegroundColor Yellow
        git push origin $branch 2>$null | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro no push" -ForegroundColor Red
            $failCount++
            continue
        }
        
        Write-Host "  OK - Branch atualizado!" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "  Erro: $_" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

# Voltar para o branch original
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Voltando para: $originalBranch" -ForegroundColor Yellow
git checkout $originalBranch 2>$null | Out-Null
Write-Host ""

# Resumo
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Sucessos: $successCount" -ForegroundColor Green
Write-Host "Falhas: $failCount" -ForegroundColor Red
Write-Host ""
Write-Host "Processo concluido!" -ForegroundColor Green

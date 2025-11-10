# Script para aplicar fixes em todos os branches

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "APLICANDO FIXES EM TODOS OS BRANCHES" -ForegroundColor Cyan
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
    "novaeradiamantesshop",
    "recargasdejogosshop"
)

$sourceBranch = "novaeradiamantesqpon"
$originalBranch = git branch --show-current

Write-Host "Branch atual: $originalBranch" -ForegroundColor Yellow
Write-Host "Copiando de: $sourceBranch" -ForegroundColor Yellow
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
        
        # Copiar os arquivos do branch source
        Write-Host "  Copiando arquivos..." -ForegroundColor Yellow
        
        git checkout $sourceBranch -- app/checkout/page.tsx 2>$null | Out-Null
        git checkout $sourceBranch -- app/sucesso/page.tsx 2>$null | Out-Null
        git checkout $sourceBranch -- components/UserVerification.tsx 2>$null | Out-Null
        git checkout $sourceBranch -- components/GoogleConversionTest.tsx 2>$null | Out-Null
        git checkout $sourceBranch -- .env.example 2>$null | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro ao copiar arquivos" -ForegroundColor Red
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
        git add app/checkout/page.tsx app/sucesso/page.tsx components/UserVerification.tsx components/GoogleConversionTest.tsx .env.example
        git commit -m "fix: Corrigir flash de verificacao, adicionar cookie user_verified, validacao de email e botao teste conversao" 2>$null | Out-Null
        
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

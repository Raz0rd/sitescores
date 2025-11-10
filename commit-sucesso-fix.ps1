# Script para aplicar fix de redirecionamento para /sucesso em todos os branches

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "APLICANDO FIX: Redirecionamento /sucesso" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Lista de branches
$branches = @(
    "promocoesqpon",
    "cuponeriavirtualqpon",
    "ffdiamantestop",
    "firebooststore",
    "freefiregamerecargas",
    "jogo-recargafreefireshop",
    "maisacaoproseugame",
    "novaeradiamantesqpon",
    "novaeradiamantesshop",
    "recargasdejogosshop"
)

# Mensagem de commit
$commitMessage = "fix: Redirecionar para /sucesso interno apos pagamento confirmado"

# Salvar branch atual
$originalBranch = git branch --show-current
Write-Host "Branch atual: $originalBranch" -ForegroundColor Yellow
Write-Host ""

# Contador
$successCount = 0
$failCount = 0
$failedBranches = @()

foreach ($branch in $branches) {
    Write-Host "============================================" -ForegroundColor Gray
    Write-Host "Processando branch: $branch" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Gray
    
    try {
        # Fazer checkout do branch
        Write-Host "  Fazendo checkout..." -ForegroundColor Yellow
        $checkoutOutput = git checkout $branch 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro ao fazer checkout: $checkoutOutput" -ForegroundColor Red
            $failCount++
            $failedBranches += "$branch (erro no checkout)"
            continue
        }
        
        # Verificar se os arquivos existem
        $checkoutPageExists = Test-Path "app\checkout\page.tsx"
        $sucessoPageExists = Test-Path "app\sucesso\page.tsx"
        
        if (-not $checkoutPageExists) {
            Write-Host "  app\checkout\page.tsx nao encontrado, pulando..." -ForegroundColor Yellow
            $failCount++
            $failedBranches += "$branch (checkout page nao encontrado)"
            continue
        }
        
        if (-not $sucessoPageExists) {
            Write-Host "  app\sucesso\page.tsx nao encontrado, pulando..." -ForegroundColor Yellow
            $failCount++
            $failedBranches += "$branch (sucesso page nao encontrado)"
            continue
        }
        
        # Verificar se há alterações
        $status = git status --porcelain
        
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host "  Nenhuma alteracao detectada neste branch" -ForegroundColor Gray
            $successCount++
            continue
        }
        
        # Adicionar apenas os arquivos específicos
        Write-Host "  Adicionando arquivos..." -ForegroundColor Yellow
        git add app/checkout/page.tsx
        git add app/sucesso/page.tsx
        
        # Fazer commit
        Write-Host "  Fazendo commit..." -ForegroundColor Yellow
        $commitOutput = git commit -m $commitMessage 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            if ($commitOutput -like "*nothing to commit*") {
                Write-Host "  Nada para commitar" -ForegroundColor Yellow
                $successCount++
                continue
            } else {
                Write-Host "  Erro no commit: $commitOutput" -ForegroundColor Red
                $failCount++
                $failedBranches += "$branch (erro no commit)"
                continue
            }
        }
        
        # Fazer push
        Write-Host "  Fazendo push..." -ForegroundColor Yellow
        $pushOutput = git push origin $branch 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  Erro no push: $pushOutput" -ForegroundColor Red
            $failCount++
            $failedBranches += "$branch (erro no push)"
            continue
        }
        
        Write-Host "  Branch $branch atualizado com sucesso!" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "  Erro ao processar branch: $_" -ForegroundColor Red
        $failCount++
        $failedBranches += "$branch ($_)"
    }
    
    Write-Host ""
}

# Voltar para o branch original
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Voltando para branch original: $originalBranch" -ForegroundColor Yellow
git checkout $originalBranch 2>$null
Write-Host ""

# Resumo
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESUMO DA OPERACAO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Sucessos: $successCount" -ForegroundColor Green
Write-Host "Falhas: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "Branches com falha:" -ForegroundColor Yellow
    foreach ($failed in $failedBranches) {
        Write-Host "   - $failed" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Processo concluido!" -ForegroundColor Green
Write-Host ""

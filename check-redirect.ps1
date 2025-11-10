# Script para verificar redirecionamento em todos os branches

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

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "VERIFICANDO REDIRECIONAMENTO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$needsFix = @()
$alreadyFixed = @()

foreach ($branch in $branches) {
    git checkout $branch 2>$null | Out-Null
    
    if (Test-Path "app\checkout\page.tsx") {
        $content = Get-Content "app\checkout\page.tsx" -Raw
        
        if ($content -match "const sucessoUrl = new URL\('/sucesso', window\.location\.origin\)") {
            Write-Host "$branch : OK (redireciona para /sucesso interno)" -ForegroundColor Green
            $alreadyFixed += $branch
        } elseif ($content -match "whitePageUrl") {
            Write-Host "$branch : PRECISA CORRIGIR (usa whitepage externa)" -ForegroundColor Red
            $needsFix += $branch
        } else {
            Write-Host "$branch : DESCONHECIDO" -ForegroundColor Yellow
        }
    } else {
        Write-Host "$branch : ARQUIVO NAO ENCONTRADO" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "RESUMO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "OK: $($alreadyFixed.Count)" -ForegroundColor Green
Write-Host "Precisam corrigir: $($needsFix.Count)" -ForegroundColor Red
Write-Host ""

if ($needsFix.Count -gt 0) {
    Write-Host "Branches que precisam corrigir:" -ForegroundColor Yellow
    foreach ($b in $needsFix) {
        Write-Host "  - $b" -ForegroundColor Red
    }
}

# Script para eliminar archivos sensibles del historial de Git
# IMPORTANTE: Este script elimina archivos del historial de Git
# Ejecuta esto solo si estás seguro de que quieres eliminar estos archivos permanentemente

Write-Host "===========================================" -ForegroundColor Yellow
Write-Host "Eliminando archivos sensibles del historial de Git" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

# Lista de archivos a eliminar
$filesToRemove = @(
    "VERCEL_DEPLOYMENT_GUIDE.md",
    "add-all-env-vars.ps1",
    "check-and-add-missing-env.ps1",
    "check-and-inject-env.ps1",
    "deploy-vercel-complete.ps1",
    "deploy-vercel-updated.ps1",
    "inject-env-vercel.ps1"
)

Write-Host "Archivos que se eliminarán del historial:" -ForegroundColor Cyan
foreach ($file in $filesToRemove) {
    Write-Host "  - $file" -ForegroundColor Gray
}
Write-Host ""

# Verificar si git-filter-repo está instalado
$hasFilterRepo = git filter-repo --version 2>$null
if (-not $hasFilterRepo) {
    Write-Host "ADVERTENCIA: git-filter-repo no está instalado." -ForegroundColor Yellow
    Write-Host "Instalando git-filter-repo..." -ForegroundColor Yellow
    pip install git-filter-repo
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudo instalar git-filter-repo." -ForegroundColor Red
        Write-Host "Por favor, instálalo manualmente: pip install git-filter-repo" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "¿Estás seguro de que quieres eliminar estos archivos del historial de Git?" -ForegroundColor Red
Write-Host "Esta operación NO se puede deshacer fácilmente." -ForegroundColor Red

# Permitir confirmación automática si se pasa como parámetro
if ($args[0] -eq "--auto-confirm") {
    $confirmation = "SI"
    Write-Host "Confirmación automática activada." -ForegroundColor Green
} else {
    $confirmation = Read-Host "Escribe 'SI' para continuar"
}

if ($confirmation -ne "SI") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Eliminando archivos del historial..." -ForegroundColor Green

# Construir el comando de git-filter-repo
$pathsToRemove = $filesToRemove -join " "
$filterCommand = "git filter-repo --path $($filesToRemove[0])"

foreach ($file in $filesToRemove[1..($filesToRemove.Length-1)]) {
    $filterCommand += " --path $file"
}

$filterCommand += " --invert-paths --force"

Write-Host "Ejecutando: $filterCommand" -ForegroundColor Gray
Invoke-Expression $filterCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "Archivos eliminados exitosamente del historial" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Ahora debes hacer force push a GitHub:" -ForegroundColor Yellow
    Write-Host "  git push origin --force --all" -ForegroundColor Cyan
    Write-Host "  git push origin --force --tags" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ADVERTENCIA: El force push sobrescribirá el historial en GitHub." -ForegroundColor Red
    Write-Host "Asegúrate de que todos los colaboradores estén informados." -ForegroundColor Red
} else {
    Write-Host ""
    Write-Host "ERROR: Hubo un problema al eliminar los archivos." -ForegroundColor Red
    Write-Host "Verifica los mensajes de error arriba." -ForegroundColor Red
    exit 1
}


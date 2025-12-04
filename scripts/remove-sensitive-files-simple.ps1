# Script simple para eliminar archivos sensibles del historial de Git
# Usa git filter-branch (incluido con Git por defecto)

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

Write-Host "ADVERTENCIA: Esta operación modificará el historial de Git." -ForegroundColor Red
Write-Host "Asegúrate de hacer backup antes de continuar." -ForegroundColor Red
Write-Host ""

# Permitir confirmación automática si se pasa como parámetro
if ($args[0] -eq "--auto-confirm") {
    $confirmation = "SI"
    Write-Host "Confirmación automática activada." -ForegroundColor Green
} else {
    $confirmation = Read-Host "¿Estás seguro? Escribe 'SI' para continuar"
}

if ($confirmation -ne "SI") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Eliminando archivos del historial usando git filter-branch..." -ForegroundColor Green

# Crear expresión para git filter-branch
$pathsExpression = ""
foreach ($file in $filesToRemove) {
    if ($pathsExpression) {
        $pathsExpression += " -o "
    }
    $pathsExpression += "`"$file`""
}

# Ejecutar git filter-branch
$filterCommand = "git filter-branch --force --index-filter `"git rm --cached --ignore-unmatch $($filesToRemove -join ' ')`" --prune-empty --tag-name-filter cat -- --all"

Write-Host "Ejecutando git filter-branch..." -ForegroundColor Gray
Invoke-Expression $filterCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "Archivos eliminados exitosamente del historial" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Limpiando referencias..." -ForegroundColor Yellow
    
    # Limpiar referencias
    git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    Write-Host ""
    Write-Host "IMPORTANTE: Ahora debes hacer force push a GitHub:" -ForegroundColor Yellow
    Write-Host "  git push origin --force --all" -ForegroundColor Cyan
    Write-Host "  git push origin --force --tags" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ADVERTENCIA: El force push sobrescribirá el historial en GitHub." -ForegroundColor Red
    Write-Host "Asegúrate de que todos los colaboradores estén informados." -ForegroundColor Red
    Write-Host "Todos los colaboradores necesitarán hacer: git fetch origin && git reset --hard origin/main" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "ERROR: Hubo un problema al eliminar los archivos." -ForegroundColor Red
    Write-Host "Verifica los mensajes de error arriba." -ForegroundColor Red
    exit 1
}


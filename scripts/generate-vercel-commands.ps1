# ============================================
# Generar Comandos de Vercel CLI Automáticamente
# ============================================
# Este script genera un archivo con comandos para configurar
# variables de entorno en Vercel sin requerir interacción
#
# Uso:
#   .\scripts\generate-vercel-commands.ps1
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Generando Comandos de Vercel CLI" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Leer variables desde env.example
$envExamplePath = Join-Path $PSScriptRoot "..\env.example"
$envLocalPath = Join-Path $PSScriptRoot "..\.env.local"

$envFile = if (Test-Path $envLocalPath) { $envLocalPath } else { $envExamplePath }

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: No se encontro env.example ni .env.local" -ForegroundColor Red
    Write-Host "   Buscando en: $envExamplePath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Leyendo variables desde: $envFile" -ForegroundColor Yellow
Write-Host ""

# Categorías de variables
$categories = @{
    "Frontend (NEXT_PUBLIC_*)" = @()
    "Backend API Keys" = @()
    "Smart Contracts" = @()
    "RPC & Network" = @()
    "Gelato" = @()
    "AI Services" = @()
    "Database" = @()
    "Security" = @()
    "Chainlink" = @()
    "Other" = @()
}

# Leer y categorizar variables
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    
    # Saltar comentarios y líneas vacías
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        return
    }
    
    # Extraer variable y valor
    if ($line -match '^([A-Z_]+)=(.*)$') {
        $varName = $matches[1]
        $varValue = $matches[2]
        
        # Determinar categoría
        $category = "Other"
        if ($varName -match '^NEXT_PUBLIC_') {
            $category = "Frontend (NEXT_PUBLIC_*)"
        } elseif ($varName -match '(GEMINI|GROQ|OPENROUTER|HUGGINGFACE)_API_KEY') {
            $category = "AI Services"
        } elseif ($varName -match 'GELATO_') {
            $category = "Gelato"
        } elseif ($varName -match '(RPC_URL|CHAIN_ID|OPBNB_)') {
            $category = "RPC & Network"
        } elseif ($varName -match '(_ADDRESS|_CONTRACT)') {
            $category = "Smart Contracts"
        } elseif ($varName -match 'DATABASE_URL|PRISMA_') {
            $category = "Database"
        } elseif ($varName -match '(CRON_SECRET|JWT_SECRET|PRIVATE_KEY)') {
            $category = "Security"
        } elseif ($varName -match 'CHAINLINK_') {
            $category = "Chainlink"
        } elseif ($varName -match '(THIRDWEB|BACKEND_URL|PORT|CORS)') {
            $category = "Backend API Keys"
        }
        
        $categories[$category] += @{
            Name = $varName
            Value = $varValue
        }
    }
}

# Generar archivo de comandos
$outputFile = Join-Path $PSScriptRoot "..\vercel-env-commands.txt"
$commands = @()
$commands += "# ============================================"
$commands += "# Comandos para configurar variables en Vercel"
$commands += "# ============================================"
$commands += "# Generado automáticamente el $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$commands += "#"
$commands += "# INSTRUCCIONES:"
$commands += "# 1. Revisa cada comando y actualiza los valores [CONFIGURAR_EN_VERCEL]"
$commands += "# 2. Ejecuta los comandos uno por uno:"
$commands += "#    vercel env add VARIABLE_NAME production"
$commands += "# 3. O mejor aún, usa el Dashboard de Vercel:"
$commands += "#    https://vercel.com/dashboard -> Tu Proyecto -> Settings -> Environment Variables"
$commands += "# ============================================"
$commands += ""

$totalVars = 0

foreach ($category in $categories.Keys) {
    if ($categories[$category].Count -gt 0) {
        $commands += ""
        $commands += "# ============================================"
        $commands += "# $category"
        $commands += "# ============================================"
        $commands += ""
        
        foreach ($var in $categories[$category]) {
            $value = $var.Value
            # Reemplazar valores de ejemplo con placeholders seguros
            if ($value -match 'your_.*_here|change.*production|localhost') {
                $value = "[CONFIGURAR_EN_VERCEL]"
            }
            # Ocultar valores sensibles pero mostrar formato
            if ($var.Name -match '(API_KEY|SECRET|PRIVATE_KEY|PASSWORD|DATABASE_URL)') {
                if ($value -notmatch '\[CONFIGURAR') {
                    # Mostrar solo el formato si tiene un valor de ejemplo
                    $value = "[OCULTO - Configurar en Vercel Dashboard]"
                }
            }
            
            $commands += "# Variable: $($var.Name)"
            $commands += "vercel env add $($var.Name) production"
            if ($value -notmatch '^\s*$') {
                $commands += "# Valor sugerido/ejemplo: $value"
            }
            $commands += ""
            
            $totalVars++
        }
    }
}

$commands += ""
$commands += "# ============================================"
$commands += "# Total: $totalVars variables"
$commands += "# ============================================"
$commands += ""
$commands += "# NOTA: Después de configurar las variables, redespliega el proyecto:"
$commands += "# vercel --prod"

# Guardar archivo
$commands | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "SUCCESS: Archivo generado exitosamente!" -ForegroundColor Green
Write-Host "   Ubicación: $outputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumen:" -ForegroundColor Yellow
Write-Host "   Total de variables: $totalVars" -ForegroundColor White
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abre el archivo: vercel-env-commands.txt" -ForegroundColor White
Write-Host "   2. Revisa los comandos generados" -ForegroundColor White
Write-Host "   3. Configura las variables en Vercel Dashboard (recomendado)" -ForegroundColor White
Write-Host "      O ejecuta los comandos uno por uno" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard de Vercel:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/dashboard -> Tu Proyecto -> Settings -> Environment Variables" -ForegroundColor White
Write-Host ""


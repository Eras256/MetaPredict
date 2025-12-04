# Script para verificar y corregir direcciones en archivos .env
# Este script asegura que todas las direcciones estén correctas

Write-Host "🔍 Verificando y corrigiendo direcciones en archivos .env..." -ForegroundColor Cyan
Write-Host ""

# Direcciones correctas desde el Core Contract
$correctAddresses = @{
    "NEXT_PUBLIC_CORE_CONTRACT_ADDRESS" = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC"
    "NEXT_PUBLIC_BINARY_MARKET_ADDRESS" = "0x44bF3De950526d5BDbfaA284F6430c72Ea99163B"
    "NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS" = "0x45E223eAB99761A7E60eF7690420C178FEBD23df"
    "NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS" = "0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE"
    "NEXT_PUBLIC_AI_ORACLE_ADDRESS" = "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c"
    "NEXT_PUBLIC_INSURANCE_POOL_ADDRESS" = "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA"
    "NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS" = "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7"
    "NEXT_PUBLIC_OMNI_ROUTER_ADDRESS" = "0x11C1124384e463d99Ba84348280e318FbeE544d0"
    "NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS" = "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123"
    "CORE_CONTRACT_ADDRESS" = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC"
    "BINARY_MARKET_ADDRESS" = "0x44bF3De950526d5BDbfaA284F6430c72Ea99163B"
    "CONDITIONAL_MARKET_ADDRESS" = "0x45E223eAB99761A7E60eF7690420C178FEBD23df"
    "SUBJECTIVE_MARKET_ADDRESS" = "0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE"
}

# Direcciones antiguas que deben ser reemplazadas
$oldAddresses = @{
    "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1" = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC"
    "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d" = "0x44bF3De950526d5BDbfaA284F6430c72Ea99163B"
    "0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741" = "0x45E223eAB99761A7E60eF7690420C178FEBD23df"
    "0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8" = "0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE"
    "0x0bb2643ace44bbb4fdcc3a4fc50eecbe3ab4a76b" = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC"
    "0x46ca523e51783a378fba0d06d05929652d04b19e" = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC"
}

function Update-EnvFile {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "📝 Creando $Description..." -ForegroundColor Yellow
        $content = Get-Content "env.example" -ErrorAction SilentlyContinue
        if ($content) {
            $content | Set-Content $FilePath
            Write-Host "   ✅ Archivo creado desde env.example" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  No se pudo crear desde env.example (no existe)" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "📝 Verificando $Description..." -ForegroundColor Yellow
    }
    
    $content = Get-Content $FilePath
    $updated = $false
    $newContent = @()
    
    foreach ($line in $content) {
        $originalLine = $line
        $updatedLine = $line
        
        # Verificar cada variable de dirección
        foreach ($varName in $correctAddresses.Keys) {
            if ($line -match "^$varName\s*=") {
                $currentValue = ($line -split "=")[1].Trim().Trim('"').Trim("'")
                $correctValue = $correctAddresses[$varName]
                
                # Verificar si es una dirección antigua
                if ($oldAddresses.ContainsKey($currentValue)) {
                    Write-Host "   ⚠️  $varName tiene dirección antigua: $currentValue" -ForegroundColor Yellow
                    $updatedLine = "$varName=$correctValue"
                    $updated = $true
                } elseif ($currentValue -ne $correctValue) {
                    Write-Host "   ⚠️  $varName tiene dirección incorrecta: $currentValue" -ForegroundColor Yellow
                    Write-Host "      Corrigiendo a: $correctValue" -ForegroundColor Green
                    $updatedLine = "$varName=$correctValue"
                    $updated = $true
                }
            }
        }
        
        # También buscar y reemplazar direcciones antiguas en cualquier línea
        foreach ($oldAddr in $oldAddresses.Keys) {
            if ($updatedLine -match $oldAddr) {
                $updatedLine = $updatedLine -replace [regex]::Escape($oldAddr), $oldAddresses[$oldAddr]
                if ($updatedLine -ne $originalLine) {
                    Write-Host "   ⚠️  Reemplazando dirección antigua en línea: $($line.Substring(0, [Math]::Min(50, $line.Length)))..." -ForegroundColor Yellow
                    $updated = $true
                }
            }
        }
        
        $newContent += $updatedLine
    }
    
    if ($updated) {
        $newContent | Set-Content $FilePath
        Write-Host "   ✅ Archivo actualizado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   ✅ Todas las direcciones son correctas" -ForegroundColor Green
        return $false
    }
}

# Verificar y corregir archivos
$filesUpdated = $false

Write-Host "📋 Verificando archivos .env..." -ForegroundColor Cyan
Write-Host ""

# Frontend .env.local
if (Test-Path "frontend\.env.local") {
    if (Update-EnvFile "frontend\.env.local" "frontend/.env.local") {
        $filesUpdated = $true
    }
} else {
    Write-Host "📝 frontend/.env.local no existe - creando desde env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" "frontend\.env.local"
        # Actualizar las direcciones en el nuevo archivo
        Update-EnvFile "frontend\.env.local" "frontend/.env.local" | Out-Null
        Write-Host "   ✅ Archivo creado y actualizado" -ForegroundColor Green
        $filesUpdated = $true
    }
}

Write-Host ""

# Root .env
if (Test-Path ".env") {
    if (Update-EnvFile ".env" ".env (root)") {
        $filesUpdated = $true
    }
} else {
    Write-Host "📝 .env (root) no existe - creando desde env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        # Actualizar las direcciones en el nuevo archivo
        Update-EnvFile ".env" ".env (root)" | Out-Null
        Write-Host "   ✅ Archivo creado y actualizado" -ForegroundColor Green
        $filesUpdated = $true
    }
}

Write-Host ""

# Smart contracts .env
if (Test-Path "smart-contracts\.env") {
    if (Update-EnvFile "smart-contracts\.env" "smart-contracts/.env") {
        $filesUpdated = $true
    }
} else {
    Write-Host "📝 smart-contracts/.env no existe - creando desde env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" "smart-contracts\.env"
        # Actualizar las direcciones en el nuevo archivo
        Update-EnvFile "smart-contracts\.env" "smart-contracts/.env" | Out-Null
        Write-Host "   ✅ Archivo creado y actualizado" -ForegroundColor Green
        $filesUpdated = $true
    }
}

Write-Host ""
Write-Host "✅ Verificación completada!" -ForegroundColor Green
Write-Host ""

if ($filesUpdated) {
    Write-Host "📋 Resumen:" -ForegroundColor Cyan
    Write-Host "   Se actualizaron archivos .env con las direcciones correctas" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "   1. Reinicia el servidor de desarrollo si está corriendo" -ForegroundColor White
    Write-Host "   2. Verifica que el frontend use las direcciones correctas" -ForegroundColor White
    Write-Host "   3. Prueba crear un mercado y apostar nuevamente" -ForegroundColor White
} else {
    Write-Host "✅ Todas las direcciones ya están correctas" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Direcciones correctas configuradas:" -ForegroundColor Cyan
Write-Host "   CORE_CONTRACT: $($correctAddresses['NEXT_PUBLIC_CORE_CONTRACT_ADDRESS'])" -ForegroundColor White
Write-Host "   BINARY_MARKET: $($correctAddresses['NEXT_PUBLIC_BINARY_MARKET_ADDRESS'])" -ForegroundColor White
Write-Host "   CONDITIONAL_MARKET: $($correctAddresses['NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS'])" -ForegroundColor White
Write-Host "   SUBJECTIVE_MARKET: $($correctAddresses['NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS'])" -ForegroundColor White


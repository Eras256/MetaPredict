# Script para actualizar direcciones de contratos en .env.local
# Nuevo Core Contract desplegado: 0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99

$envFile = "frontend\.env.local"
$newAddresses = @{
    "NEXT_PUBLIC_CORE_CONTRACT_ADDRESS" = "0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99"
    "NEXT_PUBLIC_BINARY_MARKET_ADDRESS" = "0x68aEea03664707f152652F9562868CCF87C0962C"
    "NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS" = "0x547FC8C5680B7c4ed05da93c635B6b9B83e12007"
    "NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS" = "0x9a9c478BFdC45E2612f61726863AC1b6422217Ea"
}

Write-Host "🔄 Actualizando direcciones en $envFile..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    $updated = $false
    
    foreach ($key in $newAddresses.Keys) {
        $newValue = $newAddresses[$key]
        $pattern = "($key=)([^\r\n]+)"
        
        if ($content -match $pattern) {
            $oldValue = $matches[2]
            if ($oldValue -ne $newValue) {
                $content = $content -replace $pattern, "`$1$newValue"
                Write-Host "  ✅ $key" -ForegroundColor Green
                Write-Host "     Antes: $oldValue" -ForegroundColor Gray
                Write-Host "     Ahora: $newValue" -ForegroundColor Green
                $updated = $true
            } else {
                Write-Host "  ⏭️  $key (ya está actualizado)" -ForegroundColor Yellow
            }
        } else {
            # Agregar nueva variable si no existe
            $content += "`n$key=$newValue"
            Write-Host "  ➕ $key (agregado)" -ForegroundColor Cyan
            $updated = $true
        }
    }
    
    if ($updated) {
        Set-Content -Path $envFile -Value $content -NoNewline
        Write-Host ""
        Write-Host "✅ Archivo actualizado exitosamente!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "ℹ️  Todas las direcciones ya estaban actualizadas" -ForegroundColor Blue
    }
} else {
    Write-Host "❌ Archivo $envFile no encontrado" -ForegroundColor Red
    Write-Host "   Creando archivo nuevo..." -ForegroundColor Yellow
    
    $newContent = "# Direcciones actualizadas: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
    $newContent += "# Nuevo Core Contract con corrección placeBet`n`n"
    
    foreach ($key in $newAddresses.Keys) {
        $newContent += "$key=$($newAddresses[$key])`n"
    }
    
    Set-Content -Path $envFile -Value $newContent
    Write-Host "✅ Archivo creado exitosamente!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Nuevas direcciones:" -ForegroundColor Cyan
Write-Host "   Core Contract: $($newAddresses['NEXT_PUBLIC_CORE_CONTRACT_ADDRESS'])" -ForegroundColor White
Write-Host "   Binary Market: $($newAddresses['NEXT_PUBLIC_BINARY_MARKET_ADDRESS'])" -ForegroundColor White
Write-Host "   Conditional Market: $($newAddresses['NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS'])" -ForegroundColor White
Write-Host "   Subjective Market: $($newAddresses['NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS'])" -ForegroundColor White
Write-Host ""




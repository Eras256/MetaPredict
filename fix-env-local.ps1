# Script mejorado para actualizar direcciones en .env.local
# Maneja variables comentadas y las descomenta/actualiza

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
    $lines = Get-Content $envFile
    $updated = $false
    $newLines = @()
    
    foreach ($line in $lines) {
        $lineProcessed = $false
        
        foreach ($key in $newAddresses.Keys) {
            $newValue = $newAddresses[$key]
            
            # Buscar línea comentada o no comentada con esta variable
            if ($line -match "^\s*#?\s*$key\s*=\s*(.+)$") {
                $oldValue = $matches[1].Trim()
                
                # Si el valor es diferente o está comentado, actualizar
                if ($oldValue -ne $newValue -or $line.TrimStart().StartsWith("#")) {
                    $newLines += "$key=$newValue"
                    Write-Host "  ✅ $key" -ForegroundColor Green
                    if ($line.TrimStart().StartsWith("#")) {
                        Write-Host "     (descomentado y actualizado)" -ForegroundColor Yellow
                    } else {
                        Write-Host "     Antes: $oldValue" -ForegroundColor Gray
                    }
                    Write-Host "     Ahora: $newValue" -ForegroundColor Green
                    $updated = $true
                    $lineProcessed = $true
                    break
                } else {
                    # Ya está correcto, mantener la línea
                    $newLines += $line
                    $lineProcessed = $true
                    break
                }
            }
        }
        
        # Si la línea no fue procesada, mantenerla tal cual
        if (-not $lineProcessed) {
            $newLines += $line
        }
    }
    
    # Verificar si faltan variables
    $content = $newLines -join "`n"
    foreach ($key in $newAddresses.Keys) {
        if ($content -notmatch "^\s*$key\s*=") {
            # Variable no existe, agregarla al final
            $newLines += "$key=$($newAddresses[$key])"
            Write-Host "  ➕ $key (agregado)" -ForegroundColor Cyan
            $updated = $true
        }
    }
    
    if ($updated) {
        Set-Content -Path $envFile -Value ($newLines -join "`n")
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
Write-Host "💡 IMPORTANTE: Reinicia el servidor de desarrollo de Next.js para que los cambios surtan efecto" -ForegroundColor Yellow
Write-Host "   Ejecuta: cd frontend && pnpm dev" -ForegroundColor Yellow
Write-Host ""




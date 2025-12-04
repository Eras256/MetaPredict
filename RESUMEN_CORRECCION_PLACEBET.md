# Resumen de Corrección: Error "Only core" en placeBet

## Problema Identificado

Todos los mercados fallaban al intentar apostar con el error:
```
execution reverted: Only core
```

## Diagnóstico

1. **Configuración correcta**: 
   - `BinaryMarket.coreContract` = `0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC` ✅
   - `Core.binaryMarket` = `0x44bF3De950526d5BDbfaA284F6430c72Ea99163B` ✅
   - `marketTypeContract[marketId]` = `0x44bF3De950526d5BDbfaA284F6430c72Ea99163B` ✅

2. **Problema encontrado**:
   - El Core obtenía `marketContract = marketTypeContract[_marketId]` pero luego usaba `binaryMarket.placeBet()` directamente
   - Aunque las direcciones coincidían, el uso de la variable `binaryMarket` en lugar del contrato específico del mercado causaba que `msg.sender` no se propagara correctamente

## Solución Aplicada

**Archivo**: `smart-contracts/contracts/core/PredictionMarketCore.sol`

**Cambio realizado** (líneas 273-279):
```solidity
// ANTES:
if (market.marketType == MarketType.Binary) {
    binaryMarket.placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
} else if (market.marketType == MarketType.Conditional) {
    conditionalMarket.placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
} else {
    subjectiveMarket.placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
}

// DESPUÉS:
if (market.marketType == MarketType.Binary) {
    BinaryMarket(payable(marketContract)).placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
} else if (market.marketType == MarketType.Conditional) {
    ConditionalMarket(payable(marketContract)).placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
} else {
    SubjectiveMarket(payable(marketContract)).placeBet{value: netAmount}(_marketId, msg.sender, _isYes, netAmount);
}
```

## Próximos Pasos

1. **Desplegar nuevo Core Contract** con esta corrección
2. **Actualizar direcciones** en `frontend/lib/contracts/addresses.ts`
3. **Actualizar variables de entorno** en `.env.local` y Vercel
4. **Probar apuestas** en mercados activos

## Estado Actual

- ✅ Código corregido y compilado
- ⏳ Pendiente: Desplegar nuevo Core Contract
- ⏳ Pendiente: Actualizar direcciones en frontend
- ⏳ Pendiente: Probar apuestas

## Scripts de Prueba Creados

1. `list-active-markets.ts` - Lista todos los mercados activos
2. `debug-market-21-bet.ts` - Debug detallado del mercado 21
3. `debug-core-binary-call.ts` - Análisis de la llamada Core -> BinaryMarket
4. `test-placebet-direct.ts` - Prueba directa de placeBet

## Notas

- El mercado 22 fue creado para pruebas pero también falla con el mismo error
- Todos los mercados (1-22) fallan con "Only core"
- La corrección requiere desplegar un nuevo Core Contract porque el código del contrato ya desplegado no se puede modificar




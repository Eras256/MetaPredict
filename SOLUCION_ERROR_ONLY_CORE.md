# 🔧 Solución al Error "Only core"

## Problema

Al intentar crear un mercado en `/demo`, aparece el error:
```
Error - Only core
contract: 0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B
chainId: 5611
```

## Causa Raíz

El error ocurre porque:

1. **`BinaryMarket` tiene `coreContract` como `immutable`**: Se establece en el constructor y no puede cambiarse después del deploy.

2. **El contrato desplegado puede tener configuración incorrecta**: Si el `BinaryMarket` se desplegó con `deployer.address` en lugar de la dirección del `PredictionMarketCore`, el modifier `onlyCore()` fallará.

3. **El flujo correcto es**:
   - Usuario → `PredictionMarketCore.createBinaryMarket()` 
   - `PredictionMarketCore` → `BinaryMarket.createMarket()` (con modifier `onlyCore()`)
   - `BinaryMarket` verifica que `msg.sender == coreContract`

## Solución

### Opción 1: Verificar Configuración del Contrato (Recomendado)

Verificar que el `BinaryMarket` desplegado (`0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E`) tenga configurado `coreContract` como `0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B` (PredictionMarketCore).

**Verificar en opBNBScan:**
1. Ir a: https://testnet.opbnbscan.com/address/0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E#readContract
2. Llamar a la función `coreContract()` (view function)
3. Debe retornar: `0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B`

**Si el valor es diferente:**
- El contrato fue desplegado incorrectamente
- Necesita redesplegar `BinaryMarket` con la dirección correcta del Core

### Opción 2: Redesplegar BinaryMarket (Si es necesario)

Si el `coreContract` está mal configurado, redesplegar:

```typescript
// En smart-contracts/scripts/deploy-fix-binary-market.ts
const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
const binaryMarket = await BinaryMarket.deploy(
  "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B" // Core address
);
```

Luego actualizar el Core:
```typescript
await core.updateModule("binaryMarket", newBinaryMarketAddress);
```

### Opción 3: Verificar que el Frontend use la dirección correcta

El frontend ya está configurado correctamente para usar `PREDICTION_MARKET` (Core), no `BINARY_MARKET` directamente.

**Verificar en `frontend/lib/hooks/markets/useCreateMarket.ts`:**
- ✅ Usa `CONTRACT_ADDRESSES.PREDICTION_MARKET` (Core)
- ✅ No usa `CONTRACT_ADDRESSES.BINARY_MARKET` directamente

## Verificación

1. **Verificar configuración del contrato:**
   ```bash
   # En opBNBScan, llamar a coreContract() en BinaryMarket
   # Debe retornar: 0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B
   ```

2. **Probar crear mercado:**
   - Ir a `/demo`
   - Intentar crear un mercado binario
   - Debe funcionar sin el error "Only core"

## Estado Actual

- ✅ Frontend configurado correctamente (usa Core)
- ⚠️ Necesita verificar configuración del contrato desplegado
- ⚠️ Si está mal, necesita redesplegar o actualizar

## Notas

- El `coreContract` en `BinaryMarket` es `immutable`, por lo que no se puede cambiar después del deploy
- Si el contrato fue desplegado incorrectamente, la única solución es redesplegar
- El frontend ya está correcto y usa el Core contract, no los market contracts directamente


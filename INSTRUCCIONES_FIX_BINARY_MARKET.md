# 🔧 Instrucciones para Corregir BinaryMarket

## Problema

El error "Only core" ocurre porque el `BinaryMarket` desplegado tiene `coreContract` configurado incorrectamente. Como `coreContract` es `immutable`, no se puede cambiar después del deploy, por lo que necesitamos redesplegar.

## Solución

### Paso 1: Verificar Configuración Actual

Primero, verifica la configuración actual del BinaryMarket en opBNBScan:

1. Ve a: https://testnet.opbnbscan.com/address/0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E#readContract
2. Busca la función `coreContract()` (función view)
3. Haz clic en "Query"
4. Verifica el valor retornado:
   - ✅ **Correcto**: `0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B` (PredictionMarketCore)
   - ❌ **Incorrecto**: Cualquier otra dirección (probablemente el deployer address)

### Paso 2: Ejecutar Script de Corrección

Si la configuración es incorrecta, ejecuta el script de corrección:

```bash
cd smart-contracts
pnpm fix-binary-market
```

**Requisitos:**
- Debes ser el owner del Core contract (`0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B`)
- Debes tener BNB en testnet para gas
- Debes tener configurado `.env` con la private key del owner

### Paso 3: El Script Hará:

1. ✅ Verificará la configuración actual del BinaryMarket
2. ✅ Verificará que eres el owner del Core
3. ✅ Redesplegará BinaryMarket con la dirección correcta del Core
4. ✅ Transferirá ownership del nuevo BinaryMarket al Core
5. ✅ Actualizará el Core con la nueva dirección del BinaryMarket
6. ✅ Guardará las nuevas direcciones en `deployments/opbnb-testnet.json`

### Paso 4: Actualizar Variables de Entorno

Después de ejecutar el script, actualiza las variables de entorno:

**En `.env.local` (frontend):**
```env
NEXT_PUBLIC_BINARY_MARKET_ADDRESS=<nueva_direccion_del_script>
```

**En Vercel:**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Actualiza `NEXT_PUBLIC_BINARY_MARKET_ADDRESS` con la nueva dirección

### Paso 5: Verificar

1. Recarga la aplicación frontend
2. Ve a `/demo`
3. Intenta crear un mercado binario
4. Debe funcionar sin el error "Only core"

## Verificación Manual

Si quieres verificar manualmente:

1. **Verificar BinaryMarket:**
   - https://testnet.opbnbscan.com/address/<nueva_direccion>#readContract
   - Llamar a `coreContract()` → Debe retornar `0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B`

2. **Verificar Core:**
   - https://testnet.opbnbscan.com/address/0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B#readContract
   - Llamar a `binaryMarket()` → Debe retornar la nueva dirección

## Notas Importantes

- ⚠️ El script requiere que seas el owner del Core contract
- ⚠️ El script redespliega BinaryMarket, lo que consume gas
- ⚠️ Después del script, actualiza las variables de entorno
- ⚠️ El BinaryMarket anterior quedará obsoleto (pero seguirá desplegado)

## Troubleshooting

### Error: "El deployer no es el owner del Core"
- **Solución**: Usa la cuenta que es owner del Core para ejecutar el script
- Verifica el owner en: https://testnet.opbnbscan.com/address/0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B#readContract

### Error: "Insufficient funds"
- **Solución**: Asegúrate de tener suficiente BNB en testnet para gas

### Error: "Network not found"
- **Solución**: Verifica que `opBNBTestnet` esté configurado en `hardhat.config.ts`

## Resultado Esperado

Después de completar todos los pasos:

- ✅ BinaryMarket redesplegado con `coreContract` correcto
- ✅ Core actualizado con nueva dirección de BinaryMarket
- ✅ Frontend actualizado con nueva dirección
- ✅ Crear mercado funciona sin error "Only core"


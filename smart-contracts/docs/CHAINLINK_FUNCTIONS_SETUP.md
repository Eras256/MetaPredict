# Configuración de Chainlink Functions - Guía Oficial

Esta guía explica cómo configurar Chainlink Functions correctamente según la documentación oficial de Chainlink (actualizada hasta diciembre 2025).

## 📚 Documentación Oficial

- **Documentación Principal**: https://docs.chain.link/chainlink-functions
- **Redes Soportadas**: https://docs.chain.link/chainlink-functions/supported-networks
- **Crear Suscripción**: https://functions.chain.link/new
- **Guía de Inicio Rápido**: https://docs.chain.link/chainlink-functions/getting-started

## 🔍 Verificación de Soporte de Red

### Paso 1: Verificar si opBNB Testnet está soportado

1. Visita: https://docs.chain.link/chainlink-functions/supported-networks
2. Busca "opBNB Testnet" o "BSC Testnet" en la lista
3. Si está soportado, obtén:
   - **Router Address**: Dirección del contrato Router de Chainlink Functions
   - **DON ID**: Identificador de la Red de Oráculos Descentralizada (DON)

### Estado Actual (Diciembre 2025)

⚠️ **IMPORTANTE**: Según la documentación oficial, Chainlink Functions puede no estar disponible en opBNB Testnet todavía.

**Redes comúnmente soportadas**:
- Ethereum Sepolia Testnet
- Polygon Mumbai Testnet
- BSC Testnet (verificar disponibilidad)
- Avalanche Fuji Testnet

**Si opBNB Testnet NO está soportado**:
- El contrato usará automáticamente el **modo manual** (`fulfillResolutionManual`)
- No se requiere configuración adicional
- Las resoluciones se harán manualmente llamando a `fulfillResolutionManual`

## 🔧 Configuración Paso a Paso

### Paso 2: Crear Suscripción de Chainlink Functions

Si tu red está soportada:

1. **Conectar Wallet**:
   - Ve a https://functions.chain.link
   - Conecta tu wallet (MetaMask, etc.)
   - Asegúrate de estar en la red correcta (opBNB Testnet)

2. **Crear Suscripción**:
   - Haz clic en "Create Subscription"
   - Se creará una nueva suscripción con un ID único

3. **Financiar Suscripción**:
   - Deposita tokens LINK en la suscripción
   - Estos tokens se usarán para pagar las solicitudes a Chainlink Functions
   - **Mínimo recomendado**: 2 LINK para pruebas

4. **Agregar Consumidor**:
   - Agrega la dirección del contrato `AIOracle` como consumidor
   - Esto permite que el contrato use la suscripción

5. **Obtener Subscription ID**:
   - Copia el Subscription ID (número)
   - Configúralo en `.env` como `CHAINLINK_SUBSCRIPTION_ID`

### Paso 3: Obtener Direcciones del Router y DON ID

1. **Router Address**:
   - Consulta: https://docs.chain.link/chainlink-functions/supported-networks
   - Busca la dirección del Router para tu red
   - Ejemplo para BSC Testnet: `0x6E2dc0F9DB014Ae19888F539E59285D2Ea04244C`

2. **DON ID**:
   - También en la página de redes soportadas
   - Formato: `fun-ethereum-sepolia-1` o similar
   - Se convierte a `bytes32` en el contrato

### Paso 4: Configurar Variables de Entorno

Agrega estas variables a tu `.env`:

```env
# Chainlink Functions Configuration
CHAINLINK_FUNCTIONS_ROUTER=0x...  # Dirección del Router (de docs.chain.link)
CHAINLINK_DON_ID=fun-...          # DON ID (de docs.chain.link)
CHAINLINK_SUBSCRIPTION_ID=123     # Tu Subscription ID (de functions.chain.link)
BACKEND_URL=https://tu-backend.com/api/oracle/resolve
```

### Paso 5: Configurar el Contrato

#### Opción A: Contrato Nuevo (Redesplegar)

Si redesplegas el contrato con la nueva versión:

```bash
cd smart-contracts
pnpm ts-node scripts/redeploy-ai-oracle.ts
```

Este script:
- Redesplegará el contrato con las nuevas direcciones
- Configurará `subscriptionId` automáticamente
- Configurará `predictionMarket` al Core contract

#### Opción B: Contrato Existente (Actualizar)

Si el contrato ya tiene la función `setSubscriptionId`:

```bash
cd smart-contracts
pnpm ts-node scripts/setup-chainlink-functions.ts
```

Este script:
- Verificará si Chainlink Functions está disponible
- Configurará el `subscriptionId` si está disponible
- Actuará como modo manual si no está disponible

#### Opción C: Modo Manual (Sin Chainlink Functions)

Si Chainlink Functions NO está disponible en tu red:

```bash
cd smart-contracts
pnpm ts-node scripts/fix-ai-oracle-config.ts
```

Este script:
- Configurará `subscriptionId = 0` para activar modo manual
- El contrato usará `fulfillResolutionManual` automáticamente

## 🚀 Uso del Contrato

### Con Chainlink Functions Activado

1. **Iniciar Resolución**:
   ```solidity
   core.initiateResolution(marketId);
   ```
   - El contrato enviará una solicitud a Chainlink Functions
   - Chainlink Functions llamará a tu backend
   - El backend ejecutará el consenso de LLMs
   - Chainlink Functions devolverá el resultado al contrato
   - El contrato resolverá el mercado automáticamente

2. **El contrato maneja todo automáticamente**:
   - No necesitas intervención manual
   - El resultado se procesa en `fulfillRequest`

### Con Modo Manual (Sin Chainlink Functions)

1. **Iniciar Resolución**:
   ```solidity
   core.initiateResolution(marketId);
   ```
   - El contrato devolverá `requestId = 0`
   - El mercado quedará en estado "Resolving"

2. **Resolver Manualmente**:
   ```solidity
   aiOracle.fulfillResolutionManual(marketId, outcome, confidence);
   ```
   - `outcome`: 1=Yes, 2=No, 3=Invalid
   - `confidence`: 0-100
   - Solo el owner del contrato puede llamar esta función

## ✅ Verificación

### Verificar Configuración Actual

```bash
cd smart-contracts
pnpm ts-node scripts/test-initiate-resolution.ts
```

Este script mostrará:
- Estado del contrato (pausado/activo)
- Configuración de AI Oracle
- Router, Subscription ID, DON ID
- Estado del mercado
- Intentará iniciar resolución

### Verificar en Blockchain

```solidity
// Verificar configuración
aiOracle.subscriptionId()  // Debe ser > 0 para Chainlink Functions
aiOracle.i_router()        // Debe ser != ZeroAddress para Chainlink Functions
aiOracle.predictionMarket() // Debe ser la dirección del Core contract
```

## 🔍 Troubleshooting

### Error: "missing revert data"

**Causa**: Chainlink Functions no está disponible o mal configurado.

**Solución**:
1. Verifica que tu red esté soportada en https://docs.chain.link/chainlink-functions/supported-networks
2. Si no está soportada, usa modo manual (`subscriptionId = 0`)
3. Si está soportada, verifica que el Router address sea correcto

### Error: "UnauthorizedResolver"

**Causa**: El `predictionMarket` en AIOracle no coincide con el Core contract.

**Solución**:
```bash
pnpm ts-node scripts/fix-ai-oracle-config.ts
```

### Error: "Subscription not found"

**Causa**: El `subscriptionId` no existe o no tiene fondos.

**Solución**:
1. Ve a https://functions.chain.link
2. Verifica que la suscripción existe
3. Verifica que tiene fondos LINK
4. Verifica que el contrato AIOracle está agregado como consumidor

## 📝 Notas Importantes

1. **Chainlink Functions está en BETA**: Puede haber cambios en la API
2. **Costo**: Cada solicitud consume LINK tokens de la suscripción
3. **Límites**: Hay límites en el tamaño del código fuente y tiempo de ejecución
4. **Backend**: Tu backend debe estar accesible públicamente para Chainlink Functions
5. **Modo Manual**: Siempre disponible como fallback si Chainlink Functions no funciona

## 🔗 Enlaces Útiles

- **Documentación**: https://docs.chain.link/chainlink-functions
- **Dashboard**: https://functions.chain.link
- **Playground**: https://functions.chain.link/playground
- **Ejemplos**: https://github.com/smartcontractkit/functions-hardhat-starter-kit

## 📞 Soporte

Si tienes problemas:
1. Revisa la documentación oficial
2. Verifica que tu red esté soportada
3. Verifica que la suscripción tenga fondos
4. Usa modo manual como fallback


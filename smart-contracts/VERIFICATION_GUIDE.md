# Guía de Verificación de Contratos - Etherscan API V2

## ⚠️ IMPORTANTE: Migración a Etherscan API V2

Desde **agosto 2025**, BSCScan API ha sido deprecada y reemplazada por **Etherscan API V2**. Esto significa:

1. **Necesitas una API key de Etherscan.io** (NO de BSCScan)
2. La misma API key funciona para todas las chains (Ethereum, BSC, opBNB, Polygon, etc.)
3. Hardhat automáticamente agrega el parámetro `chainid` a las solicitudes

## 🔑 Obtener API Key de Etherscan

### Paso 1: Crear cuenta en Etherscan.io
1. Ve a https://etherscan.io/register
2. Crea una cuenta (si no tienes una)

### Paso 2: Generar API Key
1. Ve a https://etherscan.io/apidashboard
2. Haz clic en "Add" para crear una nueva API key
3. Copia la API key generada

### Paso 3: Configurar en el proyecto
Agrega la API key a tu `.env.local`:
```bash
ETHERSCAN_API_KEY=tu_api_key_de_etherscan_io
```

**⚠️ NOTA**: Las API keys de BSCScan/Polygonscan NO funcionan con Etherscan API V2.

## 📝 Configuración de Hardhat

La configuración en `hardhat.config.ts` ya está lista para Etherscan API V2:

```typescript
etherscan: {
  apiKey: {
    opBNBTestnet: process.env.ETHERSCAN_API_KEY || "...",
  },
  customChains: [
    {
      network: "opBNBTestnet",
      chainId: 5611,
      urls: {
        apiURL: "https://api.etherscan.io/v2/api",
        browserURL: "https://opbnb-testnet.bscscan.com",
      },
    },
  ],
}
```

## 🚀 Verificar Contratos

### Verificar un solo contrato:
```bash
cd smart-contracts
pnpm hardhat verify --network opBNBTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Verificar todos los contratos:
```bash
cd smart-contracts
pnpm run verify:all
```

## ❌ Solución de Problemas

### Error: "Invalid API Key"
**Causas posibles:**
1. Estás usando una API key de BSCScan (no funciona con API V2)
2. La API key no está activada (puede tardar unos minutos)
3. Demasiados intentos fallidos (bloqueo temporal)

**Solución:**
1. Asegúrate de usar una API key de **Etherscan.io** (no BSCScan)
2. Espera 5-10 minutos después de crear la API key
3. Si hay bloqueo, espera 15-30 minutos antes de reintentar

### Error: "Too many invalid api key attempts"
**Solución:**
- Espera 15-30 minutos antes de reintentar
- Verifica que tu API key sea de Etherscan.io
- Considera generar una nueva API key

### Error: "Contract does not have bytecode"
**Solución:**
- Espera unos minutos después del deployment (Etherscan necesita indexar)
- Verifica que la dirección del contrato sea correcta

## 📚 Referencias

- [Etherscan API V2 Migration Guide](https://docs.etherscan.io/resources/v2-migration)
- [Etherscan API Dashboard](https://etherscan.io/apidashboard)
- [Hardhat Verify Plugin](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)

## 🔍 Verificación Manual (Alternativa)

Si la verificación automática falla, puedes verificar manualmente:

1. Ve a https://opbnb-testnet.bscscan.com/address/<CONTRACT_ADDRESS>
2. Haz clic en "Contract" → "Verify and Publish"
3. Selecciona "Via Standard JSON Input"
4. Sube el archivo de compilación desde `artifacts/`
5. Ingresa los parámetros del constructor
6. Haz clic en "Verify and Publish"


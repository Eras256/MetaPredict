# Configuración de NodeReal API para opBNBScan

## ⚠️ IMPORTANTE

opBNBScan usa **NodeReal API** para la verificación de contratos, NO Etherscan API V2.

## 🔑 Obtener API Key de NodeReal

### Paso 1: Ir a NodeReal Portal
1. Ve a https://nodereal.io/
2. Haz clic en el botón **"Login"**

### Paso 2: Iniciar Sesión
- Puedes usar tu cuenta de **GitHub** o **Discord**
- Haz clic en el método de login que prefieras

### Paso 3: Crear API Key
1. Una vez dentro del portal, busca la opción para crear una nueva API key
2. Haz clic en **"Create new key"** o botón similar
3. Copia la API key generada

### Paso 4: Configurar en el Proyecto
Agrega la API key a tu `.env.local`:
```bash
NODEREAL_API_KEY=tu_api_key_de_nodereal_aqui
```

## ✅ Verificación Automática

Una vez configurada la API key, ejecuta:

```bash
cd smart-contracts
pnpm run verify:all
```

## 📝 Configuración Actual

La configuración en `hardhat.config.ts` ya está lista para usar NodeReal API:

```typescript
etherscan: {
  apiKey: {
    opBNBTestnet: process.env.NODEREAL_API_KEY || "...",
  },
  customChains: [
    {
      network: "opBNBTestnet",
      chainId: 5611,
      urls: {
        apiURL: `https://open-platform.nodereal.io/${process.env.NODEREAL_API_KEY}/op-bnb-testnet/contract/`,
        browserURL: "https://testnet.opbnbscan.com/",
      },
    },
  ],
}
```

## 🔗 Referencias

- [NodeReal Portal](https://nodereal.io/)
- [opBNBScan Documentation](https://docs.opbnbscan.com/)


# Variables de Entorno para Vercel

Este documento lista todas las variables de entorno necesarias para desplegar MetaPredict en Vercel.

## ⚠️ IMPORTANTE

- **NUNCA** subas archivos `.env` con valores reales a Git
- Configura estas variables en el **Dashboard de Vercel**: `Settings → Environment Variables`
- Las variables `NEXT_PUBLIC_*` son **públicas** (expuestas al navegador)
- Las demás variables son **privadas** (solo servidor)

---

## 📋 Variables por Categoría

### 1. Frontend (NEXT_PUBLIC_*) - Públicas

Estas variables son expuestas al navegador. No incluyas secretos aquí.

```env
# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=2221212121

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_walletconnect_project_id

# Blockchain Network
NEXT_PUBLIC_CHAIN_ID=5611
NEXT_PUBLIC_OPBNB_TESTNET_RPC=https://opbnb-testnet-rpc.bnbchain.org
NEXT_PUBLIC_OPBNB_MAINNET_RPC=https://opbnb-mainnet-rpc.bnbchain.org

# Smart Contract Addresses (opBNB Testnet)
NEXT_PUBLIC_CORE_CONTRACT_ADDRESS=0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xA65bE35D25B09F7326ab154E154572dB90F67081
NEXT_PUBLIC_INSURANCE_POOL_ADDRESS=0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA
NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS=0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7
NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS=0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123
NEXT_PUBLIC_OMNI_ROUTER_ADDRESS=0x11C1124384e463d99Ba84348280e318FbeE544d0
NEXT_PUBLIC_BINARY_MARKET_ADDRESS=0x44bF3De950526d5BDbfaA284F6430c72Ea99163B
NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS=0x45E223eAB99761A7E60eF7690420C178FEBD23df
NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS=0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE
NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS=0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd
NEXT_PUBLIC_USDC_ADDRESS=0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3

# App Configuration
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
NEXT_PUBLIC_IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
```

### 2. Backend API Keys - Privadas

```env
# Thirdweb (Backend)
THIRDWEB_SECRET_KEY=tu_thirdweb_secret_key

# Server Configuration
PORT=3001
CORS_ORIGIN=https://tu-dominio.vercel.app
```

### 3. AI Services - Privadas

```env
# Google Gemini (GRATIS)
GEMINI_API_KEY=tu_gemini_api_key
GOOGLE_API_KEY=tu_google_api_key

# Groq (GRATIS)
GROQ_API_KEY=tu_groq_api_key

# OpenRouter (GRATIS - Modelos gratuitos)
OPENROUTER_API_KEY=tu_openrouter_api_key

# Hugging Face (Opcional)
HUGGINGFACE_API_KEY=tu_huggingface_api_key
HUGGINGFACE_ENDPOINT_URL=tu_endpoint_url
```

### 4. Gelato - Privadas

```env
# Gelato Relay & Automate
GELATO_RELAY_API_KEY=tu_gelato_relay_api_key
GELATO_AUTOMATE_API_KEY=tu_gelato_automate_api_key
GELATO_RPC_API_KEY=tu_gelato_rpc_api_key
GELATO_RPC_URL_TESTNET=https://opbnb-testnet.gelato.digital/rpc/tu_api_key
```

### 5. RPC & Network - Privadas

```env
# RPC Endpoints
RPC_URL_TESTNET=https://opbnb-testnet-rpc.bnbchain.org
OPBNB_RPC_URL=https://opbnb-testnet-rpc.bnbchain.org
OPBNB_CHAIN_ID=5611
CHAIN_ID=5611
CHAIN_ID_TESTNET=5611
```

### 6. Smart Contracts - Privadas

```env
# Contract Addresses (Backend)
AI_ORACLE_ADDRESS=0xA65bE35D25B09F7326ab154E154572dB90F67081
CORE_CONTRACT_ADDRESS=0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC
USDC_ADDRESS=0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3
```

### 7. Database - Privadas

```env
# Prisma + PostgreSQL (Accelerate)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=tu_api_key
```

### 8. Security - Privadas

```env
# JWT Authentication
JWT_SECRET=tu_jwt_secret_aleatorio
JWT_EXPIRES_IN=7d

# Vercel Cron Security
CRON_SECRET=tu_random_secret_key

# Deployment Wallet (solo para scripts, NO exponer)
PRIVATE_KEY=tu_private_key_solo_para_scripts
```

### 9. Chainlink - Privadas

```env
# Chainlink Data Streams
CHAINLINK_DATA_STREAMS_VERIFIER_PROXY=0x001225Aca0efe49Dbb48233aB83a9b4d177b581A
CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID=0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8
CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID=0x000362205e10b3a147d02792eccee483dca6c7b44ecce7012cb8c6e0b68b3ae9
CHAINLINK_DATA_STREAMS_USDT_USD_STREAM_ID=0x0003a910a43485e0685ff5d6d366541f5c21150f0634c5b14254392d1a1c06db
CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID=0x000335fd3f3ffa06cfd9297b97367f77145d7a5f132e84c736cc471dd98621fe
CHAINLINK_DATA_STREAMS_SOL_USD_STREAM_ID=0x0003b778d3f6b2ac4991302b89cb313f99a42467d6c9c5f96f57c29c0d2bc24f
CHAINLINK_DATA_STREAMS_USDC_USD_STREAM_ID=0x00038f83323b6b08116d1614cf33a9bd71ab5e0abf0c9f1b783a74a43e7bd992
CHAINLINK_DATA_STREAMS_XRP_USD_STREAM_ID=0x0003c16c6aed42294f5cb4741f6e59ba2d728f0eae2eb9e6d3f555808c59fc45
CHAINLINK_DATA_STREAMS_DOGE_USD_STREAM_ID=0x000356ca64d3b32135e17dc0dc721a645bf50d0303be8ceb2cdca0a50bab8fdc

# Chainlink CCIP
CHAINLINK_CCIP_ROUTER=0xD9182959D9771cc77e228cB3caFe671f45A37630
LINK_TOKEN_ADDRESS=0x56E16E648c51609A14Eb14B99BAB771Bee797045
CHAINLINK_CCIP_CHAIN_SELECTOR=13274425992935471758
```

### 10. Backend URL - Privada

```env
# Backend URL para AIOracle
BACKEND_URL=https://tu-dominio.vercel.app/api/oracle/resolve
```

### 11. Other - Privadas

```env
# Environment
NODE_ENV=production

# Logging
LOG_LEVEL=info

# IPFS
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
IPFS_API_URL=https://ipfs.infura.io:5001/api/v0

# Explorer APIs (para verificación de contratos)
ETHERSCAN_API_KEY=tu_etherscan_api_key
BSCSCAN_API_KEY=tu_bscscan_api_key
NODEREAL_API_KEY=tu_nodereal_api_key
```

---

## 🚀 Cómo Configurar en Vercel

### Opción 1: Dashboard de Vercel (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto → **Settings** → **Environment Variables**
3. Agrega cada variable:
   - **Name**: Nombre de la variable (ej: `GEMINI_API_KEY`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona `Production`, `Preview`, y/o `Development`
4. Haz clic en **Save**

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI (si no está instalado)
npm i -g vercel

# Autenticarse
vercel login

# Agregar variable (una por una)
vercel env add VARIABLE_NAME production

# O usar el script generado
.\scripts\vercel-env-setup.ps1
```

### Opción 3: Archivo de Comandos

Ejecuta el script para generar comandos:

```powershell
.\scripts\vercel-env-setup.ps1
```

Esto generará `vercel-env-commands.txt` con todos los comandos listos para ejecutar.

---

## ✅ Checklist de Verificación

Después de configurar las variables, verifica:

- [ ] Todas las variables `NEXT_PUBLIC_*` están configuradas
- [ ] Todas las API keys de AI están configuradas
- [ ] Gelato API keys están configuradas
- [ ] `BACKEND_URL` apunta a tu dominio de Vercel
- [ ] `NEXT_PUBLIC_APP_URL` apunta a tu dominio de Vercel
- [ ] `CRON_SECRET` está configurado (genera uno aleatorio)
- [ ] `DATABASE_URL` está configurado
- [ ] Todas las direcciones de contratos están actualizadas

---

## 🔒 Seguridad

- ✅ **NUNCA** subas `.env` con valores reales a Git
- ✅ Usa diferentes API keys para producción y desarrollo
- ✅ Rota las API keys regularmente
- ✅ Usa wallets dedicadas con fondos mínimos para deployment
- ✅ `PRIVATE_KEY` solo se usa en scripts locales, NO en Vercel

---

## 📚 Referencias

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- Ver `env.example` para valores de ejemplo


# Variables de Entorno por Ambiente - Guía de Configuración

## ✅ Configuración Correcta por Ambiente

### 🔵 PRODUCTION (Producción)
**Todas las variables deben estar aquí para que la app funcione en producción**

#### Variables Públicas (NEXT_PUBLIC_*)
- ✅ `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- ✅ `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- ✅ `NEXT_PUBLIC_CHAIN_ID`
- ✅ `NEXT_PUBLIC_OPBNB_TESTNET_RPC`
- ✅ `NEXT_PUBLIC_CORE_CONTRACT_ADDRESS`
- ✅ `NEXT_PUBLIC_AI_ORACLE_ADDRESS`
- ✅ `NEXT_PUBLIC_INSURANCE_POOL_ADDRESS`
- ✅ `NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS`
- ✅ `NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS`
- ✅ `NEXT_PUBLIC_OMNI_ROUTER_ADDRESS`
- ✅ `NEXT_PUBLIC_BINARY_MARKET_ADDRESS`
- ✅ `NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS`
- ✅ `NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS`
- ✅ `NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS`
- ✅ `NEXT_PUBLIC_USDC_ADDRESS`
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `NEXT_PUBLIC_IPFS_GATEWAY_URL`

#### Variables Privadas (Backend/Server-side)
- ✅ `CRON_SECRET` ⚠️ CRÍTICA
- ✅ `PRIVATE_KEY` ⚠️ CRÍTICA - Solo Production y Preview
- ✅ `BACKEND_URL` ⚠️ CRÍTICA
- ✅ `AI_ORACLE_ADDRESS`
- ✅ `RPC_URL_TESTNET`
- ✅ `GEMINI_API_KEY`
- ✅ `GOOGLE_API_KEY`
- ✅ `GROQ_API_KEY`
- ✅ `OPENROUTER_API_KEY`
- ✅ `HUGGINGFACE_API_KEY`
- ✅ `HUGGINGFACE_ENDPOINT_URL`
- ✅ `GELATO_RELAY_API_KEY`
- ✅ `GELATO_AUTOMATE_API_KEY`
- ✅ `GELATO_RPC_API_KEY`
- ✅ `GELATO_RPC_URL_TESTNET`
- ✅ `CHAINLINK_DATA_STREAMS_VERIFIER_PROXY`
- ✅ `CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_USDT_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_SOL_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_USDC_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_XRP_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_DOGE_USD_STREAM_ID`
- ✅ `CHAINLINK_CCIP_ROUTER`
- ✅ `LINK_TOKEN_ADDRESS`
- ✅ `CHAINLINK_CCIP_CHAIN_SELECTOR`
- ✅ `VENUS_API_URL`
- ✅ `VENUS_TESTNET_API_URL`
- ✅ `VENUS_USE_TESTNET`
- ✅ `VENUS_VUSDC_ADDRESS`
- ✅ `NODEREAL_API_KEY`
- ✅ `ETHERSCAN_API_KEY`
- ✅ `LOG_LEVEL`
- ✅ `NODE_ENV` (debe ser `production`)
- ✅ `DATABASE_URL` (si usas base de datos)

---

### 🟡 PREVIEW (Pre-deployments / Pull Requests)
**Mismas variables que Production para testing antes de producción**

✅ **Todas las mismas variables que Production**

**Razón:** Preview deployments deben comportarse igual que Production para detectar problemas temprano.

---

### 🟢 DEVELOPMENT (Local)
**Solo variables públicas y algunas opcionales para desarrollo local**

#### Variables Públicas (NEXT_PUBLIC_*)
- ✅ `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- ✅ `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- ✅ `NEXT_PUBLIC_CHAIN_ID`
- ✅ `NEXT_PUBLIC_OPBNB_TESTNET_RPC`
- ✅ `NEXT_PUBLIC_CORE_CONTRACT_ADDRESS`
- ✅ `NEXT_PUBLIC_AI_ORACLE_ADDRESS`
- ✅ `NEXT_PUBLIC_INSURANCE_POOL_ADDRESS`
- ✅ `NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS`
- ✅ `NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS`
- ✅ `NEXT_PUBLIC_OMNI_ROUTER_ADDRESS`
- ✅ `NEXT_PUBLIC_BINARY_MARKET_ADDRESS`
- ✅ `NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS`
- ✅ `NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS`
- ✅ `NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS`
- ✅ `NEXT_PUBLIC_USDC_ADDRESS`
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `NEXT_PUBLIC_IPFS_GATEWAY_URL`

#### Variables Privadas (Opcionales para desarrollo local)
- ✅ `CRON_SECRET` (opcional, para probar cron jobs localmente)
- ❌ `PRIVATE_KEY` ⚠️ **NO PONER EN DEVELOPMENT** - Usa solo en local `.env.local`
- ✅ `BACKEND_URL` (opcional, puede usar `/api` relativo)
- ✅ `AI_ORACLE_ADDRESS` (opcional)
- ✅ `RPC_URL_TESTNET` (opcional)
- ✅ `GEMINI_API_KEY` (opcional, para probar IA localmente)
- ✅ `GOOGLE_API_KEY` (opcional)
- ✅ `GROQ_API_KEY` (opcional)
- ✅ `OPENROUTER_API_KEY` (opcional)
- ✅ `LOG_LEVEL` (opcional, puede ser `debug` para desarrollo)
- ✅ `NODE_ENV` (debe ser `development`)

#### Variables que NO deben estar en Development
- ❌ `PRIVATE_KEY` ⚠️ **NUNCA en Development** - Riesgo de seguridad
- ❌ `OWNER_PRIVATE_KEY` ⚠️ **NUNCA en Development** - Riesgo de seguridad
- ❌ Variables de Gelato con API keys reales (usa keys de test si es necesario)
- ❌ Variables de producción de Chainlink (usa testnet)

---

## 🔒 Reglas de Seguridad por Ambiente

### ✅ SEGURO: Variables que pueden estar en todos los ambientes
- Todas las `NEXT_PUBLIC_*` (son públicas de todas formas)
- `CRON_SECRET` (diferentes valores por ambiente es mejor)
- `LOG_LEVEL`
- `NODE_ENV`
- Direcciones de contratos (son públicas)
- RPC URLs (son públicas)

### ⚠️ CUIDADO: Variables que NO deben estar en Development
- `PRIVATE_KEY` - ⚠️ **NUNCA en Development** - Solo Production y Preview
- `OWNER_PRIVATE_KEY` - ⚠️ **NUNCA en Development** - Solo Production y Preview
- API Keys de producción (usa keys de test para Development)

### 🔐 CRÍTICAS: Variables que DEBEN estar en Production
- `CRON_SECRET` ⚠️ CRÍTICA
- `PRIVATE_KEY` ⚠️ CRÍTICA
- `BACKEND_URL` ⚠️ CRÍTICA
- `AI_ORACLE_ADDRESS`
- `RPC_URL_TESTNET`
- Todas las API keys de LLM (GEMINI, GROQ, OPENROUTER)

---

## 📋 Checklist de Verificación

### Production ✅
- [ ] Todas las variables `NEXT_PUBLIC_*` están configuradas
- [ ] `CRON_SECRET` está configurada
- [ ] `PRIVATE_KEY` está configurada (sin espacios)
- [ ] `BACKEND_URL` está configurada con URL de producción
- [ ] Todas las API keys están configuradas
- [ ] `NODE_ENV=production`

### Preview ✅
- [ ] Mismas variables que Production
- [ ] Pueden usar valores de test si es necesario

### Development ✅
- [ ] Solo variables `NEXT_PUBLIC_*`
- [ ] `PRIVATE_KEY` NO está configurada ⚠️
- [ ] `OWNER_PRIVATE_KEY` NO está configurada ⚠️
- [ ] `NODE_ENV=development`

---

## 🎯 Recomendación Final

**Para tu caso específico:**

1. **Production y Preview:** ✅ Está bien tener todas las variables
2. **Development:** ⚠️ **Elimina `PRIVATE_KEY` y `OWNER_PRIVATE_KEY`** de Development por seguridad

**Razón:** 
- Las variables en Development pueden ser accesibles en logs o errores
- Es mejor usar `.env.local` para desarrollo local
- Reduce el riesgo de exposición accidental de claves privadas

---

## 🚀 Próximos Pasos

1. ✅ Ya configuraste todas las variables en Production y Preview - **Perfecto**
2. ⚠️ Verifica que `PRIVATE_KEY` NO esté en Development
3. ✅ Haz un redeploy para aplicar los cambios
4. ✅ Verifica que la app funcione correctamente en producción

---

**Última actualización:** Diciembre 2025
**Estado:** Configuración optimizada para producción ✅


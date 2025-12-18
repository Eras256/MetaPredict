# Variables de Entorno Vercel - Configuración Completa para Producción Testnet

## ✅ Variables que YA TIENES configuradas (mantener)

### Frontend (NEXT_PUBLIC_*)
- ✅ `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
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

### LLM API Keys
- ✅ `GEMINI_API_KEY`
- ✅ `GOOGLE_API_KEY`
- ✅ `GROQ_API_KEY`
- ✅ `OPENROUTER_API_KEY`
- ✅ `HUGGINGFACE_API_KEY`
- ✅ `OPENAI_API_KEY` (opcional, pero ya está configurada)

### Chainlink Data Streams
- ✅ `CHAINLINK_DATA_STREAMS_VERIFIER_PROXY`
- ✅ `CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_USDT_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_SOL_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_USDC_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_XRP_USD_STREAM_ID`
- ✅ `CHAINLINK_DATA_STREAMS_DOGE_USD_STREAM_ID`

### Chainlink CCIP
- ✅ `CHAINLINK_CCIP_ROUTER`
- ✅ `LINK_TOKEN_ADDRESS`
- ✅ `CHAINLINK_CCIP_CHAIN_SELECTOR`

### Gelato
- ✅ `GELATO_RELAY_API_KEY`
- ✅ `GELATO_AUTOMATE_API_KEY`
- ✅ `GELATO_RPC_API_KEY`
- ✅ `GELATO_RPC_URL_TESTNET`

### Venus Protocol
- ✅ `VENUS_API_URL`
- ✅ `VENUS_TESTNET_API_URL`
- ✅ `VENUS_USE_TESTNET`
- ✅ `VENUS_VUSDC_ADDRESS`
- ✅ `VENUS_VTOKEN` (opcional, pero ya está)

### Otros
- ✅ `NODE_ENV`
- ✅ `LOG_LEVEL`
- ✅ `PORT`
- ✅ `NODEREAL_API_KEY`
- ✅ `ETHERSCAN_API_KEY`
- ✅ `USDC_ADDRESS`
- ✅ `IPFS_API_URL`
- ✅ `IPFS_GATEWAY_URL`
- ✅ `OPBNB_RPC_URL`
- ✅ `CORS_ORIGIN`
- ✅ `THIRDWEB_SECRET_KEY`
- ✅ `OWNER_PRIVATE_KEY` (si es diferente de PRIVATE_KEY)

---

## ❌ Variables CRÍTICAS que FALTAN (agregar urgentemente)

### 🔴 CRÍTICAS para Funcionamiento Básico

#### 1. CRON_SECRET
**¿Por qué es crítica?**
- Necesaria para que los cron jobs de Vercel funcionen correctamente
- Sin esto, `/api/cron` y `/api/cron/oracle-check` fallarán en producción

**Valor:**
```bash
# Genera un secret aleatorio:
openssl rand -hex 32
```

**Configurar en Vercel:**
- Entorno: **Production, Preview, Development** (todos)
- Valor: [tu-secret-generado]

---

#### 2. PRIVATE_KEY
**¿Por qué es crítica?**
- Necesaria para que el cron job `/api/cron` pueda resolver mercados
- Sin esto, el cron job no podrá firmar transacciones en la blockchain

**Valor:**
```bash
# La clave privada de la wallet que es owner del AI Oracle
# ⚠️ IMPORTANTE: Debe ser la misma wallet que desplegó el AI Oracle
```

**Configurar en Vercel:**
- Entorno: **Production, Preview** (NO Development por seguridad)
- Valor: [tu-private-key-sin-0x]

**Nota:** Si ya tienes `OWNER_PRIVATE_KEY`, puedes usar esa misma o crear `PRIVATE_KEY` con el mismo valor.

---

#### 3. BACKEND_URL
**¿Por qué es crítica?**
- El contrato AIOracle necesita saber dónde llamar para obtener el consenso de las IAs
- Sin esto, las resoluciones automáticas no funcionarán

**Valor:**
```bash
# URL completa de tu API en producción
BACKEND_URL=https://www.metapredict.fun/api
```

**Configurar en Vercel:**
- Entorno: **Production, Preview**
- Valor: `https://www.metapredict.fun/api`

---

#### 4. AI_ORACLE_ADDRESS
**¿Por qué es crítica?**
- El cron job necesita saber la dirección exacta del contrato AIOracle
- Aunque hay un valor por defecto, es mejor configurarlo explícitamente

**Valor:**
```bash
AI_ORACLE_ADDRESS=0xA65bE35D25B09F7326ab154E154572dB90F67081
```

**Configurar en Vercel:**
- Entorno: **Production, Preview**
- Valor: `0xA65bE35D25B09F7326ab154E154572dB90F67081`

---

#### 5. RPC_URL_TESTNET
**¿Por qué es crítica?**
- El cron job necesita conectarse a la blockchain para leer y escribir datos
- Sin esto, no podrá interactuar con los contratos

**Valor:**
```bash
RPC_URL_TESTNET=https://opbnb-testnet-rpc.bnbchain.org
```

**Configurar en Vercel:**
- Entorno: **Production, Preview**
- Valor: `https://opbnb-testnet-rpc.bnbchain.org`

**Nota:** Si ya tienes `OPBNB_RPC_URL`, puedes usar esa misma o crear `RPC_URL_TESTNET` con el mismo valor.

---

### 🟡 IMPORTANTES pero no críticas (recomendadas)

#### 6. NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
**¿Por qué es importante?**
- Mejora la experiencia de conexión de wallets
- Sin esto, WalletConnect puede no funcionar correctamente

**Valor:**
```bash
# Obtén en: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu-project-id-aqui
```

---

#### 7. DATABASE_URL
**¿Por qué es importante?**
- Necesaria si usas Prisma para almacenar datos
- Sin esto, las funciones de base de datos no funcionarán

**Valor:**
```bash
# Prisma Accelerate (recomendado para Vercel)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=tu-api-key

# O conexión directa PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

#### 8. HUGGINGFACE_ENDPOINT_URL
**¿Por qué es importante?**
- Necesaria si usas modelos de Hugging Face con endpoints dedicados
- Sin esto, solo funcionarán modelos públicos

**Valor:**
```bash
HUGGINGFACE_ENDPOINT_URL=https://tu-endpoint.huggingface.co
```

---

## 📋 Checklist de Configuración

### Paso 1: Variables Críticas (HACER PRIMERO)
- [ ] `CRON_SECRET` - Generar con `openssl rand -hex 32`
- [ ] `PRIVATE_KEY` - Clave privada de la wallet owner del AI Oracle
- [ ] `BACKEND_URL` - `https://www.metapredict.fun/api`
- [ ] `AI_ORACLE_ADDRESS` - `0xA65bE35D25B09F7326ab154E154572dB90F67081`
- [ ] `RPC_URL_TESTNET` - `https://opbnb-testnet-rpc.bnbchain.org`

### Paso 2: Variables Importantes
- [ ] `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (si usas WalletConnect)
- [ ] `DATABASE_URL` (si usas base de datos)
- [ ] `HUGGINGFACE_ENDPOINT_URL` (si usas Hugging Face)

### Paso 3: Verificar Variables Existentes
- [ ] Verificar que todas las direcciones de contratos sean correctas
- [ ] Verificar que todas las API keys sean válidas
- [ ] Verificar que `NEXT_PUBLIC_APP_URL` apunte a tu dominio de producción

---

## 🔍 Variables que PUEDEN SOBRAR (opcional eliminar)

Estas variables están en Vercel pero pueden no ser necesarias:

### Variables Opcionales (pueden eliminarse si no se usan)
- `CORS_ORIGIN` - Solo necesaria si tienes un backend Express separado (no es el caso)
- `VENUS_VTOKEN` - Duplicado de `VENUS_VUSDC_ADDRESS` (puede eliminarse si son iguales)
- `OWNER_PRIVATE_KEY` - Si es igual a `PRIVATE_KEY`, puede eliminarse
- `OPBNB_RPC_URL` - Si es igual a `RPC_URL_TESTNET`, puede eliminarse
- `IPFS_API_URL` - Solo necesaria si subes archivos a IPFS activamente
- `IPFS_GATEWAY_URL` - Solo necesaria si lees archivos de IPFS activamente
- `OPENAI_API_KEY` - Solo necesaria si usas OpenAI (no está en el sistema de consenso principal)
- `THIRDWEB_SECRET_KEY` - Solo necesaria para operaciones server-side de Thirdweb

**Recomendación:** Mantenerlas por ahora si no estás seguro. Es mejor tener variables de más que de menos.

---

## 🚀 Comandos para Configurar en Vercel CLI

Si prefieres usar la CLI en lugar del dashboard:

```bash
# Variables críticas
vercel env add CRON_SECRET production
vercel env add PRIVATE_KEY production
vercel env add BACKEND_URL production
vercel env add AI_ORACLE_ADDRESS production
vercel env add RPC_URL_TESTNET production

# También para preview
vercel env add CRON_SECRET preview
vercel env add PRIVATE_KEY preview
vercel env add BACKEND_URL preview
vercel env add AI_ORACLE_ADDRESS preview
vercel env add RPC_URL_TESTNET preview
```

---

## ✅ Verificación Post-Configuración

Después de configurar todas las variables:

1. **Redeploy en Vercel:**
   ```bash
   vercel --prod
   ```

2. **Verificar Cron Jobs:**
   - Visita: `https://www.metapredict.fun/api/cron/oracle-check`
   - Debe retornar JSON con status (no error 401)

3. **Verificar Oracle:**
   - Visita: `https://www.metapredict.fun/api/oracle/status`
   - Debe mostrar el estado de las API keys configuradas

4. **Verificar Contratos:**
   - Conecta tu wallet en la app
   - Verifica que puedas ver los mercados y hacer apuestas

---

## 📝 Notas Importantes

1. **Seguridad:**
   - `PRIVATE_KEY` y `CRON_SECRET` son sensibles - nunca las compartas
   - Usa diferentes valores para Production y Preview si es posible
   - Rota las keys regularmente

2. **Valores por Defecto:**
   - Algunas variables tienen valores por defecto en el código
   - Pero es mejor configurarlas explícitamente en Vercel para evitar problemas

3. **Entornos:**
   - **Production:** Todas las variables críticas deben estar
   - **Preview:** Mismas variables que Production (para testing)
   - **Development:** Solo variables públicas (NEXT_PUBLIC_*)

4. **Actualización:**
   - Si cambias una variable, haz un redeploy inmediato
   - Las variables se aplican en el próximo deployment

---

## 🆘 Troubleshooting

### Error: "Unauthorized" en `/api/cron`
- **Causa:** `CRON_SECRET` no está configurada o es incorrecta
- **Solución:** Verificar que `CRON_SECRET` esté configurada en Vercel y hacer redeploy

### Error: "PRIVATE_KEY no está configurada"
- **Causa:** `PRIVATE_KEY` no está en las variables de entorno
- **Solución:** Agregar `PRIVATE_KEY` en Vercel → Settings → Environment Variables

### Error: "No eres el owner del AI Oracle"
- **Causa:** La `PRIVATE_KEY` no corresponde a la wallet que desplegó el AI Oracle
- **Solución:** Usar la clave privada de la wallet correcta

### Error: "Failed to fetch" en el frontend
- **Causa:** `NEXT_PUBLIC_API_URL` o `BACKEND_URL` incorrectas
- **Solución:** Verificar que las URLs sean correctas y accesibles

---

**Última actualización:** Diciembre 2025
**Estado:** Listo para producción testnet ✅


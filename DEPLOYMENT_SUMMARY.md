# 🚀 Resumen de Despliegue - MetaPredict

## ✅ Lo que está Listo

### 1. Configuración de Cron Job
- ✅ `frontend/vercel.json` configurado con cron cada 5 minutos
- ✅ `vercel.json` actualizado con configuración de cron
- ✅ Endpoint `/api/cron/oracle-check` funcionando

### 2. Configuración de Gelato
- ✅ Servicio de Gelato configurado y verificado
- ✅ Endpoint `/api/gelato/check-config` para verificar estado
- ✅ Manejo de errores mejorado con mensajes claros
- ✅ Fallback automático si Gelato no funciona

### 3. Scripts de Resolución Manual
- ✅ `resolve-all-pending-markets.ts` - Resuelve todos los mercados pendientes
- ✅ `resolve-market-manual.ts` - Resuelve un mercado específico

### 4. Automatización
- ✅ GitHub Actions workflow para ejecutar script manual cada 10 minutos
- ✅ Cron job de Vercel cada 5 minutos

## 📋 Pasos para Desplegar

### Paso 1: Configurar Variables de Entorno en Vercel

**⚠️ IMPORTANTE:** Lee `VERCEL_ENV_VARIABLES.md` para la lista completa y detallada de todas las variables.

**Opción A: Dashboard de Vercel (Recomendado)**
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto → **Settings** → **Environment Variables**
3. Agrega todas las variables listadas en `VERCEL_ENV_VARIABLES.md`
4. Asegúrate de seleccionar los ambientes correctos (Production, Preview, Development)

**Opción B: Script Automático**
```powershell
# Windows
.\scripts\vercel-env-setup.ps1

# Linux/Mac
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

**Opción C: Vercel CLI**
```bash
vercel env add VARIABLE_NAME production
```

**Variables Críticas (Mínimas para funcionar):**
```bash
# Contratos (Frontend)
NEXT_PUBLIC_CORE_CONTRACT_ADDRESS=0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xA65bE35D25B09F7326ab154E154572dB90F67081
NEXT_PUBLIC_CHAIN_ID=5611

# RPC (Backend)
RPC_URL_TESTNET=https://opbnb-testnet-rpc.bnbchain.org

# IA (Backend - Requerido)
GEMINI_API_KEY=tu_api_key
GOOGLE_API_KEY=tu_api_key

# Backend URL (Backend)
BACKEND_URL=https://tu-dominio.vercel.app/api/oracle/resolve

# Security (Backend)
CRON_SECRET=genera_un_secreto_aleatorio_aqui

# Thirdweb (Frontend)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id
```

### Paso 2: Desplegar en Vercel

**Opción A: Desde GitHub (Recomendado)**
1. Conecta tu repositorio en https://vercel.com/new
2. Vercel detectará automáticamente Next.js
3. Haz clic en **Deploy**

**Opción B: Desde CLI**
```bash
npm i -g vercel
vercel login
cd frontend
vercel --prod
```

### Paso 3: Verificar Cron Job

1. Ve a **Vercel Dashboard → Settings → Cron Jobs**
2. Deberías ver:
   - Path: `/api/cron/oracle-check`
   - Schedule: `*/5 * * * *`
   - Status: Active

### Paso 4: Probar Endpoints

```bash
# Verificar Gelato
curl https://tu-dominio.vercel.app/api/gelato/check-config

# Probar cron job
curl https://tu-dominio.vercel.app/api/cron/oracle-check
```

## 📊 Monitoreo

### Ver Logs en Vercel

1. **Dashboard:** Vercel Dashboard → Tu Proyecto → Logs
2. **CLI:** `vercel logs tu-proyecto --follow`
3. **Filtrar por:** `EventMonitor`, `Gelato`, `oracle-check`

### Qué Buscar

**✅ Éxito:**
```
[EventMonitor] ✅ Gelato Relay task created
[EventMonitor] Market X will be resolved via Gelato Relay
```

**⚠️ Gelato No Soportado:**
```
[EventMonitor] ⚠️ Gelato Relay failed: Gelato Relay may not support opBNB Testnet
[EventMonitor] 💡 Market X needs manual resolution
```

## 🔄 Si Gelato Falla

### Opción 1: GitHub Actions (Automático)

1. Ve a **GitHub → Settings → Secrets and variables → Actions**
2. Agrega estos secrets:
   - `PRIVATE_KEY`
   - `RPC_URL_TESTNET`
   - `AI_ORACLE_ADDRESS`
   - `BACKEND_URL` (opcional)

3. El workflow `.github/workflows/resolve-markets.yml` se ejecutará automáticamente cada 10 minutos

### Opción 2: Script Manual (Cuando Sea Necesario)

```bash
cd smart-contracts
pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
```

## 📚 Documentación Completa

- **Variables de Entorno:** `VERCEL_ENV_VARIABLES.md` ⭐ **LEER PRIMERO**
- **Despliegue:** `smart-contracts/docs/VERCEL_DEPLOYMENT.md`
- **Monitoreo:** `smart-contracts/docs/MONITORING_GUIDE.md`
- **Gelato:** `smart-contracts/docs/GELATO_CONFIGURATION_CHECK.md`
- **Cron Job:** `smart-contracts/docs/CRON_JOB_SETUP.md`
- **Checklist:** `smart-contracts/docs/DEPLOYMENT_CHECKLIST.md`
- **Scripts:** `scripts/vercel-env-setup.ps1` (Windows) y `scripts/setup-vercel-env.sh` (Linux/Mac)

## 🎯 Resultado Final

Después de completar estos pasos:

1. ✅ El cron job se ejecutará cada 5 minutos automáticamente
2. ✅ Intentará resolver mercados usando Gelato Relay
3. ✅ Si Gelato falla, registrará el error pero continuará
4. ✅ GitHub Actions ejecutará el script manual cada 10 minutos como fallback
5. ✅ Puedes ejecutar el script manual cuando sea necesario

## 🆘 Troubleshooting Rápido

**Problema:** Cron job no se ejecuta
- ✅ Verifica que `frontend/vercel.json` esté en el repositorio
- ✅ Verifica que el proyecto esté desplegado

**Problema:** Gelato falla siempre
- ✅ Normal si Gelato no soporta opBNB Testnet
- ✅ Usa GitHub Actions o script manual como fallback

**Problema:** Variables de entorno no funcionan
- ✅ Verifica que estén configuradas en Vercel
- ✅ Redespliega después de agregar variables


# Guía de Despliegue en Vercel con Cron Job

Esta guía te ayudará a desplegar MetaPredict en Vercel con el cron job configurado para resolver mercados automáticamente.

## 📋 Prerequisitos

1. Cuenta de Vercel (gratuita): https://vercel.com
2. Repositorio en GitHub/GitLab/Bitbucket
3. Variables de entorno configuradas

## 🚀 Paso 1: Preparar el Repositorio

### 1.1 Verificar Archivos de Configuración

Asegúrate de que estos archivos existan:

- ✅ `vercel.json` (en la raíz) - Configuración de build
- ✅ `frontend/vercel.json` - Configuración del cron job
- ✅ `.gitignore` - Para excluir `.env.local`

### 1.2 Estructura de Archivos

```
MetaPredict/
├── vercel.json                    # Configuración de build
├── frontend/
│   ├── vercel.json                # Cron job config
│   ├── package.json
│   └── ...
└── smart-contracts/
    └── ...
```

## 🔧 Paso 2: Configurar Variables de Entorno en Vercel

### 2.1 Variables Obligatorias

Ve a **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables** y configura:

#### Variables del Contrato:
```
NEXT_PUBLIC_CORE_CONTRACT_ADDRESS=0x5eaa77CC135b82c254F1144c48f4d179964fA0b1
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0xA65bE35D25B09F7326ab154E154572dB90F67081
NEXT_PUBLIC_CHAIN_ID=5611
```

#### Variables de RPC:
```
RPC_URL_TESTNET=https://opbnb-testnet-rpc.bnbchain.org
```

#### Variables de Gelato (Opcional pero Recomendado):
```
GELATO_RELAY_API_KEY=tu_api_key_aqui
GELATO_AUTOMATE_API_KEY=tu_api_key_aqui
GELATO_RPC_URL_TESTNET=https://opbnb-testnet.gelato.digital/rpc/tu_api_key
```

#### Variables de Backend/IA:
```
GEMINI_API_KEY=tu_api_key_aqui
GOOGLE_API_KEY=tu_api_key_aqui
GROQ_API_KEY=tu_api_key_aqui (opcional)
OPENROUTER_API_KEY=tu_api_key_aqui (opcional)
```

#### Variables de Thirdweb:
```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id_aqui
```

#### Variables del Cron Job (Opcional):
```
CRON_SECRET=tu_secreto_aqui (Vercel lo maneja automáticamente)
```

### 2.2 Configurar para Todos los Entornos

Asegúrate de seleccionar:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

## 📦 Paso 3: Desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)

1. **Conectar Repositorio:**
   - Ve a https://vercel.com/new
   - Conecta tu repositorio de GitHub
   - Selecciona el proyecto `MetaPredict`

2. **Configurar Proyecto:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend` (o deja vacío si el frontend está en la raíz)
   - **Build Command:** `cd frontend && pnpm run build` (o `pnpm run build` si está en la raíz)
   - **Output Directory:** `frontend/.next` (o `.next` si está en la raíz)
   - **Install Command:** `pnpm install --ignore-scripts`

3. **Desplegar:**
   - Haz clic en **Deploy**
   - Vercel construirá y desplegará automáticamente

### Opción B: Desde Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
cd frontend
vercel --prod

# O desde la raíz
vercel --prod --cwd frontend
```

## ✅ Paso 4: Verificar el Cron Job

### 4.1 Verificar en Vercel Dashboard

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings → Cron Jobs**
3. Deberías ver:
   ```
   Path: /api/cron/oracle-check
   Schedule: */5 * * * * (cada 5 minutos)
   Status: Active
   ```

### 4.2 Probar el Cron Job Manualmente

```bash
# Obtener la URL de tu proyecto
# Ejemplo: https://metapredict.vercel.app

# Probar el endpoint
curl https://metapredict.vercel.app/api/cron/oracle-check

# O con autenticación (si configuraste CRON_SECRET)
curl -H "Authorization: Bearer tu_cron_secret" \
  https://metapredict.vercel.app/api/cron/oracle-check
```

### 4.3 Verificar Logs

1. Ve a **Vercel Dashboard → Tu Proyecto → Logs**
2. Busca ejecuciones del cron job
3. Revisa los logs para ver:
   - ✅ Si encuentra mercados pendientes
   - ✅ Si Gelato Relay funciona
   - ⚠️ Si hay errores que requieren resolución manual

## 📊 Paso 5: Monitorear el Sistema

### 5.1 Endpoints de Monitoreo

#### Verificar Configuración de Gelato:
```bash
curl https://tu-dominio.vercel.app/api/gelato/check-config
```

#### Verificar Estado del Cron Job:
```bash
curl https://tu-dominio.vercel.app/api/cron/oracle-check
```

### 5.2 Logs Importantes a Monitorear

Busca estos mensajes en los logs de Vercel:

**✅ Éxito:**
```
[EventMonitor] ✅ Gelato Relay task created: taskId=...
[EventMonitor] Market X will be resolved via Gelato Relay
```

**⚠️ Gelato No Soportado:**
```
[EventMonitor] ⚠️ Gelato Relay failed: Gelato Relay may not support opBNB Testnet
[EventMonitor] 💡 Market X needs manual resolution
```

**❌ Errores:**
```
[EventMonitor] ❌ Error processing resolution for marketId=X
[GelatoService] Error relaying transaction: ...
```

## 🔄 Paso 6: Fallback Manual (Si Gelato Falla)

Si Gelato Relay no funciona con opBNB Testnet, usa el script manual:

### 6.1 Ejecutar Script Manualmente

```bash
cd smart-contracts
pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
```

### 6.2 Automatizar Script Manual (Opcional)

Puedes configurar un cron job en tu servidor o usar GitHub Actions:

**`.github/workflows/resolve-markets.yml`:**
```yaml
name: Resolve Pending Markets

on:
  schedule:
    - cron: '*/10 * * * *'  # Cada 10 minutos
  workflow_dispatch:  # Permite ejecución manual

jobs:
  resolve:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: |
          cd smart-contracts
          pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          RPC_URL_TESTNET: ${{ secrets.RPC_URL_TESTNET }}
          AI_ORACLE_ADDRESS: ${{ secrets.AI_ORACLE_ADDRESS }}
```

## 🐛 Troubleshooting

### Problema: Cron Job No Se Ejecuta

**Solución:**
1. Verifica que `frontend/vercel.json` esté en el repositorio
2. Verifica que el path sea correcto: `/api/cron/oracle-check`
3. Verifica que el endpoint exista en `frontend/app/api/cron/oracle-check/route.ts`

### Problema: Gelato Falla con Error 400

**Causa:** Gelato puede no soportar opBNB Testnet

**Solución:**
- Usa el script manual `resolve-all-pending-markets.ts`
- O configura un GitHub Action para ejecutarlo periódicamente

### Problema: Variables de Entorno No Están Disponibles

**Solución:**
1. Verifica que las variables estén configuradas en Vercel
2. Asegúrate de seleccionar todos los entornos (Production, Preview, Development)
3. Redespliega después de agregar nuevas variables

### Problema: Backend No Responde

**Solución:**
1. Verifica que el endpoint `/api/oracle/resolve` funcione
2. Verifica que las API keys de IA estén configuradas
3. Revisa los logs de Vercel para ver errores específicos

## 📝 Checklist de Despliegue

- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] `vercel.json` y `frontend/vercel.json` presentes
- [ ] Proyecto desplegado exitosamente
- [ ] Cron job visible en Vercel Dashboard → Settings → Cron Jobs
- [ ] Endpoint `/api/cron/oracle-check` responde correctamente
- [ ] Endpoint `/api/gelato/check-config` muestra configuración correcta
- [ ] Logs muestran ejecuciones del cron job
- [ ] Script manual funciona como fallback

## 🔗 Enlaces Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Cron Jobs Docs:** https://vercel.com/docs/cron-jobs
- **Gelato Relay:** https://relay.gelato.network/
- **opBNB Testnet Explorer:** https://testnet.opbnbscan.com/


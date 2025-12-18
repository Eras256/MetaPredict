# Configuración del Cron Job de Vercel para Resolución Automática

Este documento explica cómo configurar el cron job de Vercel para resolver automáticamente los mercados que están en estado "Resolving".

## 📋 Requisitos Previos

1. **Proyecto desplegado en Vercel**
2. **Variables de entorno configuradas** (ver abajo)
3. **Backend funcionando** (para obtener consenso de IAs)

## 🔧 Configuración

### 1. Archivo `vercel.json`

El archivo `frontend/vercel.json` ya está configurado con el cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/oracle-check",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Horario**: Se ejecuta cada 5 minutos (`*/5 * * * *`)

### 2. Variables de Entorno Requeridas en Vercel

Configura las siguientes variables de entorno en el dashboard de Vercel:

#### Variables Obligatorias:
- `NEXT_PUBLIC_AI_ORACLE_ADDRESS` - Dirección del contrato AIOracle
- `NEXT_PUBLIC_CORE_CONTRACT_ADDRESS` - Dirección del contrato PredictionMarketCore
- `NEXT_PUBLIC_CHAIN_ID` - ID de la cadena (5611 para opBNB Testnet)
- `RPC_URL_TESTNET` - URL del RPC de opBNB Testnet

#### Variables Opcionales (para usar Gelato Relay):
- `GELATO_API_KEY` - API Key de Gelato Relay (si quieres usar Gelato para ejecutar transacciones)
- `CRON_SECRET` - Secreto para autenticar el cron job (opcional, Vercel lo maneja automáticamente)

#### Variables para Backend (si está en otro servidor):
- `BACKEND_URL` - URL del backend (si no está en el mismo proyecto)
- `NEXT_PUBLIC_API_URL` - URL alternativa del backend

### 3. Cómo Funciona

1. **Cada 5 minutos**, Vercel ejecuta el endpoint `/api/cron/oracle-check`
2. El endpoint busca eventos `ResolutionRequested` en el contrato AIOracle
3. Para cada evento pendiente:
   - Llama al backend `/api/oracle/resolve` para obtener el consenso de múltiples IAs
   - Usa Gelato Relay (si está configurado) o llama directamente al contrato para ejecutar `fulfillResolutionManual`
4. El mercado pasa de "Resolving" a "Resolved"

### 4. Verificación

Para verificar que el cron job está funcionando:

1. Ve al dashboard de Vercel
2. Navega a tu proyecto → Settings → Cron Jobs
3. Deberías ver el cron job `oracle-check` listado
4. Revisa los logs en la pestaña "Functions" para ver las ejecuciones

### 5. Testing Local

Para probar localmente el endpoint del cron:

```bash
# Ejecutar el servidor de desarrollo
cd frontend
pnpm run dev

# En otra terminal, hacer una petición GET al endpoint
curl http://localhost:3000/api/cron/oracle-check
```

## ⚠️ Limitaciones Actuales

1. **Gelato Relay**: Si no tienes Gelato configurado, el servicio intentará usar Gelato pero fallará. En este caso, necesitas ejecutar manualmente el script `resolve-all-pending-markets.ts`

2. **Backend**: El backend debe estar funcionando para obtener el consenso de IAs. Si el backend no está disponible, el cron job fallará silenciosamente.

3. **Modo Manual**: Actualmente, el sistema está en modo manual porque Chainlink Functions no está disponible en opBNB Testnet. El cron job ayuda pero aún requiere que el backend esté funcionando.

## 🔄 Alternativa: Script Manual

Si el cron job no funciona o prefieres control manual, puedes ejecutar:

```bash
cd smart-contracts
pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
```

Este script:
- Encuentra todos los mercados en estado "Resolving"
- Llama al backend para obtener consenso (o usa valores por defecto)
- Resuelve cada mercado usando `fulfillResolutionManual`

## 📝 Notas

- El cron job se ejecuta cada 5 minutos, por lo que puede haber un retraso máximo de 5 minutos antes de que un mercado se resuelva automáticamente
- Si necesitas resolución inmediata, usa el script manual
- Asegúrate de que el owner del contrato AIOracle tenga suficiente balance de BNB para pagar las transacciones


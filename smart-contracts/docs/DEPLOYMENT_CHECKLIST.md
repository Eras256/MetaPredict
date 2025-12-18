# Checklist de Despliegue y Configuración

## ✅ Pre-Despliegue

### Variables de Entorno en Vercel

- [ ] `NEXT_PUBLIC_CORE_CONTRACT_ADDRESS` = `0x5eaa77CC135b82c254F1144c48f4d179964fA0b1`
- [ ] `NEXT_PUBLIC_AI_ORACLE_ADDRESS` = `0xA65bE35D25B09F7326ab154E154572dB90F67081`
- [ ] `NEXT_PUBLIC_CHAIN_ID` = `5611`
- [ ] `RPC_URL_TESTNET` = `https://opbnb-testnet-rpc.bnbchain.org`
- [ ] `GELATO_RELAY_API_KEY` (opcional pero recomendado)
- [ ] `GELATO_AUTOMATE_API_KEY` (opcional pero recomendado)
- [ ] `GEMINI_API_KEY` (requerido para backend de IA)
- [ ] `GOOGLE_API_KEY` (alternativa a GEMINI_API_KEY)
- [ ] `GROQ_API_KEY` (opcional)
- [ ] `OPENROUTER_API_KEY` (opcional)
- [ ] `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` (requerido)

### Archivos de Configuración

- [ ] `vercel.json` existe en la raíz
- [ ] `frontend/vercel.json` existe con cron job configurado
- [ ] `.gitignore` excluye `.env.local`

## 🚀 Despliegue

- [ ] Repositorio conectado a Vercel
- [ ] Proyecto desplegado exitosamente
- [ ] Build completado sin errores

## ✅ Post-Despliegue

### Verificar Cron Job

- [ ] Cron job visible en Vercel Dashboard → Settings → Cron Jobs
- [ ] Path correcto: `/api/cron/oracle-check`
- [ ] Schedule correcto: `*/5 * * * *` (cada 5 minutos)

### Probar Endpoints

- [ ] `GET /api/gelato/check-config` responde correctamente
- [ ] `GET /api/cron/oracle-check` responde correctamente
- [ ] Endpoints muestran configuración correcta

### Verificar Logs

- [ ] Logs de Vercel accesibles
- [ ] Cron job aparece en los logs
- [ ] No hay errores críticos en los logs

## 🔄 Monitoreo Continuo

### Diario

- [ ] Verificar estado de Gelato
- [ ] Revisar logs del cron job
- [ ] Verificar si hay mercados pendientes

### Semanal

- [ ] Revisar métricas de éxito del cron job
- [ ] Verificar que Gelato funcione (o usar script manual)
- [ ] Ejecutar script manual si es necesario

## 🛠️ Fallback Manual

### Si Gelato No Funciona

- [ ] Configurar GitHub Actions workflow (`.github/workflows/resolve-markets.yml`)
- [ ] Configurar secrets en GitHub:
  - `PRIVATE_KEY`
  - `RPC_URL_TESTNET`
  - `AI_ORACLE_ADDRESS`
- [ ] Verificar que el workflow se ejecute correctamente

### Script Manual

- [ ] Script `resolve-all-pending-markets.ts` funciona correctamente
- [ ] Puede ejecutarse manualmente cuando sea necesario
- [ ] Documentación disponible para el equipo

## 📊 Métricas de Éxito

- [ ] Tasa de éxito del cron job > 80%
- [ ] Tiempo de resolución < 5 minutos (con cron job)
- [ ] No hay mercados atascados en "Resolving" por más de 10 minutos


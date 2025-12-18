# Guía de Monitoreo de Resolución de Mercados

Esta guía te ayudará a monitorear el sistema de resolución automática de mercados y detectar cuando se necesita intervención manual.

## 📊 Métodos de Monitoreo

### 1. Verificar Estado de Gelato

```bash
# Verificar configuración de Gelato
curl https://tu-dominio.vercel.app/api/gelato/check-config
```

**Respuesta esperada:**
```json
{
  "configured": true,
  "apiKeyPresent": true,
  "message": "Gelato is configured. Note: opBNB Testnet support may be limited.",
  "details": {
    "GELATO_RELAY_API_KEY": "✅ Present",
    "GELATO_AUTOMATE_API_KEY": "✅ Present"
  },
  "warnings": [
    "Note: Gelato Relay may not support opBNB Testnet (chainId: 5611)"
  ]
}
```

### 2. Verificar Estado del Cron Job

```bash
# Probar el cron job manualmente
curl https://tu-dominio.vercel.app/api/cron/oracle-check
```

**Respuesta esperada:**
```json
{
  "success": true,
  "timestamp": "2025-12-16T18:34:41.751Z",
  "result": {
    "checked": 5,
    "processed": 2,
    "errors": 0
  }
}
```

### 3. Monitorear Logs en Vercel

#### Opción A: Dashboard de Vercel

1. Ve a **Vercel Dashboard → Tu Proyecto → Logs**
2. Filtra por:
   - `EventMonitor`
   - `Gelato`
   - `resolution`
   - `oracle-check`

#### Opción B: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ver logs en tiempo real
vercel logs tu-proyecto --follow

# Ver logs del cron job específico
vercel logs tu-proyecto --follow | grep -i "EventMonitor\|Gelato\|oracle-check"
```

#### Opción C: API de Vercel

```bash
# Configurar token
export VERCEL_API_TOKEN=tu_token_aqui
# Obtén tu token en: https://vercel.com/account/tokens

# Ver logs recientes
curl -H "Authorization: Bearer $VERCEL_API_TOKEN" \
  "https://api.vercel.com/v2/deployments/{deployment_id}/events" \
  | jq '.events[] | select(.payload.text | contains("EventMonitor"))'
```

## 🔍 Qué Buscar en los Logs

### ✅ Logs de Éxito

```
[EventMonitor] Processing resolution for marketId=15
[EventMonitor] Backend resolved: outcome=1, confidence=85
[EventMonitor] ✅ Gelato Relay task created: taskId=abc123 for marketId=15
[EventMonitor] Market 15 will be resolved via Gelato Relay
```

### ⚠️ Logs de Advertencia (Gelato No Soportado)

```
[EventMonitor] ⚠️ Gelato Relay failed for marketId=15: Gelato Relay may not support opBNB Testnet
[EventMonitor] 💡 Gelato Relay does not support opBNB Testnet (chainId: 5611)
[EventMonitor] 💡 Market 15 needs manual resolution. Run: pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
```

### ❌ Logs de Error

```
[EventMonitor] ❌ Error processing resolution for marketId=15: Backend request failed
[GelatoService] Error relaying transaction: API key is invalid
[EventMonitor] Error checking pending resolutions: Contract not initialized
```

## 📈 Métricas a Monitorear

### 1. Tasa de Éxito del Cron Job

Revisa periódicamente:
- **checked**: Número de eventos `ResolutionRequested` encontrados
- **processed**: Número de mercados resueltos exitosamente
- **errors**: Número de errores

**Fórmula de éxito:** `(processed / checked) * 100`

### 2. Tiempo de Resolución

- **Tiempo ideal:** 15-90 segundos (si Gelato funciona)
- **Tiempo con fallback manual:** Depende de cuándo ejecutes el script

### 3. Mercados Pendientes

Ejecuta periódicamente:
```bash
cd smart-contracts
pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
```

## 🚨 Alertas y Acciones

### Alerta: Gelato Falla Consistentemente

**Síntoma:** Todos los intentos de Gelato fallan con error de chain/network

**Acción:**
1. Confirma que Gelato no soporta opBNB Testnet
2. Configura GitHub Actions para ejecutar el script manual periódicamente
3. O ejecuta el script manualmente cuando sea necesario

### Alerta: Backend No Responde

**Síntoma:** Errores de timeout o 500 del endpoint `/api/oracle/resolve`

**Acción:**
1. Verifica que las API keys de IA estén configuradas
2. Verifica que el backend esté funcionando
3. Revisa los logs del backend para errores específicos

### Alerta: Muchos Mercados Pendientes

**Síntoma:** `checked` es alto pero `processed` es bajo

**Acción:**
1. Ejecuta el script manual inmediatamente
2. Revisa los logs para identificar el problema
3. Considera aumentar la frecuencia del cron job o script manual

## 🔄 Automatización del Script Manual

Si Gelato no funciona, puedes automatizar el script manual usando GitHub Actions:

### Configurar GitHub Actions

1. Crea `.github/workflows/resolve-markets.yml` (ver `VERCEL_DEPLOYMENT.md`)
2. Configura secrets en GitHub:
   - `PRIVATE_KEY`
   - `RPC_URL_TESTNET`
   - `AI_ORACLE_ADDRESS`
   - `BACKEND_URL` (opcional)

3. El workflow se ejecutará automáticamente según el schedule

## 📝 Checklist de Monitoreo Diario

- [ ] Verificar estado de Gelato: `curl /api/gelato/check-config`
- [ ] Verificar ejecución del cron job: `curl /api/cron/oracle-check`
- [ ] Revisar logs de Vercel para errores
- [ ] Verificar mercados pendientes en el explorer
- [ ] Ejecutar script manual si hay mercados pendientes
- [ ] Revisar métricas de éxito del cron job

## 🛠️ Herramientas Útiles

### Script de Monitoreo

Usa el script `monitor-resolution-logs.sh`:

```bash
chmod +x smart-contracts/scripts/monitor-resolution-logs.sh
export VERCEL_API_TOKEN=tu_token
./smart-contracts/scripts/monitor-resolution-logs.sh metapredict
```

### Verificar Mercados Pendientes On-Chain

```bash
cd smart-contracts
pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
```

Este script mostrará:
- Cuántos mercados están en estado "Resolving"
- Intentará resolverlos automáticamente
- Mostrará un resumen al final

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de Vercel
2. Verifica la configuración de Gelato
3. Ejecuta el script manual como fallback
4. Revisa la documentación en `docs/`


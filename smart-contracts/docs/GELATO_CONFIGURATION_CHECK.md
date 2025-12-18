# Verificación de Configuración de Gelato

## 🔍 Estado Actual de la Configuración

### Variables de Entorno Requeridas

1. **GELATO_RELAY_API_KEY** (Recomendado para transacciones patrocinadas)
   - Se usa para ejecutar transacciones sin gas (sponsored calls)
   - Obtén tu API key en: https://relay.gelato.network/

2. **GELATO_AUTOMATE_API_KEY** (Alternativa)
   - Se usa si GELATO_RELAY_API_KEY no está disponible
   - Obtén tu API key en: https://app.gelato.network/

3. **GELATO_RPC_URL_TESTNET** (Opcional)
   - RPC privado de Gelato para mejor rendimiento
   - Formato: `https://opbnb-testnet.gelato.digital/rpc/{API_KEY}`

### ⚠️ Limitaciones Conocidas

**Gelato Relay puede no soportar opBNB Testnet (chainId: 5611)**

Gelato Relay tiene soporte limitado para algunas redes de prueba. Si Gelato no soporta opBNB Testnet, el sistema automáticamente:

1. Intentará usar Gelato Relay primero
2. Si falla, el cron job registrará el error pero continuará
3. Los mercados deberán resolverse manualmente usando el script `resolve-all-pending-markets.ts`

### 🔧 Cómo Verificar la Configuración

#### Opción 1: Endpoint de Verificación (Recomendado)

```bash
# En desarrollo local
curl http://localhost:3000/api/gelato/check-config

# En producción
curl https://tu-dominio.vercel.app/api/gelato/check-config
```

#### Opción 2: Verificar Variables de Entorno

En Vercel Dashboard:
1. Ve a tu proyecto → Settings → Environment Variables
2. Verifica que existan:
   - `GELATO_RELAY_API_KEY` o `GELATO_AUTOMATE_API_KEY`
   - `GELATO_RPC_URL_TESTNET` (opcional)

### 📋 Checklist de Configuración

- [ ] `GELATO_RELAY_API_KEY` configurada en Vercel
- [ ] `GELATO_AUTOMATE_API_KEY` configurada (si no tienes RELAY key)
- [ ] `GELATO_RPC_URL_TESTNET` configurada (opcional pero recomendado)
- [ ] API key obtenida de https://relay.gelato.network/
- [ ] Verificado que la API key tiene permisos para opBNB Testnet (si está soportado)

### 🧪 Prueba de Funcionamiento

Para probar si Gelato Relay funciona con opBNB Testnet:

```bash
# Ejecutar el cron job manualmente
curl -X GET http://localhost:3000/api/cron/oracle-check

# O usar el endpoint de verificación
curl http://localhost:3000/api/gelato/check-config
```

### 🔄 Alternativa si Gelato No Funciona

Si Gelato Relay no soporta opBNB Testnet, el sistema tiene un fallback:

1. **Script Manual**: Ejecuta `resolve-all-pending-markets.ts` periódicamente
2. **Cron Job sin Gelato**: El cron job detectará mercados pendientes pero no podrá resolverlos automáticamente
3. **Resolución Directa**: Usa el script manual cuando sea necesario

### 📝 Notas Importantes

- Gelato Relay requiere que el contrato tenga una función específica o que uses su patrón de "sponsored calls"
- El contrato `AIOracle` tiene la función `fulfillResolutionManual` que puede ser llamada por Gelato
- Sin embargo, Gelato necesita que el contrato esté "whitelisted" o que uses su sistema de pago de gas

### 🚨 Solución Temporal

Si Gelato no funciona en opBNB Testnet, puedes:

1. **Usar el script manual** cada vez que haya mercados pendientes:
   ```bash
   cd smart-contracts
   pnpm hardhat run scripts/resolve-all-pending-markets.ts --network opBNBTestnet
   ```

2. **Configurar un cron job local** o en un servidor que ejecute el script periódicamente

3. **Esperar a que Gelato agregue soporte** para opBNB Testnet (si aún no lo tiene)


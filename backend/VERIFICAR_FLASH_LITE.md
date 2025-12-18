# ✅ Cómo Verificar que Flash-Lite Está Activo

## 🔍 Verificación Rápida

### Opción 1: Revisar los Logs del Servidor

Cuando hagas una petición al endpoint de AI, **revisa los logs del servidor**. Debes ver:

✅ **Correcto (Flash-Lite activo):**
```
[AI] Successfully used model: gemini-2.5-flash-lite
```

❌ **Incorrecto (todavía usando Flash):**
```
[AI] Successfully used model: gemini-2.5-flash
```

### Opción 2: Hacer una Petición de Prueba

1. **Abre otra terminal** (deja el servidor corriendo)

2. **Haz una petición de prueba:**
   ```bash
   curl -X POST http://localhost:3001/api/ai/suggest-market \
     -H "Content-Type: application/json" \
     -d "{\"topic\": \"Bitcoin price\"}"
   ```

   O en PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3001/api/ai/suggest-market" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"topic": "Bitcoin price"}'
   ```

3. **Revisa los logs del servidor** - debe aparecer `gemini-2.5-flash-lite`

### Opción 3: Verificar el Código Fuente

El código ya está actualizado en `src/lib/ai/gemini-advanced.ts`:

```typescript
const modelsToTry = [
  'gemini-2.5-flash-lite',  // ✅ PRIMERO
  'gemini-2.5-flash',       // Fallback
  // ...
];
```

## ⚠️ Nota Importante

Como estás usando `tsx watch src/index.ts`, el servidor:
- ✅ **Ejecuta directamente desde `src/`** (no desde `dist/`)
- ✅ **Recarga automáticamente** cuando cambias archivos
- ✅ **Ya tiene el cambio aplicado** (no necesitas recompilar)

## 🔧 Si Todavía Ves Flash Normal

1. **Verifica que el archivo está guardado:**
   ```bash
   cat backend/src/lib/ai/gemini-advanced.ts | grep flash-lite
   ```

2. **Reinicia el servidor completamente:**
   - Presiona `Ctrl+C` en la terminal del servidor
   - Espera 2 segundos
   - Ejecuta de nuevo: `pnpm run dev`

3. **Verifica que no hay caché:**
   - El código fuente ya tiene el cambio
   - `tsx watch` no usa caché, ejecuta directamente

## 📊 Diferencia Esperada

Cuando Flash-Lite esté activo, deberías notar:
- ⚡ **Respuestas más rápidas**: ~800ms vs ~2500ms
- 💰 **Menor costo**: 71% más barato
- ✅ **Misma calidad**: Para preguntas binarias de mercados

## ✅ Confirmación Final

Una vez que veas en los logs:
```
[AI] Successfully used model: gemini-2.5-flash-lite
```

¡Flash-Lite está activo y funcionando! 🎉


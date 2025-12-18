# 🔄 Cómo Reiniciar el Servidor para Aplicar Flash-Lite

## ⚠️ Problema
El servidor sigue usando `gemini-2.5-flash` en lugar de `gemini-2.5-flash-lite` porque el código compilado está en caché.

## ✅ Solución

### Opción 1: Reinicio Completo (Recomendado)

1. **Detener el servidor completamente**:
   ```bash
   # Presiona Ctrl+C en la terminal donde corre el servidor
   # O mata el proceso:
   taskkill /F /IM node.exe
   ```

2. **Limpiar el caché de Node.js** (opcional pero recomendado):
   ```bash
   cd backend
   rm -rf node_modules/.cache
   # O en Windows PowerShell:
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   ```

3. **Recompilar el código**:
   ```bash
   cd backend
   npm run build
   ```

4. **Reiniciar el servidor**:
   ```bash
   cd backend
   npm run dev
   # O en producción:
   npm start
   ```

### Opción 2: Reinicio Rápido

Si estás usando `npm run dev` (tsx watch), simplemente:
1. Guarda cualquier archivo TypeScript
2. El servidor debería recargarse automáticamente
3. Si no, presiona Ctrl+C y vuelve a ejecutar `npm run dev`

### Opción 3: Verificar que el Cambio Está Aplicado

Después de reiniciar, verifica en los logs que aparezca:
```
[AI] Successfully used model: gemini-2.5-flash-lite
```

En lugar de:
```
[AI] Successfully used model: gemini-2.5-flash
```

## 🔍 Verificación

1. **Haz una petición de prueba**:
   ```bash
   curl -X POST http://localhost:3001/api/ai/suggest-market \
     -H "Content-Type: application/json" \
     -d '{"topic": "Bitcoin price"}'
   ```

2. **Revisa los logs** del servidor:
   - Debe aparecer: `[AI] Successfully used model: gemini-2.5-flash-lite`
   - NO debe aparecer: `gemini-2.5-flash` (a menos que Flash-Lite falle)

## 📝 Nota Importante

Si después de reiniciar **todavía** ves `gemini-2.5-flash` en los logs, puede ser porque:

1. **Flash-Lite falló** y el sistema hizo fallback a Flash (esto es normal y esperado)
2. **El código no se recompiló** correctamente
3. **Hay múltiples instancias** del servidor corriendo

En el caso #1, es normal. El sistema intentará Flash-Lite primero, y si falla, usará Flash como respaldo.

## ✅ Confirmación

Una vez reiniciado correctamente, deberías ver en los logs:
- ✅ `gemini-2.5-flash-lite` como modelo principal
- ✅ Respuestas más rápidas (~800ms vs ~2500ms)
- ✅ Menor costo por request


# Solución: Error 500 en /api/oracle/resolve

## 🔴 Problemas Identificados

### 1. GEMINI_API_KEY no está en Production
```
⚠️ GEMINI_API_KEY is not set in environment variables
```

### 2. OPENROUTER_API_KEY inválida o no configurada
```
OpenRouter Mistral error: User not found
```

### 3. NODE_ENV incorrecto
```
NODE_ENV was incorrectly set to "development"
```

---

## ✅ Solución Paso a Paso

### Paso 1: Configurar GEMINI_API_KEY en Production

1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Busca `GEMINI_API_KEY`
3. Verifica que esté marcada para **Production** ✅
4. Si solo está en Preview/Development:
   - Haz clic en **Edit**
   - Marca **Production** ✅
   - Guarda

**O si no existe:**
- Haz clic en **Add New**
- Nombre: `GEMINI_API_KEY`
- Valor: [tu-api-key-de-gemini]
- Entorno: **Production** ✅
- Guarda

**Obtener API Key:**
- Ve a https://aistudio.google.com/app/apikey
- Crea o copia tu API key
- Pégala en Vercel (sin espacios)

---

### Paso 2: Verificar/Corregir OPENROUTER_API_KEY

1. Ve a Vercel Dashboard → Environment Variables
2. Busca `OPENROUTER_API_KEY`
3. Verifica que:
   - Esté marcada para **Production** ✅
   - El valor sea correcto (formato: `sk-or-v1-...`)

**Si el error persiste:**
- Ve a https://openrouter.ai/keys
- Verifica que tu API key esté activa
- Si es necesario, genera una nueva
- Actualiza en Vercel

**Formato correcto:**
```
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
```

---

### Paso 3: Verificar GROQ_API_KEY

1. Busca `GROQ_API_KEY` en Vercel
2. Verifica que esté en **Production** ✅
3. Formato correcto: `gsk_...`

---

### Paso 4: Corregir NODE_ENV

1. Busca `NODE_ENV` en Vercel
2. **Para Production:**
   - Valor debe ser: `production` (sin comillas)
   - Entorno: **Production** ✅
3. **Para Preview:**
   - Puede ser `preview` o `production`
4. **Para Development:**
   - Puede ser `development`

**IMPORTANTE:** En Production debe ser exactamente `production` (minúsculas, sin espacios)

---

## 📋 Checklist de Variables en Production

Verifica que estas variables estén configuradas para **Production**:

- [ ] `GEMINI_API_KEY` ⚠️ CRÍTICA
- [ ] `GOOGLE_API_KEY` (opcional, puede ser igual a GEMINI_API_KEY)
- [ ] `GROQ_API_KEY` ⚠️ IMPORTANTE
- [ ] `OPENROUTER_API_KEY` ⚠️ IMPORTANTE
- [ ] `NODE_ENV=production` ⚠️ CRÍTICA

---

## 🧪 Verificación Post-Configuración

Después de configurar todo:

1. **Redeploy en Vercel:**
   - Ve a Deployments
   - Haz clic en **Redeploy** del último deployment

2. **Probar el endpoint:**
   ```bash
   curl -X POST https://www.metapredict.fun/api/oracle/resolve \
     -H "Content-Type: application/json" \
     -d '{"marketDescription": "Will Bitcoin reach $100k by 2025?", "priceId": null}'
   ```

3. **Verificar respuesta:**
   Debe retornar JSON con:
   ```json
   {
     "outcome": 1,
     "confidence": 85,
     "consensusCount": 3,
     "totalModels": 3,
     "votes": {...}
   }
   ```

---

## 🔍 Verificar Logs Después del Redeploy

1. Ve a Vercel Dashboard → Tu Proyecto → Logs
2. Busca llamadas a `/api/oracle/resolve`
3. Debe aparecer:
   - ✅ `[ConsensusService] ✅ Gemini responded: ...`
   - ✅ `[ConsensusService] ✅ Groq Llama 3.1 responded: ...`
   - ✅ `[ConsensusService] ✅ OpenRouter Mistral responded: ...`
4. NO debe aparecer:
   - ❌ `⚠️ GEMINI_API_KEY is not set`
   - ❌ `User not found`
   - ❌ `All AIs failed`

---

## 🆘 Troubleshooting

### Error persiste después de configurar GEMINI_API_KEY

**Causa:** Puede haber espacios o caracteres extra en la API key

**Solución:**
1. Elimina la variable completamente
2. Vuelve a crearla desde cero
3. Copia la API key directamente desde Google AI Studio
4. Pega sin espacios ni saltos de línea
5. Guarda y redeploy

### OpenRouter sigue dando "User not found"

**Causa:** La API key puede estar deshabilitada o ser inválida

**Solución:**
1. Ve a https://openrouter.ai/keys
2. Verifica que la key esté activa
3. Si es necesario, genera una nueva
4. Actualiza en Vercel
5. Espera 1-2 minutos y prueba de nuevo

### Todas las IAs fallan

**Causa:** Puede ser un problema de timeout o rate limits

**Solución:**
1. Verifica que todas las API keys sean válidas
2. Espera unos minutos (puede ser rate limit)
3. Prueba de nuevo
4. Si persiste, revisa los logs completos en Vercel

---

## ✅ Resultado Esperado

Una vez configurado correctamente:

1. ✅ El workflow de GitHub Actions llamará al backend
2. ✅ El backend consultará Gemini, Groq y OpenRouter
3. ✅ Obtendrá un consenso real de las 3-5 IAs
4. ✅ Retornará `outcome` y `confidence` reales
5. ✅ El mercado se resolverá con el consenso real, no valores por defecto

---

**Última actualización:** Diciembre 2025
**Estado:** Listo para resolver con consenso real ✅


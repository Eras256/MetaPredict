# Solución: Error NEXT_PUBLIC_THIRDWEB_CLIENT_ID

## 🔴 Problema Identificado

El error ocurre porque:
1. **La variable está configurada solo para "Preview"** pero no para "Production"
2. **El dominio no está autorizado** en Thirdweb Dashboard

## ✅ Solución Paso a Paso

### Paso 1: Configurar la Variable en Production

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto "MetaPredict"
3. Ve a **Settings** → **Environment Variables**
4. Busca `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
5. Haz clic en los tres puntos (`...`) → **Edit**
6. **IMPORTANTE:** Asegúrate de que esté marcado:
   - ✅ **Production**
   - ✅ **Preview** (opcional, pero recomendado)
   - ❌ **Development** (opcional)

7. Si la variable solo está en Preview:
   - Haz clic en **Add Another** o crea una nueva entrada
   - Nombre: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
   - Valor: [tu-client-id-sin-espacios]
   - Entorno: **Production** ✅
   - Guarda

### Paso 2: Verificar que el Valor sea Correcto

⚠️ **IMPORTANTE:** Asegúrate de que el valor NO tenga:
- Espacios al inicio o final
- Saltos de línea
- Caracteres especiales extra

**Formato correcto:**
```
2221212121
```

**Formato incorrecto:**
```
 2221212121 
2221212121\n
```

### Paso 3: Autorizar el Dominio en Thirdweb Dashboard

1. Ve a https://thirdweb.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (o crea uno nuevo si no tienes)
4. Ve a **Settings** o **Configuration**
5. Busca la sección **Allowed Domains** o **Authorized Domains**
6. Agrega los siguientes dominios:
   - `www.metapredict.fun`
   - `metapredict.fun`
   - `*.vercel.app` (para preview deployments)
   - `metapredict-*.vercel.app` (específico para tu proyecto)

### Paso 4: Obtener el Client ID (si no lo tienes)

Si no tienes un Client ID válido:

1. Ve a https://thirdweb.com/dashboard
2. Haz clic en **Create Project** o selecciona uno existente
3. Ve a **Settings** → **API Keys**
4. Copia el **Client ID** (formato: números como `2221212121`)
5. Pega este valor en Vercel como `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`

### Paso 5: Redeploy en Vercel

Después de configurar todo:

1. Ve a **Deployments** en Vercel
2. Haz clic en los tres puntos del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo commit y push

## 🔍 Verificación

Después del redeploy, verifica:

1. **En la consola del navegador:**
   - No debe aparecer el error de `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
   - No debe aparecer el error de "source has not been authorized"

2. **En la aplicación:**
   - Debe poder conectarse a wallets
   - Los botones de conexión deben funcionar

## 🆘 Troubleshooting

### Error persiste después del redeploy

**Causa:** La variable puede tener espacios o caracteres extra

**Solución:**
1. Elimina la variable completamente en Vercel
2. Vuelve a crearla desde cero
3. Copia el Client ID directamente desde Thirdweb Dashboard
4. Pega sin espacios ni saltos de línea
5. Guarda y redeploy

### Error: "source has not been authorized"

**Causa:** El dominio no está en la lista de dominios autorizados en Thirdweb

**Solución:**
1. Ve a Thirdweb Dashboard
2. Agrega `www.metapredict.fun` a los dominios autorizados
3. Espera unos minutos para que se propague
4. Recarga la página

### La variable está en Production pero sigue fallando

**Causa:** Puede ser un problema de caché o build

**Solución:**
1. En Vercel, ve a **Deployments**
2. Elimina el deployment actual
3. Haz un nuevo deployment desde cero
4. O espera unos minutos y recarga la página

## 📋 Checklist Final

- [ ] `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` está configurada para **Production** ✅
- [ ] El valor no tiene espacios ni saltos de línea ✅
- [ ] El dominio `www.metapredict.fun` está autorizado en Thirdweb Dashboard ✅
- [ ] Se hizo un redeploy después de los cambios ✅
- [ ] La aplicación funciona sin errores en la consola ✅

## 💡 Notas Adicionales

1. **Client ID es gratuito:** No necesitas pagar por el Client ID de Thirdweb
2. **Múltiples entornos:** Puedes usar el mismo Client ID para Production y Preview
3. **Dominios wildcard:** Usa `*.vercel.app` para cubrir todos los preview deployments
4. **Tiempo de propagación:** Los cambios en Thirdweb pueden tardar 1-2 minutos en aplicarse

---

**Si el problema persiste después de seguir estos pasos, comparte:**
- Captura de pantalla de la configuración de la variable en Vercel (mostrando los entornos seleccionados)
- Captura de pantalla de los dominios autorizados en Thirdweb Dashboard
- El error exacto que aparece en la consola del navegador

